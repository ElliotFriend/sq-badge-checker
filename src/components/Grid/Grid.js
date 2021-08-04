import React, { useReducer, useEffect } from 'react';
import {badgeDetails} from '../../lib/badgeDetails.js'
import Card from '../Card/Card'

export default function Grid(props) {
  const badges = props.badges

  function createBadgesArr(badges) {
    let badgesArr = []
    badges.forEach((badge, i) => {
      if (/^SSQ01/.test(badge.code)) {
        badgesArr.push(<div className="row mt-5"><h2 key="specialEvents">Special Event Badges</h2></div>)
      }
      if (/^SQ\d\d01$/.test(badge.code) && !badge.monochrome) {
        badgesArr.push(<div className="row mt-5"><h2 key={"header" + i}>Series {badge.code.substr(2,2)} Badges</h2></div>)
      }
      badgesArr.push(<Card key={i} badge={badge} />)
    })
    return badgesArr
  }

  return (
    <div className="container">
      <div className="row mt-5">
        <h1>Whoa! Check out those sweet badges!</h1>
        <p>Take a look at all the badges you've earned. Way to go! You can filter which of these badges are displayed using the "Filter" options in the header.</p>
        <p>If you want to generate a <em>Verification Token</em> to prove your accomplishments, click "Export Proof" right up at the top. You'll also get an image you can show off to everybody you meet. (This image will contain all the badges that you currently have displayed.)</p>
      </div>
      <div className="row row-cols-8 justify-content-center">
        {createBadgesArr(badges)}
      </div>
    </div>
  )
}
