import React, { useReducer } from 'react';
import albedo from '@albedo-link/intent'
import {isValidSig} from '../../lib/utils.js'

function loginWithAlbedo() {
  // e.preventDefault();
  albedo.publicKey({
    token: 'WXWO5dYMpIpJCZi6WxPnJ4UILNLtiaW/mXYPaD+Z6mQ='
  })
  .then(res => res)
  console.log("Lasers activated!!!");
  // console.log(e);
}

function questerReducer(state, action) {
  switch (action.type) {
    case 'login':
      // let newState = state.pubkey === '' ? [] : [...state]
      // newState.pubkey = action.pubkey
      // newState.signed_message = action.signed_message
      // newState.signature = action.signature
      // console.log(newState)
      console.log(action)
      return action
    default:
      return state
  }
}

export default function Proof() {
  const [quester, setQuester] = useReducer(questerReducer, [])

  async function login() {
    let tokenToSign = 'QWxsIGhhaWwgQGthbGVwYWlsIQ=='
    await albedo.publicKey({
      token: tokenToSign
    })
    .then(res => {
      if (isValidSig(res.pubkey, tokenToSign, res.signature)) {
        console.log("SUCCESS!")
        setQuester({...res, type: 'login'})
      }
    })
  }

  return (
    <div className="wrapper">
      <div>Prove yourself as a worthy Quester!</div>
      <p>Your Public Key: <pre>{quester.pubkey}</pre></p>
      <button type="button" className="btn btn-primary" onClick={login}>Prove It!</button>
    </div>
  )
}
