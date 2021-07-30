import React, { useReducer, useEffect } from 'react';
import StellarSdk from 'stellar-sdk'
import albedo from '@albedo-link/intent'
import {isValidSig} from '../../lib/utils.js'
import {badgeDetails} from '../../lib/badgeDetails.js'
import Grid from '../Grid/Grid'

// const badgeAssetCodes = badgeDetails.reduce((acc, item) => acc.concat(item.code), [])
// console.log(badgeAssetCodes)

const initialState = {
  pubkey: '',
  all_assets: [...badgeDetails],
  user_assets: [],
  display_assets: [],
  monochrome: true,
  events: true,
  missing: true,
}

function questerReducer(state = initialState, action) {
  let newState = {...state}
  switch (action.type) {
    case 'login':
      newState.pubkey = action.pubkey
      return newState
    case 'fill_assets':
      newState.all_assets = action.all_assets
      newState.user_assets = action.user_assets
      return newState
    case 'display_assets':
      newState.display_assets = action.display_assets
      return newState
    case 'toggle_monochrome':
      newState.monochrome = action.monochrome
      return newState
    case 'toggle_events':
      newState.events = action.events
      return newState
    case 'toggle_missing':
      newState.missing = action.missing
      return newState
    default:
      return state
  }
}

export default function Proof() {
  const [quester, setQuester] = useReducer(questerReducer, initialState)

  // componenntDidUpdate((prevProps, prevState) => {
  //   if (quester.monochrome !== prevState.monochrome) {
  //     getQuestPayments(quester.pubkey)
  //   }
  // })

  useEffect(() => {
    filterAssets(quester.all_assets)
  }, [quester.monochrome, quester.events, quester.missing])

  async function login() {
    let tokenToSign = 'QWxsIGhhaWwgQGthbGVwYWlsIQ=='
    await albedo.publicKey({
      token: tokenToSign
    })
    .then(res => {
      if (isValidSig(res.pubkey, tokenToSign, res.signature)) {
        setQuester({pubkey: res.pubkey, type: 'login'})
      }
      return res.pubkey
    }).then(pubkey => {
      getQuestPayments(pubkey)
    })
  }

  async function getQuestPayments(pubkey) {
    let server = new StellarSdk.Server('https://horizon.stellar.org')
    await server.payments().forAccount(pubkey).limit(200).call()
    .then(res => {
      let rec = res.records
        .filter(item => item.type === 'payment' && item.asset_type !== 'native')
        .filter(item => badgeDetails.find(({code, issuer}) => item.asset_code === code && item.from === issuer))
      let allAssets = badgeDetails
        .map(item => {
          let thisRecord = rec.find(({asset_code, from}) => item.code === asset_code && item.issuer === from)
          if (thisRecord) {
            item.owned = true
            item.date = new Date(thisRecord.created_at).toISOString().split('T')[0]
            item.link = thisRecord._links.transaction.href
            getPrizeTransaction(item.link).then(prize => {
              if (prize) {
                item.prize = prize
              }
            })
            return item
          } else {
            return item
          }
        })
      let userAssets = allAssets.filter(item => item.owned === true)
      // let a = allAssets
      // if (!quester.monochrome) {
      //   a = allAssets
      //     .filter(item => item.monochrome !== true)
      // }
      // if (!quester.events) {
      //   a = allAssets
      //     .filter(item => item.code !== 'SSQ01')
      // }
      // if (!quester.missing) {
      //   a = allAssets
      //     .filter(item => item.owned === true)
      // }
      setQuester({all_assets: allAssets, user_assets: userAssets, type: 'fill_assets'})
      filterAssets(allAssets)
      // setQuester({display_assets: filterAssets(allAssets), type: 'display_assets'})
    })
  }

  async function getPrizeTransaction(link) {
    let res = await fetch(link + "/operations")
    let json = await res.json()
    let prizeRecord = json._embedded.records
      .filter(item => item.hasOwnProperty('asset_type') && item.asset_type === 'native')
    return prizeRecord.length > 0 ? parseInt(prizeRecord[0].amount) : false
  }

  function toggleMonochromeBadges(e) {
    setQuester({monochrome: e.target.checked, type: 'toggle_monochrome'})
  }

  function toggleEventBadges(e) {
    setQuester({events: e.target.checked, type: 'toggle_events'})
  }

  function toggleMissingBadges(e) {
    setQuester({missing: e.target.checked, type: 'toggle_missing'})
  }

  function filterAssets(allAssets) {
    let filteredAssets = [...allAssets]
    // console.log("I'm filtering!")
    // console.log(filteredAssets)
    if (!quester.monochrome) {
      console.log("monochrome setting is " + quester.monochrome)
      filteredAssets = filteredAssets
        .filter(item => item.monochrome !== true)
    }
    if (!quester.events) {
      filteredAssets = filteredAssets
        .filter(item => item.special !== true)
    }
    if (!quester.missing) {
      filteredAssets = filteredAssets
        .filter(item => item.owned === true)
    }
    // return filteredAssets
    setQuester({display_assets: filteredAssets, type: 'display_assets'})
  }

  return (
    <div className="container">
      <div className="row">
        <div>Prove yourself as a worthy Quester!</div>
        <p>Your Public Key: <code>{quester.pubkey}</code></p>
        { !quester.pubkey ? <button type="button" className="btn btn-primary" onClick={login}>Login With Albedo</button> : null }
        { /*quester.pubkey ? <button type="button" className="btn btn-success" onClick={() => getQuestPayments(quester.pubkey)}>See My Badges</button> : null */}
        <div className="form-check form-switch">
          <input onChange={toggleMonochromeBadges} className="form-check-input" type="checkbox" id="includeMonochrome" checked={quester.monochrome} />
          <label className="form-check-label" for="includeMonochrome">Include monochrome badges?</label>
        </div>
        <div className="form-check form-switch">
          <input onChange={toggleEventBadges} className="form-check-input" type="checkbox" id="includeEvents" checked={quester.events} />
          <label className="form-check-label" for="includeEvents">Include special event badges?</label>
        </div>
        <div className="form-check form-switch">
          <input onChange={toggleMissingBadges} className="form-check-input" type="checkbox" id="includeMissing" checked={quester.missing} />
          <label className="form-check-label" for="includeMissing">Include missing badges?</label>
        </div>
      </div>
      <Grid badges={quester.display_assets} />
    </div>
  )
}
