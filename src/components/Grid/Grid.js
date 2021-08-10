import React from 'react';
import Card from '../Card/Card'

/**
 * This component creates a Grid of "cards" that will each contain the
 * information gathered about one particular asset, in relation to the given
 * stellar account.
 */
export default function Grid(props) {
  const badges = props.badges

  //Create an array of badges (<Card />s) given an array of badges.
  function createBadgesArr(badges) {
    let badgesArr = []
    badges.forEach((badge, i) => {
      if (/^SSQ01/.test(badge.code)) {
        // Add a heading for our special events badges.
        badgesArr.push(<div className="row mt-3"><h2 key="specialEvents">Special Event Badges</h2></div>)
      }
      if (/^SQ\d\d01$/.test(badge.code) && !badge.monochrome) {
        /**
         * Add a heading for our different series badges.
         * TODO: Make this a bit more universal. What if somebody doesn't have
         * badge number one of a series? Or, if they only have monochrome? Make
         * this work for those cases.
         */
        badgesArr.push(<div className="row mt-3"><h2 key={"header" + i}>Series {badge.code.substr(2,2)} Badges</h2></div>)
      }
      // Add the card for the badge to the array.
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
