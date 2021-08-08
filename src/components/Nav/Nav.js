import './Nav.css';
import React,  { useEffect } from 'react';
import { useHistory } from 'react-router-dom'
import albedo from '@albedo-link/intent'
import { isValidSig } from '../../lib/utils.js'

export default function Nav(props) {
  let history = useHistory()
  let quester = props.quester
  let setQuester = props.setQuester

  useEffect(() => {
    /* We will run the `filterAssets()` function after any of the filter
     * states have been changed.
     */
    filterAssets(quester.all_assets)
  }, [quester.monochrome, quester.events, quester.missing, quester.user_assets])

  /* Toggles whether monochrome badges should be shown or not. */
  function toggleMonochromeBadges(e) {
    setQuester({monochrome: e.target.checked, type: 'toggle_monochrome'})
  }

  /* Toggles whether event badges should be shown or not. */
  function toggleEventBadges(e) {
    setQuester({events: e.target.checked, type: 'toggle_events'})
  }

  /* Toggles whether missing (not earned) badges should be shown or not. */
  function toggleMissingBadges(e) {
    setQuester({missing: e.target.checked, type: 'toggle_missing'})
  }

  /* Toggles whether quest desciptions should be shown on cards or not. */
  function toggleQuestDescriptions(e) {
    setQuester({descriptions: e.target.checked, type: 'toggle_descriptions'})
  }

  /* Runs through our allAssets array, and sets a selection of assets to be
   * displayed on the `/prove` page to be seen by the user.
   */
  function filterAssets(allAssets) {
    let filteredAssets = [...allAssets]
    // Filter out monochrome badges
    if (!quester.monochrome) {
      filteredAssets = filteredAssets
        .filter(item => item.monochrome !== true)
    }
    // Filter out event badges (SSQ01, and [someday?] others)
    if (!quester.events) {
      filteredAssets = filteredAssets
        .filter(item => item.event !== true)
    }
    // Filter out badges the user has not earned
    if (!quester.missing) {
      filteredAssets = filteredAssets
        .filter(item => item.owned === true)
    }
    setQuester({display_assets: filteredAssets, type: 'display_assets'})
  }

  /* Toggle whether or not to begin the export process. This will prompt a user
   * to add their verification message, sign with their secret key, and redirect
   * to the `/export` page. It all begins with this toggle "switch"
   */
  function toggleExportState(e) {
    setQuester({export: !quester.export, type: 'toggle_export'})
  }

  /* Prompt a user to prove they can sign for the account in question. Uses
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

  /* "Logs out" the user by returning the initial state, and redirecting to the
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
                      <input onChange={toggleMonochromeBadges} className="form-check-input" type="checkbox" id="includeMonochrome" checked={quester.monochrome} />
                      <label className="form-check-label" for="includeMonochrome">Include monochrome badges?</label>
                    </div>
                  </button>
                </li>
                <li>
                  <button className="dropdown-item">
                    <div className="form-check form-switch">
                      <input onChange={toggleEventBadges} className="form-check-input" type="checkbox" id="includeEvents" checked={quester.events} />
                      <label className="form-check-label" for="includeEvents">Include special event badges?</label>
                    </div>
                  </button>
                </li>
                <li>
                  <button className="dropdown-item">
                    <div className="form-check form-switch">
                      <input onChange={toggleMissingBadges} className="form-check-input" type="checkbox" id="includeMissing" checked={quester.missing} />
                      <label className="form-check-label" for="includeMissing">Include missing badges?</label>
                    </div>
                  </button>
                </li>
                <li>
                  <button className="dropdown-item">
                    <div className="form-check form-switch">
                    <input onChange={toggleQuestDescriptions} className="form-check-input" type="checkbox" id="includeDescriptions" checked={quester.descriptions} />
                    <label className="form-check-label" for="includeDescriptions">Include quest descriptions?</label>
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
