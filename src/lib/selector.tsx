import React, {ReactElement, useEffect, useRef, useState} from 'react';
import styled from "styled-components";
import {observer, useLocalStore} from "mobx-react";
import {FieldState} from "formstate";
import SerifBlock from "./serif";
import {BlockContainerController, ScriptBlock, ScriptContoller, SimpleTextData} from "./controller";
import {EventBlock} from "./blocks";

const Input = styled.input`
  border: none;
  width: 100%;
  font-size: 19px;
  padding: 0.3em 0.5em;
  color: dodgerblue;
`;

export const buildComponent = (block: ScriptBlock, container: BlockContainerController, script: ScriptContoller) => {
    const type = block.type;
    const hotkeys = { next: () => container.addBlock(undefined, block ) };
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

            return {
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

    return <div className="w-100 flex-vcenter">
        <Input type="text" onKeyDown={store.keyHandler} ref={ref}
                  onChange={(e) => store.state.onChange(e.target.value)} value={store.state.value}/>
    </div>
});

export default SelectorField;

