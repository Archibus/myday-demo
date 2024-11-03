import React, {useEffect} from 'react';
import './App.css';
// import styled from 'styled-components';
import {SwiftConnect} from "@archibus/swift-connect";
// import {Preferences} from "@capacitor/preferences";

import {Login} from "./pages/Login";
import {Main} from "./pages/Main";
import {useAtomValue} from "jotai";
import {isAuthenticatedAtom} from "./store/authentication";


/*
const Container = styled.div`
    border: 4px solid #61dafb;
    display: flex;
    height: 100vh;
    justify-content: center;
    align-items: center;
`;

const Button = styled.button`
    height: 40px;
    width: 120px;
    color: white;
    background-color: #61dafb;
`;

 */



const App = () => {
    const isAuthenticated = useAtomValue(isAuthenticatedAtom);
    useEffect(() => {
            SwiftConnect.addListener('WalletDataReady', (data) => {
                alert('WalletDataReady ' + JSON.stringify(data));
            });
            return () => {
                alert('remove listener');
            }
        }
        , []);

    return (
        isAuthenticated ? <Main /> : <Login />
    );
}

export default App;
