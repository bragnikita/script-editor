import React, {ReactElement, useEffect, useRef, useState} from 'react';
import styled from "styled-components";
import {observer, useLocalStore} from "mobx-react";
import {FieldState} from "formstate";
import SerifBlock from "./serif";
import {ScriptBlock} from "./controller";

const Input = styled.input`
  border: none;
  width: 100%;
  font-size: 19px;
  padding: 0.3em 0.5em;
  color: dodgerblue;
`;

const selectFieldComponent = (request: string) => {

    if (request.startsWith("--(")) {

        return null;
    }
    if (request.startsWith("--!")) {

        return null;
    }
    if (request.startsWith("--*")) {

        return null;
    }
    if (request.startsWith("--")) {

        return null;
    }
    if (request.length > 0) {


        return "serif"
    }
    return null;
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

                    const fieldComponent = selectFieldComponent(request);
                    if (fieldComponent) {
                        props.create(fieldComponent, request)
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

    return <Input type="text" onKeyDown={store.keyHandler} ref={ref}
                  onChange={(e) => store.state.onChange(e.target.value)} value={store.state.value}/>
});

export default SelectorField;

