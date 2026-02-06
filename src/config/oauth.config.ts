/**
 * OAuth2 Configuration for Microsoft SSO
 * Update these values with your Azure AD application registration details
 */

export const oauthConfig = {
  // Azure AD Configuration
  clientId: process.env.REACT_APP_CLIENT_ID || 'your-client-id-here',

  // For multi-tenant apps use: https://login.microsoftonline.com/common
  // For single-tenant apps use: https://login.microsoftonline.com/{tenant-id}
  authorityUrl: process.env.REACT_APP_AUTHORITY_URL || 'https://login.microsoftonline.com/common',

  // Must match the redirect URI registered in Azure AD
  redirectUri: process.env.REACT_APP_REDIRECT_URI || 'https://archibus.github.io/myday-demo/',

  // Scopes to request
  // openid, profile, email are OpenID Connect scopes
  // Add more scopes as needed (e.g., 'https://graph.microsoft.com/User.Read')
  scopes: [
    'openid',
    'profile',
    'email',
    'https://graph.microsoft.com/User.Read',
  ],
};

