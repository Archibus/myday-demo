import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { OAuth2Service } from './utils/oauth2Service';
import { oauthConfig } from './config/oauth.config';

// Initialize OAuth2 service for native bridge
const oauth2Service = new OAuth2Service(oauthConfig);

// Expose global function for native mobile apps to inject tokens
// This allows iOS/Android to call: window.injectNativeTokens({accessToken, idToken, expiresIn})
declare global {
  interface Window {
    injectNativeTokens: (tokenData: {
      accessToken: string;
      idToken: string;
      expiresIn?: number;
    }) => boolean;
    isNativeTokenInjected: boolean;
  }
}

window.injectNativeTokens = (tokenData) => {
  const success = oauth2Service.injectTokensFromNative(tokenData);
  if (success) {
    window.isNativeTokenInjected = true;
    // Dispatch event to notify React app that tokens are ready
    window.dispatchEvent(new CustomEvent('nativeTokensInjected'));
  }
  return success;
};

window.isNativeTokenInjected = false;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
