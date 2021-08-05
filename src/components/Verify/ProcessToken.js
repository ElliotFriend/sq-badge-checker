import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import StellarSdk from 'stellar-sdk'
import { isValidSig, generateVerificationHash } from '../../lib/utils.js'

export default function ProcessToken() {
  let { basestring } = useParams()

  let [token, setToken] = useState('')
  let [hashMatch, setHashMatch] = useState(false)
  let [checkCount, setCheckCount] = useState(0)
  let [successCount, setSuccessCount] = useState(0)

  useEffect(() => {
    if (basestring) {
      setToken(decodeURIComponent(basestring))
      // checkHash(verificationObj, hash)

      // setCheckCount(verificationObj.o.length + 2)
    }
  }, [])

  useEffect(() => {
    if (token) {
      const [verificationObj, hash] = decoupleVerificationParts(token)
      setCheckCount(verificationObj.o.length + 2)
      checkHash(verificationObj, hash)
      checkSignature(verificationObj)
      checkOperations(verificationObj.p, verificationObj.o)
    }
  }, [token])

  const decoupleVerificationParts = (token) => {
    if (token !== '') {
      let verificationString = Buffer.from(token, 'base64').toString()
      let verificationHash = verificationString.slice(-64)
      let verificationObj = JSON.parse(verificationString.slice(0, -65))
      return [verificationObj, verificationHash]
    }
  }

  const checkHash = async (object, hash) => {
    let freshHash = await generateVerificationHash(object)
    if (freshHash === hash) {
      setHashMatch(true)
      setSuccessCount(successCount += 1)
    }
  }

  const checkSignature = async (object) => {
    if (await isValidSig(object.p, object.m, object.s)) {
      setSuccessCount(successCount += 1)
    }
  }

  const validateOperation = async (server, pubkey, operationId) => {
    let op = await server.operations().operation(operationId).call()
    if ( op.transaction_successful === true &&
         /^(SSQ01)|(SQ0[1-3]0[1-8])$/.test(op.asset_code) &&
         op.to === pubkey &&
         op.from === op.asset_issuer &&
         op.type === "payment" ) {
       return true
     }
  }

  const checkOperations = async (pubkey, operations) => {
    const server = new StellarSdk.Server("https://horizon.stellar.org")
    for (let operation of operations) {
      if (await validateOperation(server, pubkey, operation)) {
        setSuccessCount(successCount += 1)
      }
    }
  }

  // const [verificationObj, hash] = decoupleVerificationParts(token)




  return (
    <div>
      <div class="alert alert-success" role="alert">
        {successCount} / {checkCount} verifications have succeeded
      </div>
    </div>
  )
}
