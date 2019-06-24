import React, {useContext} from 'react';
import styled from "styled-components";
import SelectorField from "./selector";
import {observer} from "mobx-react";
import {BlockContainerController, ControllerContext, ScriptBlock, SerifData, BlockContainerContext} from "./controller";
import SerifBlock from "./serif";


const BlockDiv = styled.div`
width: 100%;
    display: flex;
    justify-content: flex-start;
`;
const ControlsDiv = styled.div`
flex-grow: 0;
`;
const ComponentDiv = styled.div`
flex-grow: 1;
`;

const BlockRenderer = observer((props: {
    model: ScriptBlock,
}) => {

    const controller = useController();

    const container = useContainer();

    const type = props.model.type;
    if (type === "serif") {
        return <SerifBlock
            fetchCandidates={controller.fetchCharacters}
            data={props.model.data as SerifData}
            hotkey={{
                next: () => {
                    container.addBlock("", props.model)
                }
            }
            }
        />
    }
    return <SelectorField create={
        (type1, request) => { container.mutateBlock(props.model, type1, request) }
    }/>

});

const Block = (props: {
    model: ScriptBlock,
}) => {

    return <BlockDiv>
        <ComponentDiv>
            <BlockRenderer
                model={props.model}
            />
        </ComponentDiv>
        <ControlsDiv>
            <button>Delete</button>
        </ControlsDiv>
    </BlockDiv>
};

export const BlockContainer = observer((
    {
        block
    }: {
        block: BlockContainerController,
    }
) => {
    return <div>
        <BlockContainerContext.Provider value={block}>
        {block.list.map((s: ScriptBlock, index: number) => {
            return <Block model={s} key={s.id}/>
        })}
        </BlockContainerContext.Provider>
    </div>

});

const useController = () => {
    const controller = useContext(ControllerContext)
    if (controller) {
        return controller;
    }
    throw "Controller is not provided";
};
const useContainer = () => {
    const container = useContext(BlockContainerContext)
    if (container) {
        return container;
    }
    throw "Controller is not provided";
}
