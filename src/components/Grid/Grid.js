import React, { useState } from 'react';
import {badgeDetails} from '../../lib/badgeDetails.js'
import Card from '../Card/Card'

export default function Grid(props) {
  const badges = props.badges
  let badgesArr = []
  badges.forEach((badge, i) => {
    if (/^SSQ01/.test(badge.code)) {
      badgesArr.push(<h1 key="specialEvents">Special Event Badges</h1>)
    }
    if (/^SQ\d\d01$/.test(badge.code) && !badge.monochrome) {
      badgesArr.push(<h1 key={"header" + i}>Series {badge.code.substr(2,2)} Badges</h1>)
    }
    badgesArr.push(<Card key={i} badge={badge} />)
  })

  return (
    <div className="row row-cols-8 justify-content-center">
      {badgesArr}
    </div>
  )
}
