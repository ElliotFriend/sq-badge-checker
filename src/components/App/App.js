import './App.css';
import React, { useState, useReducer, useEffect } from 'react';
import StellarSdk from 'stellar-sdk'
import albedo from '@albedo-link/intent'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from 'react-router-dom'
import Verify from '../Verify/Verify'
import Proof from '../Proof/Proof'
import Cover from '../Cover/Cover'
import Nav from '../Nav/Nav'
import Export from '../Export/Export'
import {badgeDetails} from '../../lib/badgeDetails.js'
import {isValidSig} from '../../lib/utils.js'

const initialState = {
  pubkey: '',
  logged_in: false,
  all_assets: [...badgeDetails],
  user_assets: [],
  display_assets: [],
  monochrome: true,
  events: true,
  missing: true,
  export: false,
  verification_text: '',
  message_signature: '',
}

function questerReducer(state = initialState, action) {
  let newState = {...state}
  switch (action.type) {
    case 'login':
      newState.pubkey = action.pubkey
      newState.logged_in = true
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
    default:
      return state
  }
}

function App() {
  const [quester, setQuester] = useReducer(questerReducer, initialState)

  useEffect(() => {
    filterAssets(quester.all_assets)
  }, [quester.monochrome, quester.events, quester.missing, quester.user_assets])

  function toggleExportState(e) {
    setQuester({export: !quester.export, type: 'toggle_export'})
  }

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
    })
    // .then(pubkey => {
    //   getQuestPayments(pubkey)
    // })
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
    <Router>
      <div className="App">
        <Nav quester={quester}
             setQuester={setQuester}
             login={login}
             toggleExportState={toggleExportState} />
        <Switch>
          <Route path="/prove/:pubkey?">
            <Proof quester={quester}
                   setQuester={setQuester}
                   loggedIn={quester.logged_in} />
          </Route>
          <Route path="/export/:pubkey">
            <Export badges={quester.display_assets}
                    pubkey={quester.pubkey}
                    verText={quester.verification_text}
                    messSig={quester.message_signature}
                    exportStatus={quester.export}
                    user_assets={quester.user_assets} />
          </Route>
          <Route path="/verify/:basestring?">
            <Verify />
          </Route>
          <Route path="/">
            { quester.pubkey
                ? <Redirect to={"/prove/" + quester.pubkey} />
                : <Cover login={login} />
            }
          </Route>
        </Switch>
        <footer class="footer mt-5 py-3 bg-dark">
          <div class="container">
            <span class="text-muted">Made with plenty of Adderall by <a target="_blank" href="https://github.com/elliotfriend">ElliotFriend</a></span>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
