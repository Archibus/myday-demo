import { PKCEUtils } from './pkce';

export interface OAuthConfig {
  clientId: string;
  authorityUrl: string; // e.g., https://login.microsoftonline.com/common
  redirectUri: string;
  scopes: string[];
}

export interface TokenResponse {
  accessToken: string;
  idToken: string;
  expiresIn: number;
  expiresAt: number;
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  givenName?: string;
  familyName?: string;
  upn?: string;
}

export class OAuth2Service {
  private config: OAuthConfig;
  private readonly STORAGE_PREFIX = 'oauth2_';
  private readonly CODE_VERIFIER_KEY = `${this.STORAGE_PREFIX}code_verifier`;
  private readonly STATE_KEY = `${this.STORAGE_PREFIX}state`;
  private readonly TOKENS_KEY = `${this.STORAGE_PREFIX}tokens`;
  private readonly USER_INFO_KEY = `${this.STORAGE_PREFIX}user_info`;

  constructor(config: OAuthConfig) {
    this.config = config;
  }

  /**
   * Initiate login flow - redirects to MS login page
   */
  async initiateLogin(): Promise<void> {
    try {
      const codeVerifier = PKCEUtils.generateCodeVerifier();
      const codeChallenge = await PKCEUtils.generateCodeChallenge(codeVerifier);
      const state = PKCEUtils.generateState();

      // Store for later verification
      sessionStorage.setItem(this.CODE_VERIFIER_KEY, codeVerifier);
      sessionStorage.setItem(this.STATE_KEY, state);

      const params = new URLSearchParams({
        client_id: this.config.clientId,
        response_type: 'code',
        redirect_uri: this.config.redirectUri,
        scope: this.config.scopes.join(' '),
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        state: state,
        prompt: 'select_account',
      });

      const loginUrl = `${this.config.authorityUrl}/oauth2/v2.0/authorize?${params.toString()}`;
      window.location.href = loginUrl;
    } catch (error) {
      console.error('Error initiating login:', error);
      throw error;
    }
  }

  /**
   * Handle OAuth callback - exchange code for tokens
   */
  async handleCallback(): Promise<TokenResponse | null> {
    try {
      const code = PKCEUtils.getQueryParam('code');
      const state = PKCEUtils.getQueryParam('state');
      const error = PKCEUtils.getQueryParam('error');
      const errorDescription = PKCEUtils.getQueryParam('error_description');

      if (error) {
        throw new Error(
          `OAuth error: ${error} - ${errorDescription || 'Unknown error'}`
        );
      }

      if (!code) {
        return null; // Not in callback
      }

      // Verify state
      const storedState = sessionStorage.getItem(this.STATE_KEY);
      if (state !== storedState) {
        throw new Error('State mismatch - possible CSRF attack');
      }

      const codeVerifier = sessionStorage.getItem(this.CODE_VERIFIER_KEY);
      if (!codeVerifier) {
        throw new Error('Code verifier not found');
      }

      // Exchange code for tokens
      const tokenResponse = await this.exchangeCodeForTokens(code, codeVerifier);

      // Store tokens and clear temporary values
      this.storeTokens(tokenResponse);
      sessionStorage.removeItem(this.CODE_VERIFIER_KEY);
      sessionStorage.removeItem(this.STATE_KEY);

      // Clean URL by removing query parameters
      window.history.replaceState({}, document.title, window.location.pathname);

      return tokenResponse;
    } catch (error) {
      console.error('Error handling callback:', error);
      throw error;
    }
  }

  /**
   * Exchange authorization code for tokens
   */
  private async exchangeCodeForTokens(
    code: string,
    codeVerifier: string
  ): Promise<TokenResponse> {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      scope: this.config.scopes.join(' '),
      code: code,
      redirect_uri: this.config.redirectUri,
      grant_type: 'authorization_code',
      code_verifier: codeVerifier,
    });

    const response = await fetch(
      `${this.config.authorityUrl}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Token exchange failed: ${error.error} - ${error.error_description}`
      );
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      idToken: data.id_token,
      expiresIn: data.expires_in,
      expiresAt: Date.now() + data.expires_in * 1000,
    };
  }

  /**
   * Store tokens in localStorage for session persistence
   */
  private storeTokens(tokens: TokenResponse): void {
    localStorage.setItem(this.TOKENS_KEY, JSON.stringify(tokens));
  }

  /**
   * Retrieve stored tokens
   */
  getTokens(): TokenResponse | null {
    const stored = localStorage.getItem(this.TOKENS_KEY);
    if (!stored) {
      return null;
    }
    return JSON.parse(stored);
  }

  /**
   * Check if tokens are still valid
   */
  isTokenValid(tokens: TokenResponse | null): boolean {
    if (!tokens) {
      return false;
    }
    // Check if token expires in next 5 minutes
    return tokens.expiresAt > Date.now() + 5 * 60 * 1000;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const tokens = this.getTokens();
    return this.isTokenValid(tokens);
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    const tokens = this.getTokens();
    if (this.isTokenValid(tokens)) {
      return tokens!.accessToken;
    }
    return null;
  }

  /**
   * Decode ID token to get user info
   */
  decodeIdToken(idToken: string): UserInfo | null {
    try {
      const parts = idToken.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const decoded = JSON.parse(atob(parts[1]));

      return {
        id: decoded.oid || decoded.sub,
        email: decoded.preferred_username || decoded.email,
        name: decoded.name,
        givenName: decoded.given_name,
        familyName: decoded.family_name,
        upn: decoded.upn,
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Get cached user info
   */
  getUserInfo(): UserInfo | null {
    const stored = localStorage.getItem(this.USER_INFO_KEY);
    if (!stored) {
      const tokens = this.getTokens();
      if (tokens) {
        const userInfo = this.decodeIdToken(tokens.idToken);
        if (userInfo) {
          this.storeUserInfo(userInfo);
          return userInfo;
        }
      }
      return null;
    }
    return JSON.parse(stored);
  }

  /**
   * Store user info in localStorage
   */
  storeUserInfo(userInfo: UserInfo): void {
    localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(userInfo));
  }

  /**
   * Logout - clear all stored data
   */
  logout(): void {
    localStorage.removeItem(this.TOKENS_KEY);
    localStorage.removeItem(this.USER_INFO_KEY);
    sessionStorage.removeItem(this.CODE_VERIFIER_KEY);
    sessionStorage.removeItem(this.STATE_KEY);
  }

  /**
   * Get authorization header for API requests
   */
  getAuthorizationHeader(): string | null {
    const token = this.getAccessToken();
    if (!token) {
      return null;
    }
    return `Bearer ${token}`;
  }
}

