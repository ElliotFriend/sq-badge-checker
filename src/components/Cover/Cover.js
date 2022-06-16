import './Cover.css';
import React from 'react';
import { useHistory } from 'react-router-dom'
import albedo from '@albedo-link/intent'
import { isValidSig } from '../../lib/utils.js'

/**
 * This component displays a greeting on the main page of the site, and will
 * give the user an opportunity to navigate to the `/verify` page or to login
 * using Albedo.
 */
export default function Cover(props) {
  let history = useHistory()
  let setQuester = props.setQuester

  /**
   * Asks the user to login using their public key, using Albedo. The user is
   * then redirected to the /prove page to see their badges.
   */
  async function login() {
    let tokenToSign = 'QWxsIGhhaWwgQGthbGVwYWlsIQ=='
    await albedo.publicKey({
      token: tokenToSign
    })
    .then(res => {
      if (isValidSig(res.pubkey, tokenToSign, res.signature)) {
        setQuester({pubkey: res.pubkey, type: 'login'})
        history.push("/prove/" + res.pubkey)
      }
    })
  }

  return (
    <div className="cover-container d-flex w-100 h-100 p-3 mx-auto flex-column mt-5">
      <div className="px-4 py-5 text-center">
        <div className="py-5">
          <h1 className="display-5 fw-bold text-white">Welcome to the Badge Checker</h1>
          <div className="col-lg-6 mx-auto">
            <p className="fs-5 mb-4">Prove yourself as the worthy Quester you truly are! Check out your badges, see what you're missing, and export a verifiable image to show off to everyone you meet! To get started, simply...</p>
            <div className="d-grid gap-2 d-sm-flex justify-content-sm-center mb-4">
              <button type="button" className="btn btn-outline-primary btn-lg px-4 fw-bold" onClick={login}>Connect Albedo</button>
            </div>
            <p className="fs-5 mb-4">If you're here to verify a proof, or check a batch of public addresses, please click below to get started.</p>
            <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
              <a href="/verify" className="btn btn-outline-light btn-lg px-4">Verify a Proof</a>
              <a href="/batch" className="btn btn-outline-light btn-lg px-4">Verify a Batch</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
