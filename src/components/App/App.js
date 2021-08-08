import './App.css';
import React, { useReducer, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom'
import questerReducer from './questerReducer'
import { initialState } from './questerInitialState'
import Nav from '../Nav/Nav'
import Cover from '../Cover/Cover'
import Footer from '../Footer/Footer'
import Proof from '../Proof/Proof'
import Export from '../Export/Export'
import Verify from '../Verify/Verify'

function App() {
  const [quester, setQuester] = useReducer(questerReducer, initialState)

  useEffect(() => {
    filterAssets(quester.all_assets)
  }, [quester.monochrome, quester.events, quester.missing, quester.user_assets])

  function toggleExportState(e) {
    setQuester({export: !quester.export, type: 'toggle_export'})
  }

  function filterAssets(allAssets) {
    let filteredAssets = [...allAssets]
    if (!quester.monochrome) {
      filteredAssets = filteredAssets
        .filter(item => item.monochrome !== true)
    }
    if (!quester.events) {
      filteredAssets = filteredAssets
        .filter(item => item.special !== true)
    }
    if (!quester.missing) {
      filteredAssets = filteredAssets
        .filter(item => item.owned === true)
    }
    setQuester({display_assets: filteredAssets, type: 'display_assets'})
  }

  return (
    <Router>
      <main className="App">
        <Nav quester={quester}
             setQuester={setQuester}
             toggleExportState={toggleExportState} />
        <Switch>
          <Route path="/prove/:pubkey?">
            <Proof quester={quester}
                   setQuester={setQuester} />
          </Route>
          <Route path="/export/:pubkey">
            <Export badges={quester.display_assets}
                    pubkey={quester.pubkey}
                    verText={quester.verification_text}
                    messSig={quester.message_signature}
                    exportStatus={quester.export}
                    user_assets={quester.user_assets} />
          </Route>
          <Route path="/verify/:basestring?">
            <Verify />
          </Route>
          <Route path="/">
            <Cover setQuester={setQuester} />
          </Route>
        </Switch>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
