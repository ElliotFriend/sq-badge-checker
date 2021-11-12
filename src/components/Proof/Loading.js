import React from 'react'
import LoadingOverlay from 'react-loading-overlay'

export default function Loading({ active, children }) {

  const loadingSpinner = () =>
    <div className="d-flex justify-content-center">
      <div className="spinner-border text-primary m-4" style={{width: "4rem", height: "4rem"}} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>

  return (
    <LoadingOverlay
      active={active}
      text="Querying Horizon..."
      spinner={loadingSpinner()}
      styles={{
        wrapper: {
          overflow: active ? 'hidden' : 'hidden'
        },
        overlay: (base) => ({
          ...base,
          position: 'fixed'
        })
      }}
    >
      {children}
    </LoadingOverlay>
  )
}
