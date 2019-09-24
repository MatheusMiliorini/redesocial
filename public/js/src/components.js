import styled from 'styled-components';

export const Wrapper = styled.div`
    border-bottom: 1px solid white;
    margin-top: 1rem;
    padding-bottom: 1rem;
    overflow: auto;
`;

export const Avatar = styled.img`
    height: 3rem;
    width: 3rem;
    border-radius: 50%;
    float: left;
    margin-right: 1rem;
`;

export const P = styled.p`
    color: white;
    display: inline-block;
    margin: 0;
`;

export const Icone = styled.i`
    color: var(--mostarda);
    font-size: 1.2rem;
`;

export const MiniBotao = styled.button`
    border: 1px solid #2E4052;
    margin-right: 0.5rem;
`;

export const BlocoPublicacao = styled.div`
    border-radius: 0.25rem;
    border: 1px solid white;
    clear: both;
    padding: 0.5rem;
    margin-bottom: 0.25rem;
`;