import {verifyMessageSignature} from '@albedo-link/signature-verification'
import StellarSdk from 'stellar-sdk'

/**
 * A wrapper for the Albedo function to verify that a message signature matches
 * a given message and pubkey. Really, this could be skipped altogether, I'm
 * giving the exact same arguments as the albedo function. I started with this
 * so I could avoid an extra import wherever the function was needed, although
 * that seems an unecessary concern.
 */
export function isValidSig(pubkey, message, signature) {
  return verifyMessageSignature(
    pubkey,
    message,
    signature,
  )
}

/**
 * Take the verification object and return a SHA-256 hash of the object.
 */
export async function generateVerificationHash(verificationObject) {
  let jsonString = JSON.stringify(verificationObject)
  let hash = await window.crypto.subtle.digest('SHA-256', Buffer.from(jsonString))
  let hashHex = Buffer.from(hash).toString('hex')
  return hashHex
}

/**
 * Use the stellar-sdk to verify that a given pubkey is a valid Ed25519 public
 * key, and the user isn't just providing us with random input.
 */
export async function isValidPubkey(pubkey) {
  if (StellarSdk.StrKey.isValidEd25519PublicKey(pubkey)) {
    return true
  } else {
    return false
  }
}

/**
 * Using this function to copy the verificaiton token to the clipboard on the
 * export page.
 */
export function copyToClipboard(elementId) {
  let range = document.createRange()
  range.selectNode(document.getElementById(elementId))
  window.getSelection().removeAllRanges()
  window.getSelection().addRange(range)
  document.execCommand('copy')
  window.getSelection().removeAllRanges()
}
