import React, {useCallback, useState} from 'react';
import './App.css';
import SerifBlock from "./lib/serif";
import styled from "styled-components";
import SelectorField from "./lib/selector";

const CenterCol = styled.div` 
margin: 20px; 
text-align: center;     
display: flex;
flex-direction: column;`;

const Container = styled.div`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin: 20px auto;
    border: 1px lightgray double;
    width: auto;    
    padding: 10px;
    min-width: 300px;
`;

const SerifTestWrapper = () => {

    const fetch = useCallback((request?: string) => {
        const list: { name: string, id: string }[] = [
            {id: "1", name: "Felicia"},
            {id: "2", name: "Yachio"},
            {id: "3", name: "Iroha"},
        ];

        if (!request) {
            return list;
        }

        const normalizedRequest = request.trim().toLowerCase().replace(" ", "");
        return list.filter((item) => {
            const normalized = item.name.toLowerCase().replace(" ", "");
            return normalized.startsWith(normalizedRequest);

        });
    }, []);
    const [data] = useState({
        text: "",
    });

    return <SerifBlock fetchCandidates={fetch} data={data} nameRequest={"ya"}/>
};

const App: React.FC = () => {
    return (
        <CenterCol>
            <Container>
                <SerifTestWrapper/>
            </Container>
            <Container>
                <SelectorField/>
            </Container>
        </CenterCol>
    );
}

export default App;
