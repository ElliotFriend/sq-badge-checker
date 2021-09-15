import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import StellarSdk from 'stellar-sdk'
import { isValidSig, generateVerificationHash } from '../../lib/utils.js'

/**
 * This component takes a Verification Token and breaks it into each of its
 * different parts to validate that it is indeed a valid proof.
 */
export default function ProcessToken() {
  // Get the Verificaiton Token from the URL, if it's provided. (It should be
  // there, if we're in this module.)
  let { basestring } = useParams()

  // Again, this is where my state management is a bit all over the place. I do
  // want to make separate states for when somebody is verifying as opposed to
  // someone being logged in and looking at their own badges.
  let [token, setToken] = useState('')
  let [pubkey, setPubkey] = useState('')
  let [verificationObject, setObject] = useState({})
  let [checkCount, setCheckCount] = useState(0)
  let [successCount, setSuccessCount] = useState(0)
  let [failFlag, setFailFlag] = useState('')
  let [failCulprit, setFailCulprit] = useState('')

  // The URL is provided, so make it non-URL-safe, and store it in our state.
  useEffect(() => {
    if (basestring) {
      setToken(decodeURIComponent(basestring))
    }
  }, [])

  // Once the token has been set, begin making all the checks on the token:
  // 1. Check that the hash provided with the object actually matches the object
  // 2. Check that the message, pubkey, and signature all match
  // 3. Check that all the provided operations numbers are valid on the network
  useEffect(() => {
    if (token) {
      // TODO: Make this more asynchronous-friendly. The last three checks could
      // be done in parallel.
      const [verificationObj, hash] = decoupleVerificationParts(token)
      setObject(verificationObj)
      setPubkey(verificationObj.p)
      setCheckCount(verificationObj.o.length + 2)
      checkHash(verificationObj, hash)
      checkSignature(verificationObj)
      checkOperations(verificationObj.p, verificationObj.o)
    }
  }, [token])

  /**
   * We have the token, so break it into it's two parts: The verification object
   * containing the message, signature, date, ops, etc., and the hash of that
   * object.
   */
  const decoupleVerificationParts = (token) => {
    if (token !== '') {
      let verificationString = Buffer.from(token, 'base64').toString()
      let verificationHash = verificationString.slice(-64)
      let verificationObj = JSON.parse(verificationString.slice(0, -65))
      let returnArr = [verificationObj, verificationHash]
      return returnArr
    }
  }

  /**
   * Calculate the hash of the object, and check it against the hash provided in
   * the token.
   */
  const checkHash = async (object, hash) => {
    let freshHash = await generateVerificationHash(object)
    if (freshHash === hash) {
      setSuccessCount(successCount += 1)
    } else {
      setFailFlag('hash')
      setFailCulprit('The provided hash does not match the verification object')
    }
  }

  /**
   * Check that the message was actually signed by the public key, and that the
   * signature is a valid one.
   */
  const checkSignature = async (object) => {
    if (await isValidSig(object.p, object.m, object.s)) {
      setSuccessCount(successCount += 1)
    } else {
      setFailFlag('sig')
      setFailCulprit('Provided signature did not match the signed verification message.')
    }
  }

  /**
   * Check that a given operation matches our verification criteria:
   * 1. It's contained inside a successful transaction
   * 2. The asset code matches against the regex for SQ related codes.
   * 3. The asset was sent to the pubkey address
   * 4. The asset was sent by the issuer (avoid purchases or trades)
   * 5. The operation is a payment, not anything else.
   */
  const validateOperation = async (server, pubkey, operationId) => {
    let op = await server.operations().operation(operationId).call()
    if ( op.transaction_successful === true &&
         /^(SSQ01)|(SQ0[1-3]0[1-8])$/.test(op.asset_code) &&
         op.to === pubkey  &&
         op.from === op.asset_issuer  &&
         op.type === "payment"  ) {
      return true
    } else if ( op.transaction_successful === true &&
                /^SSQ02$/.test(op.asset.split(':')[0]) &&
                /^GBJYFJCADTIK7RGOMWSVTHIZPG747USOL6UJFYAK6OD4ADOEEYC2U72U$/.test(op.asset.split(':')[1]) &&
                op.claimants.some(e => e.destination === pubkey) &&
                op.source_account === "GBJYFJCADTIK7RGOMWSVTHIZPG747USOL6UJFYAK6OD4ADOEEYC2U72U" &&
                op.type === "create_claimable_balance" ) {
      return true
    } else {
      return false
    }
  }

  /**
   * Work through the array of operations, and check if they are valid according
   * to our verification criteria (see above)
   */
  const checkOperations = async (pubkey, operations) => {
    const server = new StellarSdk.Server("https://horizon.stellar.org")
    for (let operation of operations) {
      if (await validateOperation(server, pubkey, operation)) {
        // Valid operation. Add one to the count.
        setSuccessCount(successCount += 1)
      } else {
        // Invalid operation. Set the error details, and break out of the loop.
        setFailFlag('ops')
        setFailCulprit(operation)
        break;
      }
    }
  }

  return (
    <div>
      <div className="mb-3">
        <h2 className="mt-4 mb-3">Token Details</h2>
        <dl className="row">
          <dt className="col-sm-4">Public Key</dt>
          <dd className="col-sm-8 text-break">{pubkey}</dd>
          <dt className="col-sm-4">Verification Text</dt>
          <dd className="col-sm-8 text-break">{verificationObject.m}</dd>
          <dt className="col-sm-4">Generated On</dt>
          <dd className="col-sm-8">{new Date(verificationObject.d).toString()}</dd>
          <dt className="col-sm-4">Earned Badges</dt>
          <dd className="col-sm-8">{checkCount - 2}</dd>
        </dl>
      </div>
      { !failFlag ? <div className="alert alert-success mb-3" role="alert">{successCount} / {checkCount} Successful Checks</div>
        : failFlag === 'hash' ? <div className="alert alert-danger mb-3" role="alert">{successCount} / {checkCount} Successful Checks. Verification has stopped.<br />{failCulprit}</div>
        : failFlag === 'sig' ? <div className="alert alert-danger mb-3" role="alert">{successCount} / {checkCount} Successful Checks. Verification has stopped.<br />{failCulprit}</div>
        : failFlag === 'ops' ? <div className="alert alert-danger mb-3" role="alert">{successCount} / {checkCount} Successful Checks.  Verification has stopped.<br />The provided operation has failed a test: <a className="alert-link" href={`https://horizon.stellar.org/operations/${failCulprit}`}>Operation {failCulprit}</a></div> : null
      }
      <div className="progress mb-3">
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
          ? <div>
              <h2 className="mt-5 mb-3">Verifying...</h2>
              <p>Hang tight. We're crunching the numbers.</p>
            </div>
          : <div>
              <h2 className="mt-5 mb-3">Oh, dangit!</h2>
              <p>Sorry, but we couldn't verify the token you've provided. Check with the person who provided it to you, and ask them to reissue their token. Sorry for the bother.</p>
              <a type="button" className="btn btn-primary" href={`/prove/${pubkey}`}>Show Me The Badges!</a>
            </div>
      }
    </div>
  )
}
