import './Verify.css';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'
import StellarSdk from 'stellar-sdk'
import { isValidSig } from '../../lib/utils.js'
import ProvideToken from './ProvideToken'
import ProcessToken from './ProcessToken'

export default function Verify() {
  let { basestring } = useParams()

  // if (basestring) { console.log(basestring) } else { console.log("none provided")}
  // let [verificationToken, setToken] = useState('')

  // useEffect(() => {
  //   setToken(decodeURIComponent(basestring))
  // }, [])
  // console.log(decodeURIComponent(basestring))


  // let { hexstring } = useParams()
  // let verificationString = Buffer.from(hexstring, 'hex').toString()
  // let verificationObject = JSON.parse(verificationString)
  // let pubkey = verificationObject.p
  // let verText = verificationObject.t
  // let messSig = verificationObject.s
  // let userAssets = verificationObject.a
  // let server = new StellarSdk.Server('https://horizon.stellar.org')

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
