import React, {useEffect} from 'react';
import './App.css';
import styled from 'styled-components';
import {SwiftConnect} from "@archibus/swift-connect";
import {Preferences} from "@capacitor/preferences";

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


function App() {
    useEffect(() => {
        SwiftConnect.addListener('WalletDataReady', (data) => {
            console.log('onLogin', data);
            alert('WalletDataReady ' + JSON.stringify(data));
        });
    }
    , []);
    const onButtonClick = async () => {
       alert('button clicked');
    }

    const onTokenButtonClick = async () => {
        const {value} = await Preferences.get({key: 'idToken'});
        alert(value);
    }

    return (
        <Container>
            <Button onClick={onButtonClick}>Click me</Button>
            <Button onClick={onTokenButtonClick}>Get Token</Button>
        </Container>
    );
}

export default App;
