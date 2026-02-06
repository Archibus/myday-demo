import React from 'react';
import './App.css';

import {Home} from "./pages/Home";
import {useAtomValue} from "jotai";
import {isAuthenticatedAtom} from "./store/authentication";
import {Login} from "./pages/SSOAuth";

const App = () => {
    const isAuthenticated = useAtomValue(isAuthenticatedAtom);

    return (
        isAuthenticated ? <Home /> : <Login />
    );
}

export default App;
