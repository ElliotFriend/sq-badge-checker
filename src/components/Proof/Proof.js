import './Proof.css';
import React, { useState, useReducer, useEffect } from 'react';
import StellarSdk from 'stellar-sdk'
import albedo from '@albedo-link/intent'
import { useParams, useHistory, Redirect } from 'react-router-dom'
import Grid from '../Grid/Grid'
import Export from '../Export/Export'
import Cover from '../Cover/Cover'
import Modal from '../Modal/Modal'
import Descriptions from './Descriptions'
import { isValidSig, isValidPubkey } from '../../lib/utils.js'
import { badgeDetails } from '../../lib/badgeDetails.js'

export default function Proof(props) {
  let quester = props.quester
  let setQuester = props.setQuester
  let { pubkey } = useParams()
  let history = useHistory()

  useEffect(async () => {
    if (await isValidPubkey(pubkey)) {
      getQuestPayments(pubkey)
    } else {
      history.push("/prove")
    }
  }, [])

  async function signProofText() {
    let message = quester.verification_text
    await albedo.signMessage({
      message: message,
    }).then(res => {
      if (isValidSig(quester.pubkey, message, res.message_signature)) {
        setQuester({message_signature: res.message_signature, type: 'signed_message'})
        toggleExportState()
      }
    })
  }

 async function getQuestPayments(pubkey) {
    const server = new StellarSdk.Server('https://horizon.stellar.org')
    const res = await server.payments().forAccount(pubkey).limit(200).call();
    const badgePayments = res.records
      .filter(item => item.type === 'payment' && item.asset_type !== 'native')
      .filter(item => badgeDetails.find(({code, issuer}) => item.asset_code === code && item.from === issuer));


    let allBadges = await Promise.all(
      badgeDetails
        .map(async (item) => {
          let payment = badgePayments.find(({asset_code, from}) => item.code === asset_code && item.issuer === from)
          if (!payment) return item;
          return {
            ...item,
            owned: true,
            date: new Date(payment.created_at).toISOString().split('T')[0],
            hash: payment.transaction_hash,
            link: `https://stellar.expert/explorer/public/tx/${payment.transaction_hash}`,
            operation: payment.id,
            prize: await getPrizeTransaction(payment.transaction_hash)
          };
        }));
      let userBadges = allBadges.filter(item => item.owned === true)
      setQuester({all_assets: allBadges, user_assets: userBadges, type: 'fill_assets'})
  }

  async function getPrizeTransaction(hash) {
    let res = await fetch("https://horizon.stellar.org/transactions/" + hash + "/operations")
    let json = await res.json()
    let prizeRecord = json._embedded.records
      .filter(item => item.hasOwnProperty('asset_type') && item.asset_type === 'native')
    return prizeRecord.length > 0 ? parseInt(prizeRecord[0].amount) : false
  }

  function toggleExportState(e) {
    setQuester({export: !quester.export, type: 'toggle_export'})
  }

  function addVerificationText(text) {
    setQuester({verification_text: text, type: 'verify_text'})
  }

  const hideImages = (badges) => {
    let imgArray = []
    badges.forEach((badge, i) => {
      imgArray.push(<img src={"/assets/badges/" + badge.filename} ref={badge.issuer} className="d-none" />)
    })
    return imgArray
  }
  let verObj = quester.user_assets
    .reduce((acc, item, i, a) => {
      // console.log(item)
      let itemObj = {code: item.code, hash: item.hash}
      return acc.concat(itemObj)
    }, [])

  if (quester.export === true && quester.verification_text !== '' && quester.message_signature !== '') {
    return <Redirect to={"/export/" + quester.pubkey} />
  }

  return (
    <div>
      <div className="container">
        <Descriptions loggedIn={props.loggedIn}
                      urlPubkey={pubkey} />
        { pubkey ? <Grid badges={quester.display_assets}
                         descriptions={quester.descriptions}
                         pubkey={pubkey} />
                 : null }
      </div>
      <Modal
        setQuester={setQuester}
        toggleExportState={toggleExportState}
        signProofText={signProofText}
        pubkey={quester.pubkey} />
    </div>
  )
}
