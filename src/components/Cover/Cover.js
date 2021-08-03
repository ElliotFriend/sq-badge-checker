import './Cover.css';
import React from 'react';


export default function Cover(props) {
  return (
    <div className="cover-container d-flex w-100 h-100 p-3 mx-auto flex-column mt-5">
      <div className="px-4 py-5 text-center">
        <div className="py-5">
          <h1 className="display-5 fw-bold text-white">Welcome to the Badge Checker</h1>
          <div className="col-lg-6 mx-auto">
            <p className="fs-5 mb-4">Prove yourself as the worthy Quester you truly are! Check out your badges, see what you're missing, and export a verifiable image to show off to everyone you meet! To get started, simply...</p>
            <div className="d-grid gap-2 d-sm-flex justify-content-sm-center mb-4">
              <button type="button" className="btn btn-outline-primary btn-lg px-4 me-sm-3 fw-bold" onClick={props.login}>Connect Albedo</button>
            </div>
            <p className="fs-5 mb-4">If you're here to verify a proof, please click the button below to get started.</p>
            <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
              <a href="/verify" className="btn btn-outline-light btn-lg px-4">Verify a Proof</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}