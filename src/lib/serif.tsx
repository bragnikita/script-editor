import React, {useCallback, useEffect, useRef, useState} from "react";
import Textarea from 'react-textarea-autosize';
import {observer, useLocalStore} from "mobx-react";
import {FieldState} from "formstate";
import Select from 'react-select';
import styled from "styled-components";
import {HotkeyHandle, SerifData} from "./models";
import {observable, runInAction} from "mobx";
import {useAutoCatchFocus, useTextHotkeys} from "./hooks";

const Component = styled.div`
display: flex;
justify-content: flex-start;
align-items: flex-start;
width: 100%;
align-items: center;
`;

const StyledSelect = styled(Select).attrs({className: "se--serif-selector"})`
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

class Store {

    @observable
    text = "";
    @observable
    selected = undefined as SelectorCandidate | undefined;

    model: SerifData;

    @observable
    allCandidates: SelectorCandidate[];

    constructor(props: Props) {
        this.model = props.data;
        this.text = props.data.text;
        let selectedCandidate;
        let candidates;
        if (props.data.meta.request) {
            candidates = props.fetchCandidates(props.data.meta.request);
            if (candidates.length == 1) {
                selectedCandidate = candidates[0];
            }
        }
        this.allCandidates = props.fetchCandidates();
        let selectedValue = this.allCandidates.find((c) => c.name === props.data.character_name);
        if (!selectedValue && selectedCandidate) {
            selectedValue = selectedCandidate;
        }
        if (!selectedValue && this.allCandidates.length > 0) {
            selectedValue = this.allCandidates[0];
        }

        this.selected = selectedValue;
        if (this.selected) {
            this.model.character_name = this.selected.name;
        }
    }

    onEditText = (text: string) => {
        this.text = text;
        this.model.text = text;
    };
    onSelectorField = (item: SelectorCandidate) => {
        this.selected = item;
        this.model.character_name = item.name;
    }
}


const SerifBlock = observer((props: Props) => {

    const [data] = useState(() => new Store(props));

    const hotkeys = useTextHotkeys<HTMLTextAreaElement>(props.hotkey);

    const ref = useAutoCatchFocus<HTMLTextAreaElement>();

    const opts = data.allCandidates.map((item: SelectorCandidate) => ({value: item, label: item.name}));
    const value = opts.find((o) => o.value === data.selected);
    return (
        <Component>
            <Select
                options={opts}
                onChange={(v: any) => {
                    data.onSelectorField(v)
                }}
                value={value}
                className={"serif selector"}
                classNamePrefix={"serif_selector"}
                components={{IndicatorSeparator: null, DropdownIndicator: null}}
            />
            <StyledTextArea
                inputRef={ref} value={data.text}
                onChange={(e) => data.onEditText(e.target.value)}
                {...hotkeys}
            />
        </Component>
    );
});

export default SerifBlock;