import styled from "styled-components";
import addToWalletButton from '../assets/add_to_google_wallet_wallet-button.png';

const Container = styled.div`
    display: flex;
    height: 100vh;
    justify-content: center;
    align-items: center;
`;



export const Main = () => {
    const onAddToWallet = () => {
        alert('Add to wallet clicked');
    }

    return (
        <Container>
            <img src={addToWalletButton} alt="add to wallet" onClick={onAddToWallet} />
        </Container>
    )
}
