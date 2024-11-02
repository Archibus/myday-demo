import React, {PropsWithChildren, ReactElement, useEffect} from 'react';
import './App.css';
import styled from 'styled-components';
import {SwiftConnect} from "@archibus/swift-connect";
// import {Preferences} from "@capacitor/preferences";
import {createBrowserRouter, RouterProvider} from "react-router-dom";

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


const PrivateRoute = ({children}: {children: ReactElement}) => {
    const isAuthenticated = useAtomValue(isAuthenticatedAtom);
    return isAuthenticated ? children : <Login/>;
}


const router = createBrowserRouter([{
    path: '/',
    element: <PrivateRoute><Main/></PrivateRoute>,
}, {path: '/login', element: <Login/>}
]);


const App = () => {

    useEffect(() => {
            SwiftConnect.addListener('WalletDataReady', (data) => {
                alert('WalletDataReady ' + JSON.stringify(data));

            });
        }
        , []);

    return (
        <RouterProvider router={router}/>
    );
}

export default App;
