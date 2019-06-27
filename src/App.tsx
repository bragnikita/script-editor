import React, {useState} from 'react';
import './App.css';
import styled from "styled-components";
import {BlockContainerController, ContainerData, ScriptContoller} from "./lib/controller";
import {ControllerContext} from "./lib/hooks"
import {BlockContainer} from "./lib/block_container";
import 'bulma'
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'
import {DataDisplayer} from "./lib/components";
import {SCRIPT} from "./test";

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

    const id = "001";
    const [controller] = useState(() => {
        const s = {
            title: "Battle 1",
            imagesRootPath: `http://localhost:3004`,
            root: {
                id: id,
                type: "container",
                data: {
                    title: "",
                    blocks: SCRIPT
                }
            }
        };
        const c = new ScriptContoller(s.root.id);
        c.importScript(s);
        return c;
    });
    const rootBlock = controller.rootContainer.data as ContainerData;
    const block = new BlockContainerController(controller.rootContainer.id, rootBlock.blocks);
    return (
        <CenterCol>
            <Container>
                <ControllerContext.Provider value={controller}>
                    <BlockContainer block={block}/>
                </ControllerContext.Provider>
            </Container>
            <DataDisplayer block={block}/>
        </CenterCol>
    );
}

export default App;
