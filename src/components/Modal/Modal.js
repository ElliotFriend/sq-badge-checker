import './Modal.css';
import React from 'react';

/**
 * This component displays a modal pop-up when the user clicks on Export when
 * they are viewing their badges. The modal will ask them for some verification
 * text, and then direct them to sign that text with Albedo. Upon successful
 * verification of that signature, the user is directed to their export page.
 */
export default function Modal(props) {

  // Set the verification_text state with each keypress from the user.
  const handleChange = (e) => {
    props.setQuester({verification_text: e.target.value, type: 'verify_text'})
  }

  return (
    <div className="modal fade" id="verificationModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="staticBackdropLabel">Modal title</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form onSubmit={props.signProofText}>
            <div className="modal-body text-dark">
              <p>Please enter any verification text you'd like below. You will then be asked to sign that text with your secret key using Albedo.</p>
              <input onChange={handleChange} className="form-control" type="text" required placeholder="Perhaps your name, or something..." />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" className="btn btn-primary" data-bs-dismiss="modal">Sign</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
