import React, {useEffect} from 'react';
import './App.css';

import {SwiftConnect} from "@archibus/swift-connect";

import {Login} from "./pages/Login";
import {Main} from "./pages/Main";
import {useAtom} from "jotai";
import {isAuthenticatedAtom} from "./store/authentication";



const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useAtom(isAuthenticatedAtom);
    useEffect(() => {
            SwiftConnect.addListener('WalletDataReady', (data) => {
                alert('WalletDataReady ' + JSON.stringify(data));
                setIsAuthenticated(true);
            });
            return () => {
                alert('remove listener');
            }
        }
        , [setIsAuthenticated]);

    return (
        isAuthenticated ? <Main /> : <Login />
    );
}

export default App;
