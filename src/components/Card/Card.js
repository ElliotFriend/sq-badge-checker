import './Card.css';
import React, { useState } from 'react';

export default function Card(props) {
  const badge = props.badge
  return (
    <div className="col">
      <div className="card">
        <img src={"/assets/badges/" + badge.filename} height="128" className="mx-auto nft-badge card-img-top" alt="..." />
        <div className="card-body">
          <h5 className="card-title">{badge.code}</h5>
          <p className="card-text">{badge.description}</p>
        </div>
        <ul className="list-group list-group-flush">
          <li className="list-group-item">Series: {badge.code.substr(2, 2)}</li>
          <li className="list-group-item">Quest: {badge.code.substr(4, 2)}</li>
          <li className="list-group-item">Date: 1970-01-01</li>
          <li className="list-group-item">Prize: 500xlm</li>
        </ul>
        <div className="card-body">
          <a href="#" className="card-link">Card link</a>
          <a href="#" className="card-link">Another link</a>
        </div>
      </div>
    </div>
  )
}
