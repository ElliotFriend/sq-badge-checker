import { initialState } from './questerInitialState'

export default function questerReducer(state = initialState, action) {
  let newState = {...state}
  switch (action.type) {
    case 'login':
      newState.pubkey = action.pubkey
      newState.logged_in = true
      return newState
    case 'logout':
      return initialState
    case 'fill_assets':
      newState.all_assets = action.all_assets
      newState.user_assets = action.user_assets
      return newState
    case 'display_assets':
      newState.display_assets = action.display_assets
      return newState
    case 'toggle_monochrome':
      newState.monochrome = action.monochrome
      return newState
    case 'toggle_events':
      newState.events = action.events
      return newState
    case 'toggle_missing':
      newState.missing = action.missing
      return newState
    case 'toggle_descriptions':
      newState.descriptions = action.descriptions
      return newState
    case 'toggle_export':
      newState.export = action.export
      return newState
    case 'verify_text':
      newState.verification_text = action.verification_text
      return newState
    case 'signed_message':
      newState.message_signature = action.message_signature
      return newState
    default:
      return state
  }
}
