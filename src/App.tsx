import React, {useState} from 'react';
import './App.css';
import styled from "styled-components";
import {BlockContainerController, ScriptContoller} from "./lib/controller";
import {ControllerContext} from "./lib/hooks"
import {BlockContainer} from "./lib/block_container";
import 'bulma'
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'

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
    width: 100%;    
    padding: 10px;
    min-width: 300px;
`;


const App: React.FC = () => {

    const [controller] = useState(new ScriptContoller());
    const [block] = useState(() => {
        const c = new BlockContainerController();
        c.addBlock();
        return c;
    });

    return (
        <CenterCol>
            <Container>
                <ControllerContext.Provider value={controller}>
                    <BlockContainer block={block}/>
                </ControllerContext.Provider>
            </Container>
        </CenterCol>
    );
}

export default App;
