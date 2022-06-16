import './App.css';
import React, { useReducer } from 'react';
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
import Batch from '../Batch/Batch'

/**
 * This is the main component of the app. It contains everything else within
 * the app, and manages the redirecting using the react-router-dom module.
 */
function App() {
  const [quester, setQuester] = useReducer(questerReducer, initialState)

  return (
    <Router>
      <main className="App">
        <Nav quester={quester}
             setQuester={setQuester} />
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
          <Route path="/batch">
            <Batch />
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
