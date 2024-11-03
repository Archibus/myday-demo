import styled from 'styled-components';
import {isAuthenticatedAtom} from "../store/authentication";
import {useSetAtom} from "jotai";
import {useState} from "react";
import {SwiftConnect} from "@archibus/swift-connect";

const Container = styled.div`
    border: 4px solid #61dafb;
    display: flex;
    height: 100vh;
    justify-content: center;
    align-items: center;
`;

const LoginContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: center;
`;

const Button = styled.button`
    height: 40px;
    width: 120px;
    color: white;
    background-color: #61dafb;
`;

const Input = styled.input`
    height: 40px;
    width: 240px;
    color: black;
    font-size: 20px;
    background-color: white;
    box-sizing: border-box;
    padding: 6px;
`;

export const Login = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const setIsAuthenticated = useSetAtom(isAuthenticatedAtom);

    const onLoginButtonClick = async () => {
        const user = username.toLowerCase().trim();
        await SwiftConnect.loginWithEmail({username:user, password});
        setIsAuthenticated(true);
    }
    return (
        <Container>
            <LoginContainer>
            <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button onClick={onLoginButtonClick}>Login</Button>
            </LoginContainer>

        </Container>
    );
}
