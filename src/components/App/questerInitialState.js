import { badgeDetails } from '../../lib/badgeDetails.js'

export const initialState = {
  pubkey: '',
  logged_in: false,
  all_assets: [...badgeDetails],
  user_assets: [],
  display_assets: [],
  monochrome: true,
  events: true,
  missing: true,
  descriptions: true,
  export: false,
  verification_text: '',
  message_signature: '',
}
