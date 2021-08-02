import './Proof.css';
import React, { useState, useReducer, useEffect } from 'react';
import StellarSdk from 'stellar-sdk'
import albedo from '@albedo-link/intent'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faCoffee } from '@fortawesome/free-solid-svg-icons'
import {isValidSig} from '../../lib/utils.js'
import {badgeDetails} from '../../lib/badgeDetails.js'
import Grid from '../Grid/Grid'
import Export from '../Export/Export'
import Cover from '../Cover/Cover'
import Modal from '../Modal/Modal'

const initialState = {
  pubkey: '',
  all_assets: [...badgeDetails],
  user_assets: [],
  display_assets: [],
  monochrome: true,
  events: true,
  missing: true,
  export: false,
  verification_text: '',
  message_signature: '',
  server_signature: '',
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
    case 'toggle_export':
      newState.export = action.export
      return newState
    case 'verify_text':
      newState.verification_text = action.verification_text
      return newState
    case 'signed_message':
      newState.message_signature = action.message_signature
      return newState
    case 'server_signed':
      newState.server_signature = action.server_signature
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

  async function signProofText() {
    let message = quester.verification_text
    let keypair = StellarSdk.Keypair.fromSecret("SCGAMDAF6H3GLU7HAZ3HSPBUT77RJRTILASKN4LJLVEOPY3A327LOOUY")
    await albedo.signMessage({
      message: message,
    }).then(
      res => {
        console.log(res)
        if (isValidSig(quester.pubkey, message, res.message_signature)) {
          setQuester({message_signature: res.message_signature, type: 'signed_message'})
          toggleExportState()
          let serverSig = keypair.sign(message).toString('base64')
          console.log(serverSig)
          setQuester({server_signature: serverSig, type: 'server_signed'})
        }
      }
    )
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

  function toggleExportState(e) {
    setQuester({export: !quester.export, type: 'toggle_export'})
  }

  function addVerificationText(text) {
    setQuester({verification_text: text, type: 'verify_text'})
  }

  const hideImages = (badges) => {
    let imgArray = []
    badges.forEach((badge, i) => {
      imgArray.push(<img src={"/assets/badges/" + badge.filename} ref={badge.issuer} className="d-none" />)
    })
    return imgArray
  }
  // let keypair = StellarSdk.Keypair.fromSecret("SCGAMDAF6H3GLU7HAZ3HSPBUT77RJRTILASKN4LJLVEOPY3A327LOOUY")
  // // console.log(keypair)
  // let hexSig = keypair.sign(quester.verification_text)
  // console.log(hexSig)
  // console.log(hexSig.toString('base64'))
  // console.log(Buffer.from(hexSig.toString('base64'), 'base64'))
  // console.log(keypair.verify(quester.verification_text, hexSig))

  return (
    <div>
      <div className="container-fluid bg-dark" id="header-div">
        <header className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-4">
          <h6>
            <img src="/assets/logo.svg" />
            <span>Stellar Quest <small className="text-muted">Badge Checker</small></span>
          </h6>

          <div className="col-lg-4 text-end">
            { quester.pubkey && !quester.export ?
            <div className="dropdown">
              <button className="btn btn-secondary dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-bs-toggle="dropdown" aria-expanded="false">
                Filter
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
            </div> : null
            }
            {
              !quester.export && quester.pubkey
                ? <button type="button" className="btn btn-success" data-bs-toggle="modal" data-bs-target="#verificationModal">Export Proof</button>
                : quester.pubkey && quester.export
                ? <button type="button" className="btn btn-success" onClick={toggleExportState}>Back to Badges</button>
                : null
            }
            { !quester.pubkey
                ? <button type="button" className="btn btn-primary" onClick={login}>Connect Albedo</button>
                : <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>{quester.pubkey.substr(0,4) + "..." + quester.pubkey.substr(-4,4)}</button>
            }
          </div>
        </header>
      </div>
      { quester.export && <Export
                            verText={quester.verification_text}
                            badges={quester.display_assets}
                            pubkey={quester.pubkey}
                            sig={quester.message_signature} 
                            serverSig={quester.server_signature} /> }
      { quester.pubkey && !quester.export ?
        <div className="container">
          <Grid badges={quester.display_assets} pubkey={quester.pubkey} />
        </div> : null
      }
      { !quester.pubkey ?
        <div className="container">
          <Cover login={login}/>
        </div> : null
      }
      <Modal
        setQuester={setQuester}
        toggleExportState={toggleExportState}
        signProofText={signProofText} />
    </div>
  )
}
