import {verifyMessageSignature} from '@albedo-link/signature-verification'

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
