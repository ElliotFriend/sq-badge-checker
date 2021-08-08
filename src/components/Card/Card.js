import './Card.css';
import React from 'react';

export default function Card(props) {
  const badge = props.badge
  let badgeSeries = badge.code === "SSQ01" ? "SSQ" : badge.code.substr(2, 2)
  let badgeQuest = badge.code === "SSQ01" ? "01" : badge.code.substr(4, 2)
  return (
    <div className="col my-2">
      <div className="card h-100 mx-auto text-dark bg-light border-secondary">
        { !badge.owned ?
            <div className="not-owned text-light card-body">
              <h5 className="mt-5 card-title">{badge.code}</h5>
              { badge.monochrome ? <h6 className="card-text">MONOCHROME</h6> : null }
              <p className="card-text">This account does not own this badge</p>
            </div> : null
        }
        <img src={"/assets/badges/" + badge.filename} height="128" className="shadow-sm mx-auto nft-badge card-img-top" alt="..." />
        <div className="card-body">
          <h5 className="card-title">{badge.code}</h5>
          { badge.monochrome ? <h6 className="card-text">MONOCHROME</h6> : null }
          { props.description ? <p className="card-text">{badge.description}</p> : null }
        </div>
        <ul className="list-group list-group-flush">
          <li className="list-group-item"><strong>Series {badgeSeries}</strong><br /><span className="text-secondary">Quest {badgeQuest}</span></li>
          { badge.prize && <li className="list-group-item">Prize: {badge.prize} XLM</li> }
        </ul>
        { badge.link
            ? <div className="card-body">
                <a target="_blank" rel="noreferrer" href={badge.link} className="card-link">View Transaction</a>
              </div>
            : null
        }
        <div className="card-footer">
          <small className="text-muted"><strong>Date Earned:</strong><br />{badge.date ? badge.date : "n/a"}</small>
        </div>
      </div>
    </div>
  )
}
