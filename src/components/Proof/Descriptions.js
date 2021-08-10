import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { isValidPubkey } from '../../lib/utils.js'

/**
 * This component provides different descriptions on the `/prove` page,
 * depending on which state the user has present. There are separate
 * descriptions for if the user is logged out, logged in, or if they need to
 * provide us with a public key, still.
 */
export default function Descriptions(props) {
  let loggedIn = props.loggedIn
  let urlPubkey = props.urlPubkey
  let history = useHistory()

  let [providedPubkey, setPubkey] = useState('')

  // If we're not at `/prove/SOMEPUBKEY` then we'll be waiting for the user to
  // provide one for us. We'll redirect after that checks out.
  useEffect(() => {
    if (!urlPubkey) {
      history.push(`/prove/${providedPubkey}`)
    }
  }, [providedPubkey])

  /**
   * This is where I began to mix and match my state management strategy, I
   * think. As the app grew closer to completion, and I became less and less
   * confused about React, I started using useState, useEffect, etc. more
   * frequently. Now, I'm not sure how to merge things back together in a
   * cohesive way.
   */
  const checkPubkey = async (e) => {
    e.preventDefault()
    let pubkey = (e.target.elements.pubkeyInput.value)
    if (await isValidPubkey(pubkey)) {
      // Valid key. Let's hold onto it.
      setPubkey(pubkey)
    } else {
      // Invalid key. Redirect to the /prove page to request user input.
      document.getElementById('invalidPubkey').style.display = "block"
      e.target.elements.pubkeyInput.value = ''
    }
  }

  /**
   * The text and markup that should be displayed if the user has already
   * authenticated through Albedo with their public key.
   */
  const loggedInDescription = () =>
    <div className="row mt-5">
      <h1>Whoa! Check out those sweet badges!</h1>
      <p>Take a look at all the badges you've earned. Way to go! You can filter which of these badges are displayed using the "Filter" options in the header.</p>
      <p>If you want to generate a <em>Verification Token</em> to prove your accomplishments, click "Export Proof" right up at the top. You'll also get an image you can show off to everybody you meet. (This image will contain all the badges that you currently have displayed.)</p>
    </div>

  /**
   * The text and markup that should be displayed if the user has not
   * authenticated through Albedo. They are just "browsing" someone's badges.
   */
  const loggedOutDescription = () =>
    <div className="row mt-5">
      <h1>Wow! Someone's been busy!</h1>
      <p>Take a look at all the badges this account has! If this is your account, you can click "Connect Albedo" in the header to begin generating your very own <em>Verification Token</em>.</p>
    </div>

  /**
   * The text and markup that should be displayed if the user has not
   * authenticated through Albedo, and they have not provided a pubkey for use.
   * They are being prompted for more input.
   */
  const noPubkeyDescription = () =>
    <div className="row justify-content-center mt-5">
      <h1>You wanna see some badges?</h1>
      <p>I don't blame you, I do too! Check it out.</p>
      <p>If you want to see your own badges, click "Connect Albedo" in the header to sign in.</p>
      <p>If you want to see somebody else's badges, enter their Stellar public key below.</p>
      <div className="col-xl-8">
        <form onSubmit={checkPubkey}>
          <div className="mb-3">
            <label for="pubkeyInput" className="visually-hidden form-label">Stellar Public Key</label>
            <input type="text" className="bg-dark text-light form-control" id="pubkeyInput" placeholder="GA7PT6IPFVC4FGG273ZHGCNGG2O52F3B6CLVSI4SNIYOXLUNIOSFCK4F" required />
            <div id="invalidPubkey" className="invalid-feedback">Please enter a valid ED25519 Public Key</div>
          </div>
          <button type="submit" className="btn btn-primary">See Those Badges!</button>
        </form>
      </div>
    </div>

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
