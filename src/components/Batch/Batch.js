import './Batch.css';
import React, { useState } from 'react';
import ProvideBatch from './ProvideBatch'
import ProcessBatch from './ProcessBatch'

/**
 * This component is the "container" for the various *Batch components.
 */
export default function Batch() {

  // Set up some state to track validated, submitted addresses.
  let [ validAddresses, setValidAddresses] = useState([])


  return (
    <div className="container">
      <h1 className="mt-5 mb-3">Batch Verification</h1>
      { validAddresses.length > 0
        ? <ProcessBatch validAddresses={validAddresses} />
        : <ProvideBatch setValidAddresses={setValidAddresses} />
      }
    </div>
  )
}
