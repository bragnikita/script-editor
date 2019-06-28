import React, {useCallback} from 'react';
import SelectorField, {buildComponent} from "./selector";
import {observer} from "mobx-react";
import {ScriptBlock} from "./models";
import {useContainer, useController} from "./hooks";
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

export const Block = observer(({model}: {
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
        <div className="flex-hcenter flex-right">
            <IconButton onClick={() => container.addBlock("selector", model)} command="create_after" iconSpec={"fas fa-plus"}/>
        </div>
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