import styled from "styled-components";

const Container = styled.div`
    border: 4px solid #61dafb;
    display: flex;
    height: 100vh;
    justify-content: center;
    align-items: center;
`;

export const Main = () => {
    return (
        <Container>
            <h1>Main</h1>
        </Container>
    );
}
