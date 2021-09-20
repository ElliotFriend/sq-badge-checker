import './Card.css';
import React from 'react';

/**
 * This component displays one single card. The pieces displayed include the
 * badge name, if the badge is monochrome, description of the quest, what series
 * number it was in, the quest number, a prize amount (if applicable), a link to
 * the transaction on stellar.expert, and when the link was earned.
 *
 * A grayed out overlay is displayed notifying the user that the account does
 * not own that badge, if that is the case.
 */
export default function Card(props) {
  const badge = props.badge
  // Extract the series and quest numbers from the badge code.
  let badgeSeries = /^SSQ0[\d]$/.test(badge.code) ? "Side Quests" : `Series ${badge.code.substr(2, 2)}`
  let badgeQuest = /^SSQ0[\d]$/.test(badge.code) ? `Quest ${badge.code.substr(3, 2)}` : `Quest ${badge.code.substr(4, 2)}`
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
          <li className="list-group-item"><strong>{badgeSeries}</strong><br /><span className="text-secondary">{badgeQuest}</span></li>
          { badge.prize && <li className="list-group-item">Prize: {badge.prize} XLM</li> }
        </ul>
        { badge.link
            ? <div className="card-body">
                <a target="_blank" rel="noreferrer" href={badge.link} className="card-link">View Transaction</a>
              </div>
            : null
        }
        <div className="card-footer">
          <small className="text-muted"><strong>Date Earned</strong><br />{badge.date ? badge.date : "n/a"}</small>
        </div>
      </div>
    </div>
  )
}
