import React, {useEffect, useRef} from "react";
import Textarea from 'react-textarea-autosize';
import {observer, useLocalStore} from "mobx-react";
import {FieldState} from "formstate";
import Select from 'react-select';
import styled from "styled-components";

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
    id: string,
    name: string,
}

interface Props {
    data: SerifData,
    nameRequest?: string,
    fetchCandidates: (request?: string) => SelectorCandidate[]
}

class SerifData {
    character_id?: string;
    character_name?: string;
    text: string = "";
}


const SerifBlock = observer((props: Props) => {

    const data = useLocalStore(() => {

        let selectedCandidate;
        let candidates;
        if (props.nameRequest) {
            candidates = props.fetchCandidates(props.nameRequest);
            if (candidates.length == 1) {
                selectedCandidate = candidates[0];
            }
        }
        const allCandidates = props.fetchCandidates();
        let selectedValue = props.data.character_id;
        if (!selectedValue && selectedCandidate) {
            selectedValue = selectedCandidate.id;
        }
        if (!selectedValue && allCandidates.length > 0) {
            selectedValue = allCandidates[0].id;
        }

        return {
            selectedCandidate: selectedCandidate,
            allCandidates: allCandidates,

            selectorField: new FieldState<string>(selectedValue || ""),
            textField: new FieldState<string>(props.data.text),
        }
    });

    const ref = useRef<HTMLTextAreaElement>(null);
    useEffect(() => {
        if (ref && ref.current) {
            ref.current.focus();
        }
    }, []);

    const opts = data.allCandidates.map((item: SelectorCandidate) => ({value: item.id, label: item.name}));
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
                            onChange={(e) => data.textField.onChange(e.target.value)}/>
        </Component>
    );
});

export default SerifBlock;
export {
    SerifData
}