import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import StellarSdk from 'stellar-sdk'
import { isValidSig, generateVerificationHash } from '../../lib/utils.js'

export default function ProcessToken() {
  let { basestring } = useParams()

  let [token, setToken] = useState('')
  let [pubkey, setPubkey] = useState('')
  let [hashMatch, setHashMatch] = useState(false)
  let [checkCount, setCheckCount] = useState(0)
  let [successCount, setSuccessCount] = useState(0)
  let [failFlag, setFailFlag] = useState('')
  let [failCulprit, setFailCulprit] = useState('')

  useEffect(() => {
    if (basestring) {
      setToken(decodeURIComponent(basestring))
    }
  }, [])

  useEffect(() => {
    if (token) {
      const [verificationObj, hash] = decoupleVerificationParts(token)
      setPubkey(verificationObj.p)
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
    } else {
      setFailFlag('hash')
      setFailCulprit('The provided hash does not match the verification object')
    }
  }

  const checkSignature = async (object) => {
    if (await isValidSig(object.p, object.m, object.s)) {
      setSuccessCount(successCount += 1)
    } else {
      setFailFlag('sig')
      setFailCulprit('Provided signature did not match the signed verification message.')
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
     } else {
       return false
     }
  }

  const checkOperations = async (pubkey, operations) => {
    const server = new StellarSdk.Server("https://horizon.stellar.org")
    for (let operation of operations) {
      if (await validateOperation(server, pubkey, operation)) {
        setSuccessCount(successCount += 1)
      } else {
        setFailFlag('ops')
        setFailCulprit(operation)
        break;
      }
    }
  }

  return (
    <div>
      { !failFlag ? <div className="alert alert-success" role="alert">{successCount} / {checkCount} Successful Checks</div>
        : failFlag === 'hash' ? <div className="alert alert-danger" role="alert">{successCount} / {checkCount} Successful Checks. Verification has stopped.<br />{failCulprit}</div>
        : failFlag === 'sig' ? <div className="alert alert-danger" role="alert">{successCount} / {checkCount} Successful Checks. Verification has stopped.<br />{failCulprit}</div>
        : failFlag === 'ops' ? <div className="alert alert-danger" role="alert">{successCount} / {checkCount} Successful Checks.  Verification has stopped.<br />The provided operation has failed a test: <a className="alert-link" href={`https://horizon.stellar.org/operations/${failCulprit}`}>Operation {failCulprit}</a></div> : null
      }
      <div className="progress">
        <div className="progress-bar" style={{ width: `${ successCount / checkCount * 100}%`, transition: "1s ease"}} role="progressbar" aria-valuenow={successCount} aria-valuemin="0" aria-valuemax={checkCount}></div>
      </div>
      {
        successCount === checkCount && !failFlag
          ?
            <div>
              <h2 className="mt-5 mb-3">Sweet!!</h2>
              <p>The <em>Verification Token</em> you were given checks out! If you want to see more of what they've accomplished, you can check out their badge details here:</p>
              <a type="button" className="mb-3 btn btn-primary" href={`/prove/${pubkey}`}>Show Me The Badges!</a>
            </div>
          : successCount < checkCount && !failFlag
          ? <p className="mt-5">Hang tight. We're crunching the numbers.</p>
          : <div>
              <h2 className="mt-5 mb-3">Oh, dangit!</h2>
              <p>Sorry, but we couldn't verify the token you've provided. Check with the person who provided it to you, and ask them to reissue their token. Sorry for the bother.</p>
              <a type="button" className="btn btn-primary" href={`/prove/${pubkey}`}>Show Me The Badges!</a>
            </div>
      }
    </div>
  )
}
