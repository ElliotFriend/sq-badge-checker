import {verifyMessageSignature} from '@albedo-link/signature-verification'

export function isValidSig(pubkey, message, signature) {
  return verifyMessageSignature(
    pubkey,
    message,
    signature,
  )
}
