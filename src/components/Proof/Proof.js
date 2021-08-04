import './Proof.css';
import React, { useState, useReducer, useEffect } from 'react';
import StellarSdk from 'stellar-sdk'
import albedo from '@albedo-link/intent'
import { useParams, Redirect } from 'react-router-dom'
import Grid from '../Grid/Grid'
import Export from '../Export/Export'
import Cover from '../Cover/Cover'
import Modal from '../Modal/Modal'
import {isValidSig} from '../../lib/utils.js'
import {badgeDetails} from '../../lib/badgeDetails.js'

export default function Proof(props) {
  let quester = props.quester
  let setQuester = props.setQuester
  let params = useParams()

  useEffect(() => {
    getQuestPayments(params.pubkey)
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
    let server = new StellarSdk.Server('https://horizon.stellar.org')
    await server.payments().forAccount(pubkey).limit(200).call()
    .then(res => {
      let rec = res.records
        .filter(item => item.type === 'payment' && item.asset_type !== 'native')
        .filter(item => badgeDetails.find(({code, issuer}) => item.asset_code === code && item.from === issuer))
      let allAssets = badgeDetails
        .map(item => {
          let thisRecord = rec.find(({asset_code, from}) => item.code === asset_code && item.issuer === from)
          if (thisRecord) {
            item.owned = true
            item.date = new Date(thisRecord.created_at).toISOString().split('T')[0]
            item.hash = thisRecord.transaction_hash
            item.link = "https://stellar.expert/explorer/public/tx/" + item.hash
            item.operation = thisRecord.id
            getPrizeTransaction(item.hash).then(prize => {
              if (prize) { item.prize = prize }})
            return item
          } else {
            return item
          }
        })
      let userAssets = allAssets.filter(item => item.owned === true)
      setQuester({all_assets: allAssets, user_assets: userAssets, type: 'fill_assets'})
    })
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
  // console.log(Buffer.from(JSON.stringify(verObj)).toString('hex'))
  // console.log(verObj)
  // console.log(Buffer.from("Hello there").toString('hex'))
  // let keypair = StellarSdk.Keypair.fromSecret("SCGAMDAF6H3GLU7HAZ3HSPBUT77RJRTILASKN4LJLVEOPY3A327LOOUY")
  // console.log(keypair.publicKey())
  // let hexSig = keypair.sign(quester.verification_text)
  // console.log(hexSig)
  // console.log(hexSig.toString('base64'))
  // console.log(Buffer.from(hexSig.toString('base64'), 'base64'))
  // console.log(keypair.verify(quester.verification_text, hexSig))
  // console.log(Buffer.from(JSON.stringify(quester.user_assets)).toString('base64'))
  // getQuestPayments(params.pubkey)
  if (quester.export === true && quester.verification_text !== '' && quester.message_signature !== '') {
    return <Redirect to={"/export/" + quester.pubkey} />
  }

  return (
    <div>
      <Grid badges={quester.display_assets} pubkey={params.pubkey} />
      <Modal
        setQuester={setQuester}
        toggleExportState={toggleExportState}
        signProofText={signProofText}
        pubkey={quester.pubkey} />
    </div>
  )
}
