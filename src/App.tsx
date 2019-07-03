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
import {DataDisplayer, PreviewDisplayer} from "./lib/components";
import {SCRIPT} from "./test";
import {CharacterEditDialog, CharaListPanel} from "./lib/chara_list";
import {CharactersList, ContainerData} from "./lib/models";
import PreviewPanel from "./lib/preview";

const CenterCol = styled.div` 
margin: 20px; 
text-align: center;     
display: flex;
flex-direction: column;`;

const Container = styled.div`
    display: inline-flex;Ø
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
            const c = new ScriptContoller(s.root.id, new CharactersList(), {
                    onImageUpload(file: File, blockId: string): Promise<string> {
                        const form = new FormData();
                        form.set('file', file);
                        return fetch(`http://localhost:3000/uploads/${s.root.id}/${blockId}`, {
                            body: form,
                            method: 'post',
                            headers: {'Accept': 'application/json'}
                        }).then((resp) => {
                            if (!resp.ok) {
                                throw new Error(resp.statusText)
                            }
                            return resp;
                        }).then(resp => resp.json()
                            .then(json => `http://localhost:3000${json.url}`)
                        )
                    },
                    onImageDelete:
                        async (blockId: string): Promise<void> => {
                            return fetch(`http://localhost:3000/uploads/${s.root.id}/${blockId}`, {
                                method: 'delete'
                            }).then((resp) => {
                                if (!resp.ok) {
                                    throw new Error(resp.statusText)
                                }
                                return resp;
                            }).then()
                        },
                    onScriptSave:
                        async (json: any): Promise<void> => {

                        },
                    autosaveInterval:
                        30
                }
                )
            ;
            c.importScript(s);
            return c;
        })
    ;
    const rootBlock = controller.rootContainer.data as ContainerData;
    const block = new BlockContainerController(controller.rootContainer.id, rootBlock.blocks);
    return (
        <CenterCol>
            <CharacterEditDialog header="Character list editor"
                                 list={controller.list}
                                 onCharaRenamed={controller.renameCharacter}
            />
            <Container>
                <ControllerContext.Provider value={controller}>
                    <BlockContainer block={block}/>
                </ControllerContext.Provider>
            </Container>
            <PreviewDisplayer root={controller.rootContainer}/>
            <DataDisplayer block={block}/>
        </CenterCol>
    );
}

export default App;
