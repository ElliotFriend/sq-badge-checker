import {verifyMessageSignature} from '@albedo-link/signature-verification'
import StellarSdk from 'stellar-sdk'

export function isValidSig(pubkey, message, signature) {
  return verifyMessageSignature(
    pubkey,
    message,
    signature,
  )
}

export async function generateVerificationHash(verificationObject) {
  let jsonString = JSON.stringify(verificationObject)
  let hash = await window.crypto.subtle.digest('SHA-256', Buffer.from(jsonString))
  let hashHex = Buffer.from(hash).toString('hex')
  return hashHex
}

export async function isValidPubkey(pubkey) {
  if (StellarSdk.StrKey.isValidEd25519PublicKey(pubkey)) {
    return true
  } else {
    return false
  }
}

export function copyToClipboard(elementId) {
  let range = document.createRange()
  range.selectNode(document.getElementById(elementId))
  window.getSelection().removeAllRanges()
  window.getSelection().addRange(range)
  document.execCommand('copy')
  window.getSelection().removeAllRanges()
}
