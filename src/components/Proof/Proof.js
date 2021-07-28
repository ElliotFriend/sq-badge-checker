import React, { useReducer } from 'react';
import StellarSdk from 'stellar-sdk'
import albedo from '@albedo-link/intent'
import {isValidSig} from '../../lib/utils.js'
import {badgeDetails} from '../../lib/badgeDetails.js'
import Grid from '../Grid/Grid'

// const badgeAssetCodes = badgeDetails.reduce((acc, item) => acc.concat(item.code), [])
// console.log(badgeAssetCodes)

const initialState = {
  pubkey: '',
  assets: [],
  monochrome: false,
}

function questerReducer(state = initialState, action) {
  let newState = {...state}
  switch (action.type) {
    case 'login':
      newState.pubkey = action.pubkey
      return newState
    case 'fill_assets':
      newState.assets = action.assets
      return newState
    case 'toggle_monochrome':
      newState.monochrome = action.monochrome
      return newState
    default:
      return state
  }
}

export default function Proof() {
  const [quester, setQuester] = useReducer(questerReducer, initialState)

  async function login() {
    let tokenToSign = 'QWxsIGhhaWwgQGthbGVwYWlsIQ=='
    await albedo.publicKey({
      token: tokenToSign
    })
    .then(res => {
      if (isValidSig(res.pubkey, tokenToSign, res.signature)) {
        setQuester({pubkey: res.pubkey, type: 'login'})
      }
    })
  }

  // Function to get the assets on the account that match the SQ code and issuer
  // This is working, but I'm not sure if it accurately removes any asset that
  // a user may have purchased...
  async function getQuestAssets(pubkey) {
    let server = new StellarSdk.Server('https://horizon.stellar.org')
    await server.accounts().accountId(pubkey).call()
    .then(res => {
      // console.log(res.balances)
      let r = res.balances
        .filter((item) => badgeDetails.find(({code, issuer}) => item.asset_code === code && item.asset_issuer === issuer))
        // .filter(item => badgeAssetCodes.includes(item.asset_code))
      console.log(r)
    })
  }

  // This works better, by polling the actual payments. But, I'm worried that
  // the `limit()` could bite me in the ass. Perhaps I need to tweak this some,
  // yet...
  async function getQuestPayments(pubkey) {
    let server = new StellarSdk.Server('https://horizon.stellar.org')
    await server.payments().forAccount(pubkey).limit(200).call()
    .then(res => {
      let rec = res.records
        .filter(item => item.type === 'payment' && item.asset_type !== 'native')
        .filter(item => badgeDetails.find(({code, issuer}) => item.asset_code === code && item.from === issuer))
      let allAssets = badgeDetails
        .map(item => {
          if (rec.find(({asset_code, from}) => item.code === asset_code && item.issuer === from)) {
            let thisRecord = rec.find( ({ asset_code }) => item.code === asset_code )
            item.owned = true
            item.date = thisRecord.created_at
            item.link = thisRecord._links.transaction.href
            getQuestPrize(item.link).then(prize => {
              if (prize) {
                item.prize = prize
              }
            })
            // console.log(prize)
            return item
          } else {
            return item
          }
        })
      let a = []
      if (!quester.monochrome) {
        a = allAssets
          .filter(item => item.monochrome !== true)
      } else {
        a = allAssets
      }
      setQuester({assets: a, type: 'fill_assets'})
    })
  }

  async function getQuestPrize(link) {
    let res = await fetch(link + "/operations")
    let json = await res.json()
    let prizeRecord = json._embedded.records
      .filter(item => item.hasOwnProperty('asset_type') && item.asset_type === 'native')
    return prizeRecord.length > 0 ? parseInt(prizeRecord[0].amount) : false
  }

  function toggleMonochromeBadges(e) {
    setQuester({monochrome: e.target.checked, type: 'toggle_monochrome'})
  }

  const populateList = () => {
    let assetList = (quester.assets.length >= 1)
      ? quester.assets.map((item, i) => {
          return (
            <li key={i}>
              {item.code}
            </li>
          )
        })
      : null
    console.log(typeof assetList)
    console.log(assetList)
    return assetList
  }

  return (
    <div className="container">
      <div className="row">
        <div>Prove yourself as a worthy Quester!</div>
        <p>Your Public Key: <code>{quester.pubkey}</code></p>
        <button type="button" className="btn btn-primary" onClick={login}>Prove It!</button>&nbsp;
        <button type="button" className="btn btn-success" onClick={() => getQuestPayments(quester.pubkey)}>Get Assets</button>
        <div className="form-check form-switch">
          <input onChange={toggleMonochromeBadges} className="form-check-input" type="checkbox" id="flexSwitchCheckDefault" checked={quester.monochrome} />
          <label className="form-check-label" for="flexSwitchCheckDefault">Include monochrome Badges?</label>
        </div>
      </div>
      <Grid badges={quester.assets} />
    </div>
  )
}
