import { atom } from 'jotai';
import { OAuth2Service } from '../utils/oauth2Service';
import { oauthConfig } from '../config/oauth.config';
import { UserInfo } from '../utils/oauth2Service';

// Initialize OAuth2 service
const oauth2Service = new OAuth2Service(oauthConfig);

// Check initial authentication state
const initialAuthState = oauth2Service.isAuthenticated();
const initialUserInfo = oauth2Service.getUserInfo();

export const isAuthenticatedAtom = atom<boolean>(initialAuthState);
export const userInfoAtom = atom<UserInfo | null>(initialUserInfo);
export const oauth2ServiceAtom = atom<OAuth2Service>(oauth2Service);
