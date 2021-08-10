import './Proof.css';
import React, { useEffect } from 'react';
import StellarSdk from 'stellar-sdk'
import albedo from '@albedo-link/intent'
import { useParams, useHistory } from 'react-router-dom'
import Grid from '../Grid/Grid'
import Modal from '../Modal/Modal'
import Descriptions from './Descriptions'
import { isValidSig, isValidPubkey } from '../../lib/utils.js'
import { badgeDetails } from '../../lib/badgeDetails.js'

/**
 * This component displays for a user the badges, and the details of those
 * badges, for a given account. By default, and probably most often, this will
 * be the user's own account, but it can be used to view the badges of others,
 * as well.
 */
export default function Proof(props) {
  let quester = props.quester
  let setQuester = props.setQuester
  let { pubkey } = useParams()
  let history = useHistory()

  // After the public key has been provided by the URL, let's validate that it
  // is an actual ED25519 public key. If it's not we'll redirect to the `/prove`
  // page for the user to try with a different key.
  useEffect(() => {
    const validateKey = async () => {
      if (await isValidPubkey(pubkey)) {
        // Valid key. Begin searching for the relevant payments on this account.
        getQuestPayments(pubkey)
      } else {
        // Invalid key. Redirect to the /prove page to request user input.
        history.push("/prove")
      }
    }
    validateKey()
  }, [])

  /**
   * When the user has submitted the text and signed using Albedo, we'll just
   * double-check that it's a valid signature before going any further.
   * I confused myself about why this is here, rather than in Modal, but I had
   * run into trouble staying on the /prove page if this function wasn't
   * finished. I'm sure there's a better way, but I couldn't figure it out at
   * the time.
   */
  async function signProofText(e) {
    e.preventDefault()
    let message = quester.verification_text
    await albedo.signMessage({
      message: message,
    }).then(async (res) => {
      if (await isValidSig(quester.pubkey, message, res.message_signature)) {
        setQuester({message_signature: res.message_signature, type: 'signed_message'})
        toggleExportState()
      }
    })
  }

  /**
   * Big thanks to KanayeNet here! This function will get all the relevant
   * payments for the requested account, and populate a state array with details
   * about each of these items that the user owns.
   */
  async function getQuestPayments(pubkey) {
    const server = new StellarSdk.Server('https://horizon.stellar.org')
    const res = await server.payments().forAccount(pubkey).limit(200).call();
    const badgePayments = res.records
      // Looking for non-native assets being paid to this account.
      .filter(item => item.type === 'payment' && item.asset_type !== 'native')
      // Looking for assets which are actually earned by the user and paid by
      // the issuer. This will keep the site from being used by those who have
      // purchased badges or traded for them.
      .filter(item => badgeDetails.find(({code, issuer}) => item.asset_code === code && item.from === issuer));

    let allBadges = await Promise.all(
      badgeDetails
        .map(async (item) => {
          // Look for a payment of the specific asset codes.
          let payment = badgePayments.find(({asset_code, from}) => item.code === asset_code && item.issuer === from)
          // If none are found, return the item with the 'owned' key set false.
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

      // We're saving two arrays of badge details, to assist in badge filtering
      // when we are presenting them to the user. These arrays will be used to
      // construct a third array of all assets being displayed.
      // What's the more efficient way to accomplish this? I know it's out there
      setQuester({all_assets: allBadges, user_assets: userBadges, type: 'fill_assets'})
  }

  /**
   * Get all the transaction operations for a given hash, and see if there was
   * any payment of XLM in the transaction. If so, we'll save that as the prize
   * for that particular SQ asset.
   */
  async function getPrizeTransaction(hash) {
    let res = await fetch("https://horizon.stellar.org/transactions/" + hash + "/operations")
    let json = await res.json()
    let prizeRecord = json._embedded.records
      .filter(item => item.hasOwnProperty('asset_type') && item.asset_type === 'native')
    return prizeRecord.length > 0 ? parseInt(prizeRecord[0].amount) : false
  }

  /**
   * Toggle whether or not we are showing the user the export page or the prove
   * page. Again, I'm sure there's an easier/better way to handle this.
   */
  function toggleExportState(e) {
    setQuester({export: !quester.export, type: 'toggle_export'})
  }

  /**
   * If the user has toggled the export state, and has given a non-empty
   * verification message, and given a valid signature, let's go ahead and
   * redirect to the export page.
   */
  if (quester.export === true && quester.verification_text !== '' && quester.message_signature !== '') {
    history.push(`/export/${quester.pubkey}`)
  }

  return (
    <div>
      <div className="container">
        <Descriptions loggedIn={quester.logged_in}
                      urlPubkey={pubkey} />
        { pubkey
          ? <Grid badges={quester.display_assets}
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
