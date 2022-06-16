import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import StellarSdk from 'stellar-sdk'
import DropBatch from './DropBatch'

/**
 * This component requests from the user a Verification Token. They have a
 * textarea box for input. When they provide that token, it is confirmed to be a
 * valid base64-encoded string, and then put into the URL for verification.
 */
export default function ProvideBatch(props) {
  let history = useHistory()
  let [addressInput, setAddressInput] = useState("")

  /**
   * Take the given input from the user, and store it as our token state.
   */
  const handleChange = (e) => {
    setAddressInput(e.target.value)
  }

  /**
   * Take the given input from the user, and check agains the regex to make sure
   * it is indeed a base64-encoded string.
   */
  const validateInput = (e) => {
    e.preventDefault()
    let validArray = []
    let error = false
    let inputArray = addressInput.split(/\n/)
    inputArray.forEach((item, i) => {
      if (item !== '') {
        if (StellarSdk.StrKey.isValidEd25519PublicKey(item)) {
          validArray.push(item)
        } else {
          error = true
          showAlert()
        }
      }
    })

    if (!error) {
      props.setValidAddresses(validArray)
    } else {
      validArray = []
    }
  }

  /**
   * Used to show an alert telling the user the provided input does not match
   * as a base64-encoded string.
   */
  const showAlert = () => {
    document.getElementById('alertContainer').className = "visible"
  }

  /**
   * Used to hide the same alert, when the user clicks the "dismiss" button on
   * the alert.
   * I'm using this way of doing it, rather than the built-in bootstrap dismiss
   * function so that my alert doesn't disappear altogether when the user clicks
   * to dismiss it. Rather, it's just hidden, and can be pulled back up again.
   */
  const hideAlert = () => {
    document.getElementById('alertContainer').className = "invisible d-none"
  }

  return (
      <form onSubmit={validateInput}>
        <div className="mb-3">
          <p>Copy/Paste the Stellar public addresses you'd like to check below, or drag-n-drop a <code>*.txt</code> file onto the text area below. Please provide your request as one address per line.</p>
          <label htmlFor="tokenInput" className="form-label visually-hidden">Verification Token</label>
          <DropBatch setAddresses={setAddressInput}>
            <textarea onChange={handleChange} type="text" className="form-control bg-dark text-light" id="tokenInput" autoFocus={true} required rows="15" value={addressInput} />
          </DropBatch>
        </div>
        <div id="alertContainer" className="invisible d-none">
          <div className="alert alert-danger alert-dismissible fade show" role="alert" id="tokenAlert">
            <strong>Oops!</strong> Sorry, we didn't understand your input. Please make sure your public addresses are valid Stellar addresses, and entered one per line.<br />Having trouble? Please feel free to <a href="https://twitter.com/elliotfriend" className="alert-link">let me know</a>!<button type="button" className="btn-close" aria-label="Close" onClick={hideAlert}></button>
          </div>
        </div>
        <button type="submit" className="btn btn-primary mb-3">Verify!</button>
      </form>
  )
}
