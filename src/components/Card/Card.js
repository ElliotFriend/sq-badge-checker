import './Card.css';
import React, { useState } from 'react';

export default function Card(props) {
  const badge = props.badge
  return (
    <div className="col">
      <div className="card h-100 mx-auto text-dark bg-light border-secondary">
        { !badge.owned ? <div className="not-owned"></div> : null }
        <img src={"/assets/badges/" + badge.filename} height="128" className="mx-auto nft-badge card-img-top" alt="..." />
        <div className="card-body">
          <h5 className="card-title">{badge.code}</h5>
          <p className="card-text">{badge.description}</p>
        </div>
        <ul className="list-group list-group-flush">
          <li className="list-group-item"><strong>Series {badge.code.substr(2, 2)}</strong> <span className="text-secondary">Quest {badge.code.substr(4, 2)}</span></li>
          { badge.prize ? <li className="list-group-item">Prize: {badge.prize} XLM</li> : null }
        </ul>
        { badge.link
            ? <div className="card-body">
                <a target="_blank" href={badge.link} className="card-link">View Transaction</a>
              </div>
            : null
        }
        <div className="card-footer">
          <small className="text-muted"><strong>Date Earned:</strong> {badge.date ? badge.date : "n/a"}</small>
        </div>
      </div>
    </div>
  )
}
