import { useEffect, useState } from "react";
import { Loader } from "../components/Loader";
import { useSetAtom, useAtomValue } from "jotai";
import { isAuthenticatedAtom, oauth2ServiceAtom, userInfoAtom } from "../store/authentication";
import styled from 'styled-components';

const Container = styled.div`
    display: flex;
    height: 100vh;
    width: 100vw;
    justify-content: center;
    align-items: center;
`;

const ErrorMessage = styled.div`
    color: #d32f2f;
    font-size: 16px;
    text-align: center;
    max-width: 400px;
    padding: 20px;
    background-color: #ffebee;
    border-radius: 8px;
    border: 1px solid #ef5350;
`;

export const Login = () => {
    const [error, setError] = useState<string | null>(null);
    const [waitingForNative, setWaitingForNative] = useState(false);

    const setIsAuthenticated = useSetAtom(isAuthenticatedAtom);
    const setUserInfo = useSetAtom(userInfoAtom);
    const oauth2Service = useAtomValue(oauth2ServiceAtom);

    // Check if running inside a native WebView (mobile app)
    const isInNativeWebView = () => {
        const userAgent = navigator.userAgent || navigator.vendor;
        // Check for Capacitor, or common WebView indicators
        return /Capacitor/i.test(userAgent) ||
               /wv|WebView/i.test(userAgent) ||
               (window as any).Capacitor !== undefined;
    };

    useEffect(() => {
        // Listen for native token injection event
        const handleNativeTokens = () => {
            console.log('🔐 Native tokens received, checking authentication...');
            if (oauth2Service.isAuthenticated()) {
                const userInfo = oauth2Service.getUserInfo();
                setUserInfo(userInfo);
                setIsAuthenticated(true);
            }
        };

        window.addEventListener('nativeTokensInjected', handleNativeTokens);

        return () => {
            window.removeEventListener('nativeTokensInjected', handleNativeTokens);
        };
    }, [oauth2Service, setIsAuthenticated, setUserInfo]);

    useEffect(() => {
        const handleAuthFlow = async () => {
            try {
                // First, check if already authenticated (tokens already exist)
                if (oauth2Service.isAuthenticated()) {
                    const userInfo = oauth2Service.getUserInfo();
                    setUserInfo(userInfo);
                    setIsAuthenticated(true);
                    return;
                }

                // Check if tokens were injected from native app
                if (window.isNativeTokenInjected) {
                    const userInfo = oauth2Service.getUserInfo();
                    setUserInfo(userInfo);
                    setIsAuthenticated(true);
                    return;
                }

                // Check if this is a callback from Microsoft login
                const code = new URLSearchParams(window.location.search).get('code');

                if (code) {
                    // Handle the OAuth callback
                    const tokenResponse = await oauth2Service.handleCallback();
                    if (tokenResponse) {
                        const userInfo = oauth2Service.getUserInfo();
                        setUserInfo(userInfo);
                        setIsAuthenticated(true);
                        return;
                    }
                } else if (isInNativeWebView()) {
                    // In native WebView - wait briefly for token injection
                    console.log('🔐 Detected native WebView, waiting for token injection...');
                    setWaitingForNative(true);

                    // Give native app 2 seconds to inject tokens
                    setTimeout(() => {
                        if (!oauth2Service.isAuthenticated()) {
                            console.log('🔐 No native tokens received, falling back to PKCE login');
                            setWaitingForNative(false);
                            oauth2Service.initiateLogin();
                        }
                    }, 2000);
                } else {
                    // Not in native WebView, proceed with PKCE login
                    await oauth2Service.initiateLogin();
                }
            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : 'Authentication failed';
                setError(errorMsg);
                console.error('Home error:', err);
            }
        };

        handleAuthFlow();
    }, [oauth2Service, setIsAuthenticated, setUserInfo]);

    if (error) {
        return (
            <Container>
                <ErrorMessage>
                    <strong>Authentication Error</strong>
                    <br /><br />
                    {error}
                    <br /><br />
                    <a href="/" style={{ color: '#d32f2f', textDecoration: 'underline' }}>
                        Try again
                    </a>
                </ErrorMessage>
            </Container>
        );
    }

    return <Loader isLoading={true} />;
}
