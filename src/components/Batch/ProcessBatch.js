import React, { useState, useEffect } from 'react'
import StellarSdk from 'stellar-sdk'
import { isValidSig, generateVerificationHash, seriesFourIssuers } from '../../lib/utils.js'
import BatchDetail from './BatchDetail'
import BatchLoading from './BatchLoading'

/**
 * This component takes a Verification Token and breaks it into each of its
 * different parts to validate that it is indeed a valid proof.
 */
export default function ProcessBatch(props) {
  // Get the Verificaiton Token from the URL, if it's provided. (It should be
  // there, if we're in this module.)
  let validAddresses = props.validAddresses
  let [ownedBadges, setOwnedBadges] = useState({})

  // Again, this is where my state management is a bit all over the place. I do
  // want to make separate states for when somebody is verifying as opposed to
  // someone being logged in and looking at their own badges.
  let [successCount, setSuccessCount] = useState(0)
  let [loadingActive, setLoadingActive] = useState(false)

  // The URL is provided, so make it non-URL-safe, and store it in our state.
  // useEffect(() => {
  //   if (basestring) {
  //     setToken(decodeURIComponent(basestring))
  //   }
  // }, [])

  // Once the token has been set, begin making all the checks on the token:
  // 1. Check that the hash provided with the object actually matches the object
  // 2. Check that the message, pubkey, and signature all match
  // 3. Check that all the provided operations numbers are valid on the network
  // useEffect(() => {
  //   if (token) {
  //     // TODO: Make this more asynchronous-friendly. The last three checks could
  //     // be done in parallel.
  //     const [verificationObj, hash] = decoupleVerificationParts(token)
  //     setObject(verificationObj)
  //     setPubkey(verificationObj.p)
  //     setCheckCount(verificationObj.o.length + 2)
  //     checkHash(verificationObj, hash)
  //     checkSignature(verificationObj)
  //     checkOperations(verificationObj.p, verificationObj.o)
  //   }
  // }, [token])
  useEffect(() => {
    if (validAddresses.length > 0) {
      const checkAddresses = async () => {
        setLoadingActive(true)
        const res = await fetch('https://api.elliotfriend.com/sq/badges', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({'public_keys': [...validAddresses]})
        })
        let json = await res.json()
        setOwnedBadges(json)
        setLoadingActive(false)
      }
      checkAddresses()
    }
  }, [])

  const renderBatchDetails = (ownedBadges) => {
    let renderArray = []
    for (let batchAccount in ownedBadges) {
      renderArray.push(<BatchDetail key={batchAccount} pubkey={batchAccount} ownedBadges={ownedBadges[batchAccount]} />)
    }
    return renderArray
  }

  return (
    <div>
      <div className="mb-3">
        <h2 className="mt-4 mb-3">Batch Details</h2>
        <p>The public keys you've submitted have been processed, and details of earned SQ badges can be seen below.</p>
        { validAddresses
          ? <BatchLoading active={loadingActive}>
              {renderBatchDetails(ownedBadges)}
            </BatchLoading>
          : null
        }
      </div>
    </div>
  )
}
