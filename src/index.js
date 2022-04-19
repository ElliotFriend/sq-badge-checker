import React from 'react';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import './index.css';
import App from './components/App/App';
import reportWebVitals from './reportWebVitals';

Sentry.init({
  dsn: "https://85739d886a534ad2b90717858e090e7b@o817895.ingest.sentry.io/6347031",
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
})

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
