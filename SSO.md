# Microsoft SSO Authentication - PKCE Flow

This app uses OAuth2 PKCE (Proof Key for Code Exchange) flow for Microsoft SSO authentication.

---

## How It Works

```
User visits app → Auto-redirect to Microsoft login → User authenticates → Show app content
                                                                              ↓
                                            Session persists (close browser, still logged in)
```

### Flow:
1. User opens the app URL
2. App checks if user is authenticated (tokens in localStorage)
3. **Not authenticated** → Auto-redirect to Microsoft login (no button click)
4. User enters Microsoft credentials
5. Microsoft redirects back with authorization code
6. App exchanges code for tokens using PKCE
7. **Authenticated** → Show Home page content
8. Session persists across browser close/reopen
9. User can click "Sign Out" to logout

---

## Configuration

### Environment Variables (`.env`)

```env
REACT_APP_CLIENT_ID=73fa9866-d4cb-4010-a652-0752dda4ec93
REACT_APP_AUTHORITY_URL=https://login.microsoftonline.com/ae152420-4b0c-436f-af9f-fef07d0b88f3
REACT_APP_REDIRECT_URI=http://localhost:3000/
```

| Variable | Description |
|----------|-------------|
| `REACT_APP_CLIENT_ID` | Azure AD Application (client) ID |
| `REACT_APP_AUTHORITY_URL` | Azure AD tenant URL |
| `REACT_APP_REDIRECT_URI` | Redirect URI (must match Azure AD) |

### For Production

Update `.env`:
```env
REACT_APP_REDIRECT_URI=https://archibus.github.io/myday-demo/
```

---

## Azure AD Setup

1. Go to https://portal.azure.com
2. Azure Active Directory → App registrations → Your app
3. Click **Authentication**
4. Add these **Redirect URIs**:
   - `http://localhost:3000/` (development)
   - `https://archibus.github.io/myday-demo/` (production)
5. Click **Save**

**Important:** Redirect URIs must match EXACTLY (including trailing slash).

---

## File Structure

```
src/
├── config/
│   └── oauth.config.ts        # OAuth2 configuration
├── utils/
│   ├── pkce.ts                # PKCE cryptographic utilities
│   └── oauth2Service.ts       # OAuth2 service (login, logout, tokens)
├── store/
│   └── authentication.ts      # Jotai atoms for auth state
├── pages/
│   ├── Login.tsx              # Auto-redirect to Microsoft (no UI)
│   └── Home.tsx               # App content (shown after auth)
└── App.tsx                    # Routes based on auth state
```

---

## Key Components

### `oauth2Service.ts`
- `initiateLogin()` - Starts PKCE flow, redirects to Microsoft
- `handleCallback()` - Exchanges auth code for tokens
- `isAuthenticated()` - Checks if user has valid tokens
- `logout()` - Clears all tokens from localStorage
- `getAccessToken()` - Returns access token for API calls
- `getUserInfo()` - Returns user info from ID token

### `authentication.ts` (Jotai Atoms)
- `isAuthenticatedAtom` - Boolean auth state
- `userInfoAtom` - User profile info
- `oauth2ServiceAtom` - OAuth2 service instance

### `Login.tsx`
- Auto-redirects to Microsoft login
- Handles OAuth callback (code exchange)
- Shows loader while redirecting

### `Home.tsx`
- Your original app content
- Sign Out button at the end

---

## Session Persistence

Tokens are stored in `localStorage`:
- `oauth2_tokens` - Access token, ID token, expiry
- `oauth2_user_info` - User profile

**Persists across:**
- Page refresh ✓
- Browser close/reopen ✓
- System restart ✓

**Cleared when:**
- User clicks "Sign Out"
- Tokens expire (~1 hour)

---

## Security Features

| Feature | Description |
|---------|-------------|
| **PKCE** | Code verifier/challenge prevents code interception |
| **State Parameter** | CSRF protection |
| **No Client Secret** | Secrets never exposed in browser |
| **Token Expiration** | Auto-logout after expiry |

---

## Usage

### Check Authentication
```typescript
import { useAtomValue } from 'jotai';
import { isAuthenticatedAtom } from './store/authentication';

const isAuth = useAtomValue(isAuthenticatedAtom);
```

### Get Access Token (for API calls)
```typescript
const oauth2Service = useAtomValue(oauth2ServiceAtom);
const token = oauth2Service.getAccessToken();

// Use in API call
fetch('https://api.example.com/data', {
    headers: { 'Authorization': `Bearer ${token}` }
});
```

### Sign Out
```typescript
const oauth2Service = useAtomValue(oauth2ServiceAtom);
const setIsAuthenticated = useSetAtom(isAuthenticatedAtom);
const setUserInfo = useSetAtom(userInfoAtom);

const onSignOut = () => {
    oauth2Service.logout();
    setIsAuthenticated(false);
    setUserInfo(null);
};
```

---

## Commands

```bash
# Development
npm start

# Production build
npm run build

# Deploy to GitHub Pages
npm run deploy
```

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| `redirect_uri_mismatch` | Check URI in `.env` matches Azure AD exactly |
| `invalid_client` | Verify Client ID is correct |
| Session lost on refresh | Check localStorage not disabled |
| Can't login on production | Ensure HTTPS and correct redirect URI |

---

## Quick Reference

**Client ID:** `73fa9866-d4cb-4010-a652-0752dda4ec93`  
**Tenant ID:** `ae152420-4b0c-436f-af9f-fef07d0b88f3`  
**Auth Method:** OAuth2 PKCE  
**Session Storage:** localStorage  
**Token Expiry:** ~1 hour  

