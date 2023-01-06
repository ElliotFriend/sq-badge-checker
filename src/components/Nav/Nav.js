import './Nav.css';
import React,  { useEffect } from 'react';
import { useHistory } from 'react-router-dom'
import albedo from '@albedo-link/intent'
import { isValidSig } from '../../lib/utils.js'

/**
 * This component serves as a "navigation bar" of sorts for the user. They have
 * the option to connect albedo and begin generating their proof. When they are
 * looged in, they have the option to logoff. We also display their public key
 * in the navbar when that is the case. While looking at their badges, they can
 * click "export" to begin the export/token-generation process, and they can
 * choose which badges to display and/or filter.
 */
export default function Nav(props) {
  let history = useHistory()
  let quester = props.quester
  let setQuester = props.setQuester

  useEffect(() => {
    // We will run the `filterAssets()` function after any of the filter
    // states have been changed.
    filterAssets(quester.all_assets)
  }, [quester.soroban, quester.learn, quester.legacy, quester.monochrome, quester.side, quester.missing, quester.user_assets])

  // Toggles whether soroban quest badges should be shown or not.
  function toggleSorobanBadges(e) {
    setQuester({soroban: e.target.checked, type: 'toggle_soroban'})
  }

  // Toggles whether legacy badges should be shown or not.
  function toggleLearnBadges(e) {
    setQuester({learn: e.target.checked, type: 'toggle_learn'})
  }

  // Toggles whether legacy badges should be shown or not.
  function toggleLegacyBadges(e) {
    setQuester({legacy: e.target.checked, type: 'toggle_legacy'})
  }

  // Toggles whether monochrome badges should be shown or not.
  function toggleMonochromeBadges(e) {
    setQuester({monochrome: e.target.checked, type: 'toggle_monochrome'})
  }

  // Toggles whether side quest badges should be shown or not.
  function toggleSideBadges(e) {
    setQuester({side: e.target.checked, type: 'toggle_side'})
  }

  // Toggles whether missing (not earned) badges should be shown or not.
  function toggleMissingBadges(e) {
    setQuester({missing: e.target.checked, type: 'toggle_missing'})
  }

  // Toggles whether quest desciptions should be shown on cards or not.
  function toggleQuestDescriptions(e) {
    setQuester({descriptions: e.target.checked, type: 'toggle_descriptions'})
  }

  // Runs through our allAssets array, and sets a selection of assets to be
  // displayed on the `/prove` page to be seen by the user.
  function filterAssets(allAssets) {
    let filteredAssets = [...allAssets]
    // Filter out soroban badges
    if (!quester.soroban) {
      filteredAssets = filteredAssets
        .filter(item => item.soroban !== true)
    }
    // Filter out legacy badges
    if (!quester.learn) {
      filteredAssets = filteredAssets
        .filter(item => item.learn !== true)
    }
    // Filter out legacy badges
    if (!quester.legacy) {
      filteredAssets = filteredAssets
        .filter(item => item.legacy !== true)
    }
    // Filter out monochrome badges
    if (!quester.monochrome) {
      filteredAssets = filteredAssets
        .filter(item => item.monochrome !== true)
    }
    // Filter out side quest badges (SSQ01, SSQ02, and [someday?] others)
    if (!quester.side) {
      filteredAssets = filteredAssets
        .filter(item => item.side !== true)
    }
    // Filter out badges the user has not earned
    if (!quester.missing) {
      filteredAssets = filteredAssets
        .filter(item => item.owned === true)
    }
    setQuester({display_assets: filteredAssets, type: 'display_assets'})
  }

  /**
   * Toggle whether or not to begin the export process. This will prompt a user
   * to add their verification message, sign with their secret key, and redirect
   * to the `/export` page. It all begins with this toggle "switch"
   */
  function toggleExportState(e) {
    setQuester({export: !quester.export, type: 'toggle_export'})
  }

  /**
   * Prompt a user to prove they can sign for the account in question. Uses
   * Albedo, so the user can select whichever public address they have access to
   */
  async function login() {
    let tokenToSign = 'QWxsIGhhaWwgQGthbGVwYWlsIQ=='
    await albedo.publicKey({
      token: tokenToSign
    })
    .then(res => {
      if (isValidSig(res.pubkey, tokenToSign, res.signature)) {
        props.setQuester({pubkey: res.pubkey, type: 'login'})
        history.push("/prove/" + res.pubkey)
      }
    })
  }

  /**
   * "Logs out" the user by returning the initial state, and redirecting to the
   * app's homepage.
   */
  function logout() {
    setQuester({type: 'logout'})
    history.push('/')
  }

  return (
    <div className="container-fluid bg-dark" id="header-div">
      <header className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-4">
        <a href="/" className="navbar-brand text-reset">
          <h5 className="my-auto">
            <img src="/assets/logo.svg" alt="Stellar Quest Logo" />
            <span>Stellar Quest <small className="text-muted">Badge Checker</small></span>
          </h5>
        </a>
        { quester.pubkey ?
          <div className="col my-auto text-truncate">
            {quester.pubkey}
          </div> : null
        }
        <div className="row">
          <div className="my-auto col text-end">
            { quester.pubkey && !quester.export ?
            <div className="dropdown">
              <button className="btn btn-secondary dropdown-toggle" href="#" id="dropdownMenuLink" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
                Filter
              </button>
              <ul className="dropdown-menu" aria-labelledby="dropdownMenuLink">
                <li>
                  <button className="dropdown-item">
                    <div className="form-check form-switch">
                      <input onChange={toggleSorobanBadges} className="form-check-input" type="checkbox" id="includeSoroban" checked={quester.soroban} />
                      <label className="form-check-label" htmlFor="includeSoroban">Include Soroban badges?</label>
                    </div>
                  </button>
                </li>
                <li>
                  <button className="dropdown-item">
                    <div className="form-check form-switch">
                      <input onChange={toggleLearnBadges} className="form-check-input" type="checkbox" id="includeLearn" checked={quester.learn} />
                      <label className="form-check-label" htmlFor="includeLearn">Include learn badges?</label>
                    </div>
                  </button>
                </li>
                <li>
                  <button className="dropdown-item">
                    <div className="form-check form-switch">
                      <input onChange={toggleLegacyBadges} className="form-check-input" type="checkbox" id="includeLegacy" checked={quester.legacy} />
                      <label className="form-check-label" htmlFor="includeLegacy">Include legacy badges?</label>
                    </div>
                  </button>
                </li>
                <li>
                  <button className="dropdown-item">
                    <div className="form-check form-switch">
                      <input onChange={toggleMonochromeBadges} className="form-check-input" type="checkbox" id="includeMonochrome" checked={quester.monochrome} />
                      <label className="form-check-label" htmlFor="includeMonochrome">Include monochrome badges?</label>
                    </div>
                  </button>
                </li>
                <li>
                  <button className="dropdown-item">
                    <div className="form-check form-switch">
                      <input onChange={toggleSideBadges} className="form-check-input" type="checkbox" id="includeSide" checked={quester.side} />
                      <label className="form-check-label" htmlFor="includeSide">Include side quest badges?</label>
                    </div>
                  </button>
                </li>
                <li>
                  <button className="dropdown-item">
                    <div className="form-check form-switch">
                      <input onChange={toggleMissingBadges} className="form-check-input" type="checkbox" id="includeMissing" checked={quester.missing} />
                      <label className="form-check-label" htmlFor="includeMissing">Include missing badges?</label>
                    </div>
                  </button>
                </li>
                <li>
                  <button className="dropdown-item">
                    <div className="form-check form-switch">
                    <input onChange={toggleQuestDescriptions} className="form-check-input" type="checkbox" id="includeDescriptions" checked={quester.descriptions} />
                    <label className="form-check-label" htmlFor="includeDescriptions">Include quest descriptions?</label>
                    </div>
                  </button>
                </li>
              </ul>
            </div> : null
            }
            {
              !quester.export && quester.pubkey
                ? <button type="button" className="btn btn-success" data-bs-toggle="modal" data-bs-target="#verificationModal">Export Proof</button>
                : quester.pubkey && quester.export
                ? <button type="button" className="btn btn-success" onClick={toggleExportState}>Back to Badges</button>
                : null
            }
            { !quester.pubkey
                ? <button type="button" className="btn btn-primary" onClick={login}>Connect Albedo</button>
                : <button type="button" className="btn btn-primary" onClick={logout}>Logout</button>
            }
          </div>
        </div>
      </header>
    </div>
  )
}
