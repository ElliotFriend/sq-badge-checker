import './Nav.css';
import React, { useState, useReducer, useEffect } from 'react';
import { Redirect, useHistory } from 'react-router-dom'
import albedo from '@albedo-link/intent'
import { isValidSig } from '../../lib/utils.js'

export default function Nav(props) {
  let history = useHistory()
  let quester = props.quester
  let setQuester = props.setQuester

  function toggleMonochromeBadges(e) {
    setQuester({monochrome: e.target.checked, type: 'toggle_monochrome'})
  }

  function toggleEventBadges(e) {
    setQuester({events: e.target.checked, type: 'toggle_events'})
  }

  function toggleMissingBadges(e) {
    setQuester({missing: e.target.checked, type: 'toggle_missing'})
  }

  async function login() {
    let tokenToSign = 'QWxsIGhhaWwgQGthbGVwYWlsIQ=='
    await albedo.publicKey({
      token: tokenToSign
    })
    .then(res => {
      if (isValidSig(res.pubkey, tokenToSign, res.signature)) {
        props.setQuester({pubkey: res.pubkey, type: 'login'})
        history.push("/prove/" + res.pubkey)
      }
    })
  }

  function logout() {
    setQuester({type: 'logout'})
    history.push('/')
  }

  return (
    <div className="container-fluid bg-dark" id="header-div">
      <header className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-4">
        <a href="/" className="navbar-brand text-reset"><h6>
          <img src="/assets/logo.svg" />
          <span>Stellar Quest <small className="text-muted">Badge Checker</small></span>
        </h6></a>

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
              ? <button type="button" className="btn btn-success" onClick={props.toggleExportState}>Back to Badges</button>
              : null
          }
          { !quester.pubkey
              ? <button type="button" className="btn btn-primary" onClick={props.login}>Connect Albedo</button>
              : <button type="button" className="btn btn-primary" onClick={logout}>{quester.pubkey.substr(0,4) + "..." + quester.pubkey.substr(-4,4)}</button>
          }
        </div>
      </header>
    </div>
  )
}
