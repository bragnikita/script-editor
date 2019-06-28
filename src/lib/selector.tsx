import React, {ReactElement, useEffect, useRef, useState} from 'react';
import styled from "styled-components";
import {observer, useLocalStore} from "mobx-react";
import {FieldState} from "formstate";
import SerifBlock from "./serif";
import {
    ScriptBlock,
    SimpleTextData,
    ImageData,
    ContainerData
} from "./models";
import {ContainerBlock, DescriptionBlock, EventBlock, FreeTextBlockProps, ImageBlock} from "./blocks";
import {IconButton, SmallIconButton} from "./components";
import {BlockContainerController, ScriptContoller} from "./controller";

const Input = styled.input`
  border: none;
  width: 100%;
  font-size: 19px;
  padding: 0.3em 0.5em;
  color: dodgerblue;
`;

export const buildComponent = (block: ScriptBlock, container: BlockContainerController, script: ScriptContoller) => {
    const type = block.type;
    const hotkeys = {next: () => container.addBlock(undefined, block)};
    if (type === "serif") {
        return <SerifBlock
            key={block.id}
            data={block.data}
            fetchCandidates={script.fetchCharacters}
            hotkey={hotkeys}
        />
    }
    if (type === "event") {
        return <EventBlock key={block.id} data={block.data as SimpleTextData} hotkeys={hotkeys}/>
    }
    if (type === "description") {
        return <DescriptionBlock key={block.id} data={block.data as SimpleTextData} hotkeys={hotkeys}/>
    }
    if (type === "image") {
        return <ImageBlock key={block.id}
                           data={block.data as ImageData}
                           onUpload={async (f) => script.uploadImage(block.id, f)}
                           onDelete={async () => script.deleteImage(block.id)}
        />
    }
    if (type === "freetext") {
        return <FreeTextBlockProps key={block.id} data={block.data as SimpleTextData} hotkeys={hotkeys}/>
    }
    if (type === "container") {
        const data = block.data as ContainerData;
        const blockController = new BlockContainerController(block.id, data.blocks);
        return <ContainerBlock key={block.id} controller={blockController} data={data}/>
    }
    return null;
};

const selectFieldComponent = (request: string) => {

    if (request.startsWith("--(")) {

        return ["block", request.substr(3)];
    }
    if (request.startsWith("--!")) {
        return ["image", request.substr(3)];
    }
    if (request.startsWith("--*")) {
        return ["description", request.substr(3)];
    }
    if (request.startsWith("--")) {
        return ["event", request.substr(2)];
    }
    if (request.length > 0) {
        return ["serif", request]
    }
    return [];
};

const SelectorField = observer((props: {
                                    create(type: string, request: string): void
                                }
) => {

    const store = useLocalStore(() => {

            const field = new FieldState<string>("");

            const onKeyPressedHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
                console.log("Down", e.key, e.which, e.keyCode, e.charCode);
                if (e.key === 'Tab') {
                    e.preventDefault();

                    const request = field.$;

                    const [fieldComponent, r] = selectFieldComponent(request);
                    if (fieldComponent) {
                        props.create(fieldComponent, r)
                    }
                }
            };

            const buttonSelectHandler = (e:any, componentName: string) => {
                props.create(componentName, field.$)
            };

            return {
                buttonSelectHandler,
                keyHandler: onKeyPressedHandler,
                state: field
            };
        }
    );

    const ref = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (ref && ref.current) {
            ref.current.focus();
        }
    }, []);

    const hideButtons = store.state.value.startsWith("--") || store.state.value.length > 8;

    return <div className="w-100 flex-vcenter b_selector">
        <Input type="text" onKeyDown={store.keyHandler} ref={ref}
               onChange={(e) => store.state.onChange(e.target.value)} value={store.state.value}/>
        {!hideButtons && <div className={"se_buttons lined-3 flex-vcenter"}>
            <SmallIconButton onClick={store.buttonSelectHandler} iconSpec="fas fa-comment" command="serif"/>
            <SmallIconButton onClick={store.buttonSelectHandler} iconSpec="fas fa-image" command="image" alt={"Add image"}/>
            <SmallIconButton onClick={store.buttonSelectHandler} iconSpec="fas fa-rss" command="event"/>
            <SmallIconButton onClick={store.buttonSelectHandler} iconSpec="fas fa-align-justify" command="description"/>
            <SmallIconButton onClick={store.buttonSelectHandler} iconSpec="fas fa-comment-alt" command="freetext"/>
            <SmallIconButton onClick={store.buttonSelectHandler} iconSpec="fas fa-stream" command="container"/>
        </div>
        }
    </div>
});

export default SelectorField;

