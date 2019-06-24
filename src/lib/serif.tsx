import React, {useCallback, useEffect, useRef} from "react";
import Textarea from 'react-textarea-autosize';
import {observer, useLocalStore} from "mobx-react";
import {FieldState} from "formstate";
import Select from 'react-select';
import styled from "styled-components";
import {HotkeyHandle, SerifData} from "./controller";

const Component = styled.div`
display: flex;
justify-content: flex-start;
align-items: flex-start;
width: 100%;
`;

const StyledSelect = styled(Select).attrs({ className: "se--serif-selector"})`
  margin-right: 1em;
  min-width: 170px;
`;
const StyledTextArea = styled(Textarea)`
  flex-grow: 1;
  min-height: 1.4em;
  font-size: 17px;
  padding: 0.35em 0.5em;
  border: 1px lightgray solid;
  border-radius: 4px;
`;

type SelectorCandidate = {
    name: string,
}

interface Props {
    data: SerifData,
    hotkey?: HotkeyHandle,
    fetchCandidates: (request?: string) => SelectorCandidate[]
}


const SerifBlock = observer((props: Props) => {

    const data = useLocalStore(() => {

        let selectedCandidate;
        let candidates;
        if (props.data.meta.request) {
            candidates = props.fetchCandidates(props.data.meta.request);
            if (candidates.length == 1) {
                selectedCandidate = candidates[0];
            }
        }
        const allCandidates = props.fetchCandidates();
        let selectedValue = props.data.character_name;
        if (!selectedValue && selectedCandidate) {
            selectedValue = selectedCandidate.name;
        }
        if (!selectedValue && allCandidates.length > 0) {
            selectedValue = allCandidates[0].name;
        }

        return {
            selectedCandidate: selectedCandidate,
            allCandidates: allCandidates,

            selectorField: new FieldState<string>(selectedValue || ""),
            textField: new FieldState<string>(props.data.text),
        }
    });

    const keyPressed = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        console.log(e.key, e.shiftKey, e.keyCode);
        if (e.shiftKey && e.key === 'Enter') {
            console.log('ShiftEnter', props.hotkey)
            if (props.hotkey) {
                props.hotkey.next();
                e.preventDefault();
            }
        }
    },[props.hotkey]);

    const ref = useRef<HTMLTextAreaElement>(null);
    useEffect(() => {
        if (ref && ref.current) {
            ref.current.focus();
        }
    }, []);

    const opts = data.allCandidates.map((item: SelectorCandidate) => ({value: item.name, label: item.name}));
    const value = opts.find((o) => o.value === data.selectorField.value);
    return (
        <Component>
            <StyledSelect
                options={opts}
                onChange={(v: any) => {
                    data.selectorField.onChange(v.value)
                }}
                value={value}
            />
            <StyledTextArea inputRef={ref} value={data.textField.value}
                            onChange={(e) => data.textField.onChange(e.target.value)}
                            onKeyPress={keyPressed}
            />
        </Component>
    );
});

export default SerifBlock;