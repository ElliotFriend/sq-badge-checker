import './Proof.css';
import React, { useReducer, useEffect } from 'react';
import StellarSdk from 'stellar-sdk'
import albedo from '@albedo-link/intent'
import {isValidSig} from '../../lib/utils.js'
import {badgeDetails} from '../../lib/badgeDetails.js'
import Grid from '../Grid/Grid'

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

  useEffect(() => {
    filterAssets(quester.all_assets)
  }, [quester.monochrome, quester.events, quester.missing, quester.user_assets])

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
              if (prize) { item.prize = prize }})
            return item
          } else {
            return item
          }
        })
      let userAssets = allAssets.filter(item => item.owned === true)
      setQuester({all_assets: allAssets, user_assets: userAssets, type: 'fill_assets'})
      filterAssets(allAssets)
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
    if (!quester.monochrome) {
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
    setQuester({display_assets: filteredAssets, type: 'display_assets'})
  }

  return (
    <div>
      <div className="container-fluid bg-dark" id="header-div">
        <header className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-4">
          <h6>
            <img src="/assets/logo.svg" />
            <span>Stellar Quest <small className="text-muted">Badge Checker</small></span>
          </h6>

          <div className="col-lg-3 text-end">
            { !quester.pubkey
                ? <button type="button" className="btn btn-primary" onClick={login}>Connect Albedo</button>
                : <button type="button" className="btn btn-primary font-monospace" onClick={() => window.location.reload()}>{quester.pubkey.substr(0,4) + "..." + quester.pubkey.substr(-4,4)}</button>
            }
            <div className="dropdown">
              <button className="btn btn-secondary dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-bs-toggle="dropdown" aria-expanded="false">
                Filter Settings
              </button>
              <ul className="dropdown-menu" aria-labelledby="dropdownMenuLink">
                <li>
                  <button className="dropdown-item">
                    <div className="form-check form-switch">
                      <input onChange={toggleMonochromeBadges} className="form-check-input" type="checkbox" id="includeMonochrome" checked={quester.monochrome} />
                      <label className="form-check-label" for="includeMonochrome">Include monochrome badges?</label>
                    </div>
                  </button>
                </li>
                <li>
                  <button className="dropdown-item">
                    <div className="form-check form-switch">
                    <input onChange={toggleEventBadges} className="form-check-input" type="checkbox" id="includeEvents" checked={quester.events} />
                    <label className="form-check-label" for="includeEvents">Include special event badges?</label>
                    </div>
                  </button>
                </li>
                <li>
                  <button className="dropdown-item">
                    <div className="form-check form-switch">
                    <input onChange={toggleMissingBadges} className="form-check-input" type="checkbox" id="includeMissing" checked={quester.missing} />
                    <label className="form-check-label" for="includeMissing">Include missing badges?</label>
                    </div>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </header>
      </div>
      <div className="container">
        <Grid badges={quester.display_assets} pubkey={quester.pubkey} />
      </div>
    </div>
  )
}
