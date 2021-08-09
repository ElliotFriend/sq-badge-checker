import './Verify.css';
import React from 'react';
import { useParams } from 'react-router-dom'
import ProvideToken from './ProvideToken'
import ProcessToken from './ProcessToken'

export default function Verify() {

  /* Grab the base64-encoded Verification Token from the URL
   */
  let { basestring } = useParams()

  return (
    <div className="container">
      <h1 className="mt-5 mb-3">Token Verification</h1>
      { basestring
        ? <ProcessToken />
        : <ProvideToken />
      }
    </div>
  )
}
