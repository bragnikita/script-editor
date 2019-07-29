import React from 'react';
import {observer} from "mobx-react";
import {BlockContainerController} from "./controller";
import {BlockContainerContext} from "./hooks";
import "../myscss.scss";
import {Block} from "./block_renderer";
import {ScriptBlock} from "./models";

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
