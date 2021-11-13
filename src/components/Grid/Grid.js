import React from 'react';
import Card from '../Card/Card'

/**
 * This component creates a Grid of "cards" that will each contain the
 * information gathered about one particular asset, in relation to the given
 * stellar account.
 */
export default function Grid(props) {
  const badges = props.badges

  // Create an array of badges (<Card />s) given an array of badges.
  function createBadgesArr(badges) {
    let badgesArr = []
    badges.forEach((badge, i, arr) => {
      // Let's get our bearing of where we are in the array
      let series = badge.code.substr(2,2)
      let lastBadge = i >= 1 ? arr[i - 1] : null
      let lastSeries = lastBadge ? lastBadge.code.substr(2,2) : null
      if (series !== lastSeries) {
        if (/^Q\d$/.test(series)) {
          // Put a series header for our Side Quests
          badgesArr.push(<div key="sideQuestsRow" className="row mt-3"><h2 key="sideQuests">Side Quest Badges</h2></div>)
        } else {
          // Put a header for the series that is different from the last
          badgesArr.push(<div key={`header${i}Row`} className="row mt-3"><h2 key={`header${i}`}>Series {badge.code.substr(2,2)} Badges</h2></div>)
        }
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
