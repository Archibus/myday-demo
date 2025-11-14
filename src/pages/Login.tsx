import styled from 'styled-components';
import {useEffect, useState} from "react";
import {SwiftConnect} from "@archibus/swift-connect";
import {Loader} from "../components/Loader";
import {useSetAtom} from "jotai";
import {isAuthenticatedAtom} from "../store/authentication";
import addToWalletButton from "../assets/add_to_google_wallet_wallet-button.png";
import {PluginListenerHandle, registerPlugin} from "@capacitor/core";
import { PdfViewer } from 'cap-pdf-viewer';

// @ts-ignore
const IntuneMAM = registerPlugin('IntuneMAM', {}) as Intune.IntuneMAM;



const Container = styled.div`
    display: flex;
    height: 100vh;
    width: 100vw;
    justify-content: center;
`;

const LoginContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: center;
    padding-top: 80px;
`;

const Button = styled.button`
    height: 40px;
    width: 120px;
    color: white;
    background-color: #61dafb;
    border: none;
    font-size: 16px;
    border-radius: 4px;
`;

const Input = styled.input`
    height: 40px;
    width: 240px;
    color: black;
    font-size: 14px;
    background-color: white;
    box-sizing: border-box;
    padding: 6px;
    border-radius: 4px;
`;

export const Login = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [addToWallet, setAddToWallet] = useState(false);

    const setIsAuthenticated = useSetAtom(isAuthenticatedAtom);

    /*
    useEffect(() => {
        return () => {
            setIsLoading(false);
        }
    }, [])

     */

    useEffect(() => {
        let onStartListener: PluginListenerHandle | null = null;
        let onResumeListener: PluginListenerHandle | null = null;
        let onStopListener: PluginListenerHandle | null = null;
        let onDestroyListener: PluginListenerHandle | null = null;
        (async () => {
            onResumeListener = await SwiftConnect.addListener('SwiftConnectPluginResume', () => {
                alert('Plugin Resumed');
            });
            onStopListener = await SwiftConnect.addListener('SwiftConnectPluginStop', () => {
                alert('Plugin Stopped');
            });
            onStartListener = await SwiftConnect.addListener('SwiftConnectPluginStart', () => {
                alert('Plugin Started');
            });
            onDestroyListener = await SwiftConnect.addListener('SwiftConnectPluginDestroy', () => {
                alert('Plugin Destroyed');
            });
        })()
        return () => {
            onResumeListener?.remove()
            onStopListener?.remove()
            onStartListener?.remove()
            onDestroyListener?.remove()
        }
    }, [])


    /*
    useEffect(() => {
        (async () => {
            try {
                await SwiftConnect.loginWithUser();
                const walletData = await SwiftConnect.fetchWalletData();
                if (walletData.hasCredentialLink) {
                    await SwiftConnect.viewInWallet();
                }
                if (walletData.isCredentialDeployable) {
                    setAddToWallet(true);
                }
            } catch(ex) {
                alert('Oops! Something went wrong');
                if(ex instanceof Error) {
                    alert(ex.message);
                }
            }
        })()
    }, [])

     */

    const onTestMsalScope = async () => {
        if(IntuneMAM) {
            alert('IntuneMAM is available');
        }

        const msalScope = await IntuneMAM.getMsalScope();
        alert('IntuneMAM msalScope' + JSON.stringify(msalScope));

    }

    const onLoginButtonClick = async () => {
        if(IntuneMAM) {
            alert('IntuneMAM is available');
        }
        const tokens = await IntuneMAM.acquireTokenSilent();
        alert('IntuneMAM ' + tokens.idToken);
        const user = await IntuneMAM.enrolledAccount();
        const msalScope = await IntuneMAM.getMsalScope();
        alert('IntuneMAM msalScope' + msalScope);
        if (user) {
            console.log('upn', user.upn, ' scope: ', msalScope.scope);
            const scope = msalScope.scope;

            /*
            const tokens = await IntuneMAM.acquireTokenSilent({
                scopes: [scope],
                upn: user.upn
            });

             */
            if(IntuneMAM) {
                alert('IntuneMAM is available');
            }
            const tokens = await IntuneMAM.acquireTokenSilent();
            alert('IntuneMAM ' + tokens.idToken);
            if (tokens.idToken) {
                await SwiftConnect.setIdToken({idToken: tokens.idToken});
                alert('IntuneMAM ' + tokens.idToken);
            }
        }


        setIsLoading(true);
        try {
            const user = username.toLowerCase().trim();
            await SwiftConnect.loginWithEmail({username: user, password});
            setIsLoading(false);
            alert('User logged in');
        } catch (e) {
            setIsLoading(false);
            alert('Login failed');
        }
    }

    const onLoginUser = async () => {
        try {
            setIsLoading(true);
            await SwiftConnect.loginWithUser();
            setIsLoading(false);
            alert('User logged in');
        } catch (e) {
            setIsLoading(false);
            alert('Login failed');
        }
    }

    const onLoginWithToken = async () => {
        try {
            setIsLoading(true);
            await SwiftConnect.loginWithToken();
            setIsLoading(false);
            alert('User logged in');
        } catch (e) {
            setIsLoading(false);
            alert('Login failed');
        }
    }

    const onOpenPdf = async () => {
        try {
            PdfViewer.present({url: 'https://www.adobe.com/support/products/enterprise/knowledgecenter/media/c4611_sample_explain.pdf'});
        } catch (e) {
            alert('Failed to open PDF');
        }
    }

    const onFetchWalletData = async () => {
        try {
            setIsLoading(true);
            const walletData = await SwiftConnect.fetchWalletData();
            if (walletData.hasCredentialLink) {
                await SwiftConnect.viewInWallet();
            }
            if (walletData.isCredentialDeployable) {
                setIsAuthenticated(true);
            }
            alert("Wallet data is not available");
            setIsLoading(false);
        } catch (e) {
            setIsLoading(false);
            alert('Fetch Wallet Data failed');
        }
    }

    const onIsSdkInitialized = async () => {
        const isInitialized = await SwiftConnect.isSdkInitialized();
        alert(isInitialized.value ? 'SDK is initialized' : 'SDK is not initialized');
    }

    const onAddToWallet = async () => {
        await SwiftConnect.addToWallet();
    }

    return (
        <>
            {isLoading ? <Loader isLoading={isLoading}/> : null}
            {addToWallet ? <Container>
                    <img src={addToWalletButton} alt="add to wallet" onClick={onAddToWallet}/>
                </Container> :
                <Container>
                    <LoginContainer>
                        <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)}/>
                        <Input type="password" autoComplete="new-password" value={password}
                               onChange={(e) => setPassword(e.target.value)}/>
                        <Button onClick={onLoginButtonClick}>Login</Button>
                        <Button onClick={onLoginUser}>Login User</Button>
                        <Button onClick={onFetchWalletData}>Fetch Wallet Data</Button>
                        <Button onClick={onIsSdkInitialized}>Is SDK Initialized</Button>
                        <Button onClick={onLoginWithToken}>Login With Token</Button>
                        <Button onClick={onOpenPdf}>Open PDF</Button>
                        <Button onClick={onTestMsalScope}>Test Msal Scope</Button>
                    </LoginContainer>

                </Container>
            }
        </>
    );
}
