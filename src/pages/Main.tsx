import styled from "styled-components";
import addToWalletButton from '../assets/add_to_google_wallet_wallet-button.png';
import {SwiftConnect} from "@archibus/swift-connect";
import {useEffect} from "react";
import {PluginListenerHandle} from "@capacitor/core";

const Container = styled.div`
    display: flex;
    height: 100vh;
    justify-content: center;
    align-items: center;
`;



export const Main = () => {

    useEffect(() => {
        let walletErrorListener: PluginListenerHandle | null = null;
        (async () => {
            walletErrorListener = await SwiftConnect.addListener('WalletError', (error) => {
                alert('Error: ' + error.error);
            });
        })()
          return () => {
            walletErrorListener?.remove()
          }
    }, [])

    const onAddToWallet = async () => {
        await SwiftConnect.addToWallet();
    }

    return (
        <Container>
            <img src={addToWalletButton} alt="add to wallet" onClick={onAddToWallet} />
        </Container>
    )
}
