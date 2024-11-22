import React from 'react';
import './App.css';

import {Login} from "./pages/Login";
import {Main} from "./pages/Main";
import {useAtomValue} from "jotai";
import {isAuthenticatedAtom} from "./store/authentication";

const App = () => {
    const isAuthenticated = useAtomValue(isAuthenticatedAtom);

    return (
        isAuthenticated ? <Main /> : <Login />
    );
}

export default App;
