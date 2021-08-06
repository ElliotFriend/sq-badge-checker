import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'

export default function Descriptions(props) {
  let loggedIn = props.loggedIn
  let urlPubkey = props.urlPubkey

  let [providedPubkey, setPubkey] = useState('')

  let loggedInDescription = () =>
    <div className="row mt-5">
      <h1>Whoa! Check out those sweet badges!</h1>
      <p>Take a look at all the badges you've earned. Way to go! You can filter which of these badges are displayed using the "Filter" options in the header.</p>
      <p>If you want to generate a <em>Verification Token</em> to prove your accomplishments, click "Export Proof" right up at the top. You'll also get an image you can show off to everybody you meet. (This image will contain all the badges that you currently have displayed.)</p>
    </div>

  let loggedOutDescription = () =>
    <div className="row mt-5">
      <h1>Wow! Someone's been busy!</h1>
      <p>Take a look at all the badges this account has! If this is your account, you can click "Connect Albedo" in the header to begin generating your very own <em>Verification Token</em>.</p>
    </div>

  let noPubkeyDescription = () =>
    <div className="row justify-content-center mt-5">
      <h1>You wanna see some badges?</h1>
      <p>I don't blame you, I do too! Check it out.</p>
      <p>If you want to see your own badges, click "Connect Albedo" in the header to sign in.</p>
      <p>If you want to see somebody else's badges, enter their Stellar public key below.</p>
      <div className="col-6">
        <div className="mb-3">
          <label for="pubkeyInput" className="visually-hidden form-label">Stellar Public Key</label>
          <input onChange={(e) => setPubkey(e.target.value)} type="text" className="bg-dark text-light form-control" id="pubkeyInput" placeholder="GA7PT6IPFVC4FGG273ZHGCNGG2O52F3B6CLVSI4SNIYOXLUNIOSFCK4F" />
        </div>
        <a href={pubkeyURL} className="btn btn-primary">See Those Badges!</a>
      </div>
    </div>

    let pubkeyURL = "/prove/" + providedPubkey

  return (
    <div>
      { loggedIn
          ? loggedInDescription()
          : urlPubkey
          ? loggedOutDescription()
          : noPubkeyDescription()

      }
    </div>
  )
}
