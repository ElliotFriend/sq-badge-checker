import './Verify.css';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'
import StellarSdk from 'stellar-sdk'
import { isValidSig } from '../../lib/utils.js'

let something


export default function Verify() {
  let { basestring } = useParams()
  console.log(decodeURIComponent(basestring))
  let verificationString = Buffer.from(decodeURIComponent(basestring), 'base64').toString()
  let verificationObject = JSON.parse(verificationString)
  // let { hexstring } = useParams()
  // let verificationString = Buffer.from(hexstring, 'hex').toString()
  // let verificationObject = JSON.parse(verificationString)
  // let pubkey = verificationObject.p
  // let verText = verificationObject.t
  // let messSig = verificationObject.s
  // let userAssets = verificationObject.a
  // let server = new StellarSdk.Server('https://horizon.stellar.org')

  let [trueCount, setTrue] = useState(0)
  let [falseCount, setFalse] = useState(0)

  useEffect(() => {
    // for (let asset of userAssets) {
    //   if (verifyOperation(server, pubkey, asset)) {
    //     setTrue(trueCount += 1)
    //   } else {
    //     setFalse(falseCount + 1)
    //   }
    // }
  }, [])

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
      <p className="text-break">{verificationString}</p>
    </div>
  )
}
