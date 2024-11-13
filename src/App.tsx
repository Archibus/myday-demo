import React, {useEffect} from 'react';
import './App.css';

import {SwiftConnect} from "@archibus/swift-connect";

import {Login} from "./pages/Login";
import {Main} from "./pages/Main";
import {useAtom} from "jotai";
import {isAuthenticatedAtom} from "./store/authentication";
import {PluginListenerHandle} from "@capacitor/core";

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useAtom(isAuthenticatedAtom);

    useEffect(() => {
        let walletReadyListener: PluginListenerHandle | null = null;
            (async () => {
                walletReadyListener = await SwiftConnect.addListener('WalletDataReady', () => {
                    // setIsAuthenticated(true);
                });
            })()

            return () => {
                walletReadyListener?.remove();
            }
        }, [setIsAuthenticated]);

    return (
        isAuthenticated ? <Main /> : <Login />
    );
}

export default App;
