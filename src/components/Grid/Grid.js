import React, { useState } from 'react';
import {badgeDetails} from '../../lib/badgeDetails.js'
import Card from '../Card/Card'

export default function Grid(props) {
  const badges = props.badges
  let badgesArr = []
  for (let badge of badges) {
    if (/^SQ\d\d01$/.test(badge.code)) {
      badgesArr.push(<h1>Series {badge.code.substr(2,2)} Badges </h1>)
    }
    badgesArr.push(<Card key={badge.code} badge={badge} />)
  }

  return (
    <div className="row row-cols-8">
      {badgesArr}
    </div>
  )
}
