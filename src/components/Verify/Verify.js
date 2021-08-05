import './Verify.css';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'
import StellarSdk from 'stellar-sdk'
import { isValidSig } from '../../lib/utils.js'
import ProvideToken from './ProvideToken'

let something


export default function Verify() {
  let { basestring } = useParams()
  // if (basestring) { console.log(basestring) } else { console.log("none provided")}
  let [trueCount, setTrue] = useState(0)
  let [falseCount, setFalse] = useState(0)
  let [verificationToken, setToken] = useState('')

  useEffect(() => {
    if (basestring) {
      setToken(decodeURIComponent(basestring))
    }
  }, [])
  // console.log(decodeURIComponent(basestring))
  let verString = Buffer.from(verificationToken, 'base64').toString()
  let verHash = verString.slice(-64)
  let verObj = JSON.parse(verString.slice(0, -65))
  // let verificationObject = JSON.parse(verificationArray[0])
  console.log(verObj)
  // let { hexstring } = useParams()
  // let verificationString = Buffer.from(hexstring, 'hex').toString()
  // let verificationObject = JSON.parse(verificationString)
  // let pubkey = verificationObject.p
  // let verText = verificationObject.t
  // let messSig = verificationObject.s
  // let userAssets = verificationObject.a
  // let server = new StellarSdk.Server('https://horizon.stellar.org')

  let verifyOperation = async (server, pubkey, asset) => {
    let op = await server.operations().operation(asset.o).call()
    if ( op.transaction_successful === true &&
         op.asset_code === asset.c &&
         op.to === pubkey &&
         op.from === op.asset_issuer &&
         op.type === "payment" ) {
      return true
    } else {
      return false
    }
  }

  return (
    <div className="container">
      <p>Here to verify!</p>
      { verificationToken
        ? <p className="text-break">{decodeURIComponent(basestring)}</p>
        : <ProvideToken setToken={setToken} />
      }
    </div>
  )
}
