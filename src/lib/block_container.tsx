import React, {useCallback, useContext, useState} from 'react';
import SelectorField, {buildComponent} from "./selector";
import {observer} from "mobx-react";
import {BlockContainerController, ScriptBlock, SerifData} from "./controller";
import SerifBlock from "./serif";
import {useContainer, useController, BlockContainerContext, ControllerContext} from "./hooks";
import {IconButton} from "./components";
import "../myscss.scss";

const BlockRenderer = observer((props: {
    model: ScriptBlock,
}) => {

    const controller = useController();

    const container = useContainer();

    const type = props.model.type;
    if (type !== "selector") {
        return buildComponent(props.model, container, controller);
    }
    return <SelectorField create={
        (type1, request) => {
            container.mutateBlock(props.model, type1, request)
        }
    }/>

});

const Block = observer(({model}: {
    model: ScriptBlock,
}) => {

    const container = useContainer();
    const hoverHandler = useCallback((type: string) => {
        if (type === 'over') {
            model.meta.hovered = true;
        } else {
            model.meta.hovered = false;
        }
    }, [model]);

    const showActions = model.meta.hovered || model.meta.active;

    return <div className="lined-3 w-100 block" onMouseEnter={() => hoverHandler("over")}
                onMouseLeave={() => hoverHandler("out")}>
        <div className="flex-grow-1">
            <BlockRenderer
                model={model}
            />
        </div>
        <div className="lined flex-grow-0" style={{ visibility: showActions ? "visible" : "hidden"}}>
            <IconButton
                onClick={() => container.deleteBlock(model)}
                command="delete"
                iconSpec="fas fa-trash-alt"
                className="is-white"
                disabled={model.type === 'selector' && container.isFirst(model)}
            />
            <IconButton
                onClick={() => container.up(model)}
                command="up"
                iconSpec="fas fa-arrow-up"
                className="is-white"
                disabled={container.isFirst(model)}
            />
            <IconButton
                onClick={() => container.down(model)}
                command="down"
                iconSpec="fas fa-arrow-down"
                className="is-white"
                disabled={container.isLast(model)}
            />
        </div>
    </div>
});

export const BlockContainer = observer((
    {
        block
    }: {
        block: BlockContainerController,
    }
) => {
    return <div className="w-100">
        <BlockContainerContext.Provider value={block}>
            {block.list.map((s: ScriptBlock, index: number) => {
                return <div key={s.id} className="block-wrapper">
                    <Block model={s}/>
                </div>
            })}
        </BlockContainerContext.Provider>
    </div>

});
