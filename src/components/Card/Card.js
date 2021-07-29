import './Card.css';
import React, { useState } from 'react';

export default function Card(props) {
  const badge = props.badge
  return (
    <div className="col-3">
      <div className="card">
        { !badge.owned ? <div className="not-owned"></div> : null }
        <img src={"/assets/badges/" + badge.filename} height="128" className="mx-auto nft-badge card-img-top" alt="..." />
        <div className="card-body">
          <h5 className="card-title">{badge.code}</h5>
          <p className="card-text">{badge.description}</p>
        </div>
        <ul className="list-group list-group-flush">
          <li className="list-group-item">Series: {badge.code.substr(2, 2)}</li>
          <li className="list-group-item">Quest: {badge.code.substr(4, 2)}</li>
          { badge.date ? <li className="list-group-item">Date Earned: {badge.date}</li> : null }
          { badge.prize ? <li className="list-group-item">Prize: {badge.prize} XLM</li> : null }
        </ul>
        { badge.link
            ? <div className="card-body">
                <a target="_blank" href={badge.link} className="card-link">View Transaction</a>
              </div>
            : null
        }
      </div>
    </div>
  )
}
