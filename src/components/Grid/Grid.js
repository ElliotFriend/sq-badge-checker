import React, { useReducer, useEffect } from 'react';
import {badgeDetails} from '../../lib/badgeDetails.js'
import Card from '../Card/Card'

export default function Grid(props) {
  const badges = props.badges

  function createBadgesArr(badges) {
    let badgesArr = []
    badges.forEach((badge, i) => {
      if (/^SSQ01/.test(badge.code)) {
        badgesArr.push(<div className="row mt-3"><h2 key="specialEvents">Special Event Badges</h2></div>)
      }
      if (/^SQ\d\d01$/.test(badge.code) && !badge.monochrome) {
        badgesArr.push(<div className="row mt-3"><h2 key={"header" + i}>Series {badge.code.substr(2,2)} Badges</h2></div>)
      }
      badgesArr.push(<Card key={i} badge={badge} description={props.descriptions} />)
    })
    return badgesArr
  }

  return (
    <div className="row row-cols-8 justify-content-center mb-3">
      {createBadgesArr(badges)}
    </div>
  )
}
