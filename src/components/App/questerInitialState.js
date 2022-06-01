import { badgeDetails } from '../../lib/badgeDetails.js'
import { getBadges } from '../../lib/newGenerateBadgeDetails.js'

export const initialState = {
  pubkey: '',
  logged_in: false,
  all_assets: [...badgeDetails],
  user_assets: [],
  display_assets: [],
  learn: true,
  legacy: true,
  monochrome: true,
  side: true,
  missing: true,
  descriptions: true,
  export: false,
  verification_text: '',
  message_signature: '',
}
