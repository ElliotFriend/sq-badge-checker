import React from 'react';

/**
 * This component is the "container" for the various *Token components.
 */
export default function BatchDetail(props) {

  let pubkey = props.pubkey
  let meta = props.ownedBadges.meta
  let badges = props.ownedBadges.badges

  const renderAssetTable = (badges) => {
    let renderArray = []
    badges.forEach((item, i) => {
      renderArray.push(
        <tr  className="small" key={i}>
          <td scope="row" className="text-start">{item.mono ? [item.code, ' ', <small>MONOCHROME</small>] : item.code }</td>
          <td>{item.issuer}</td>
          <td>{item.date}</td>
          <td>{item.prize ? `${item.prize} XLM` : null}</td>
          <td><a href={item.link}>View {item.hash.slice(0,4)}...{item.hash.slice(-4)}</a></td>
        </tr>
      )
    });

    return renderArray
  }

  const stellarAddress = (address) => {
    return [
      <dt className="col-sm-4">Federated Address</dt>,
      <dd className="col-sm-8">{address}</dd>
    ]
  }

  const firstBadgeInfo = () => {
    return [
      <dt className="col-sm-4">First Badge</dt>,
      <dd className="col-sm-8">{meta.first_badge_mono ? [meta.first_badge, ' ', <small >MONOCHROME</small>] : meta.first_badge }</dd>,
      <dt className="col-sm-4">Earned On</dt>,
      <dd className="col-sm-8">{new Date(meta.first_badge_date).toUTCString()}</dd>,
    ]
  }

  return (
    <div>
      {
        meta.error
        ? <div className='container mb-5'>
            <dl className='row'>
              <dt className="col-sm-4">Public Key</dt>
              <dd className="col-sm-8 text-break">{pubkey}</dd>
              <dt className="col-sm-4">Not Found</dt>
              <dd className="col-sm-8 text-break">This account does not appear to exist on the network. Please check the address and try again.</dd>
            </dl>
            <hr />
          </div>
        : <div className='container mb-5'>
            <dl className="row">
                <dt className="col-sm-4">Public Key</dt>
                <dd className="col-sm-8 text-break">{pubkey}</dd>
                {
                  meta.stellar_address
                  ? stellarAddress(meta.stellar_address)
                  : null
                }
                <dt className="col-sm-4">Earned Badges</dt>
                <dd className="col-sm-8">{badges.length}</dd>
                <dt className="col-sm-4">Account Created</dt>
                <dd className="col-sm-8">{new Date(meta.created_at).toUTCString()}</dd>
                {
                  meta.first_badge
                  ? firstBadgeInfo()
                  : null
                }
                <dt className="col-sm-4">Current XLM Balance</dt>
                <dd className="col-sm-8">{meta.native_balance}</dd>
                <dt className="col-sm-4">Current Sequence Number</dt>
                <dd className="col-sm-8">{meta.sequence}</dd>
              </dl>
              <div className="d-flex justify-content-evenly mb-4">
                {
                  badges.length > 0
                  ? <button className='btn btn-primary' type='button' data-bs-toggle='collapse' data-bs-target={`#badgesCollapse${pubkey}`} aria-expanded='false' aria-controls={`badgesCollapse${pubkey}`}>
                      Expand Badge Details Below
                    </button>
                  : null
                }
                {
                  badges.length > 0
                  ? <a href={`/prove/${pubkey}`} className="btn btn-primary">
                      View on <code>/prove</code> Page
                    </a>
                  : null
                }
                <a href={`https://stellar.expert/explorer/public/account/${pubkey}`} className='btn btn-primary'>
                  View on Stellar Expert
                </a>
              </div>
              {
                badges.length > 0
                ? <div className="collapse" id={`badgesCollapse${pubkey}`}>
                    <table className="table text-white">
                      <thead>
                        <tr>
                          <th scope="col">Code</th>
                          <th scope="col">Issuer</th>
                          <th scope="col">Date</th>
                          <th scope="col">Prize</th>
                          <th scope="col">Link</th>
                        </tr>
                      </thead>
                      <tbody>
                        {renderAssetTable(badges)}
                      </tbody>
                    </table>
                  </div>
                : null
              }
          <hr />
          </div>
      }
    </div>
  )
}
