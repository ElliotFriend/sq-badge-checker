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
          badgesArr.push(<div key="sideQuestsRow" className="row mt-4"><h2 key="sideQuests">Side Quest Badges</h2></div>)
          badgesArr.push(<div key="sideQuestsDescription" className="row"><p key="sideDescription"><em>Side Quests</em> are event-based, single-issue badges that prove you've participated in something special within the Stellar Ecosystem.</p></div>)
        } else if (/^L\d$/.test(series)) {
          badgesArr.push(<div key="learnQuestsRow" className="row mt-4"><h2 key="learnQuests">Stellar Quest Learn</h2></div>)
          badgesArr.push(<div key="learnQuestsDescription" className="row"><p key="learnDescription"><em>Stellar Quest Learn</em> is the re-imagining of what gamified blockchain education can look like! These badges showcase the guided path through the fundamentals of the Stellar network.</p></div>)
          badgesArr.push(<div key="learnPaymentsRow" className="row mt-3"><h3 key="learnPayments">Payment Operations</h3></div>)
          badgesArr.push(<div key="learnPaymentsDescription" className="row"><p key="paymentsDescription">Experiment with accounts and payments in this fundamental series.</p></div>)
        } else {
          if (/^L\d$/.test(lastSeries) && /^0\d$/.test(series)) {
            // Put a new header to specify that we're shifting to the legacy badges
            badgesArr.push(<div key="legacyQuestsRow" className="row mt-4"><h2 key="legacyQuests">Stellar Quest Legacy</h2></div>)
            badgesArr.push(<div key="legacyQuestsDescription" className="row"><p key="legacyDescription"><em>Stellar Quest Legacy</em> is the old standard of what we used to do. Series-based, increasingly complex, live-only challenges and puzzles.</p></div>)
          }
          // Put a header for the series that is different from the last
          badgesArr.push(<div key={`header${i}Row`} className="row mt-3"><h3 key={`header${i}`}>Series {badge.code.substr(2,2)} Badges</h3></div>)
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
