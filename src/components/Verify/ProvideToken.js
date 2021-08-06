import React from 'react'
import { useHistory } from 'react-router-dom'

export default function ProvideToken() {
  let history = useHistory()

  const validateInput = (e) => {
    e.preventDefault()
    let tokenInput = e.target.elements.tokenInput.value
    let base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/
    if (base64regex.test(tokenInput)) {
      history.push("/verify/" + encodeURIComponent(tokenInput))
    } else {
      showAlert()
    }
  }

  const showAlert = () => {
    document.getElementById('alertContainer').className = "visible"
  }

  const hideAlert = () => {
    document.getElementById('alertContainer').className = "invisible d-none"
  }

  return (
    <form onSubmit={validateInput}>
      <p>Copy/Paste your verification below to check it out.</p>
      <div className="mb-3">
        <label for="tokenInput" className="form-label visually-hidden">Verification Token</label>
        <textarea type="text" className="form-control bg-dark text-light" id="tokenInput" autoFocus="true" required rows="20" />
      </div>
      <div id="alertContainer" className="invisible d-none">
        <div className="alert alert-danger alert-dismissible fade show" role="alert" id="tokenAlert">
          <strong>Oops!</strong> Sorry, we didn't understand your input. Please make sure your Verification Token is a valid base64 string.<br />Having trouble? Please feel free to <a href="https://twitter.com/elliotfriend" class="alert-link">let me know</a>!<button type="button" className="btn-close" aria-label="Close" onClick={hideAlert}></button>
        </div>
      </div>
      <button type="submit" className="btn btn-primary mb-3">Verify!</button>
    </form>
  )
}
