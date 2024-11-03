import {RingLoader} from "react-spinners";
import styled from 'styled-components';

const Container = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 20;
`;

interface LoaderProps {
    isLoading: boolean;
}

export const Loader = ({isLoading}: LoaderProps) => {
    return <Container>
        <RingLoader
        loading={isLoading}
        color="black"
    />
    </Container>
}
