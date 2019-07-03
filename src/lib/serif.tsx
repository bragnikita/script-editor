import React, {useCallback, useEffect, useRef, useState} from "react";
import Textarea from 'react-textarea-autosize';
import {observer} from "mobx-react";
import Select from 'react-select';
import {HotkeyHandle, SerifData} from "./models";
import {action, computed, observable, reaction, runInAction} from "mobx";
import {useHtmlDirectInsert, useTextHotkeys} from "./hooks";
import _ from "lodash";
import onClickOutside from "react-onclickoutside";
import {IconButton} from "./components";
import {processFormattedText} from "./utils";


type SelectorCandidate = {
    name: string,
}

interface Props {
    data: SerifData,
    hotkey?: HotkeyHandle,
    fetchCandidates: (request?: string) => SelectorCandidate[]
}

type RefCb = () => React.RefObject<HTMLTextAreaElement>

class Store {

    @observable
    text = "";

    @computed
    get previewText() {
        return processFormattedText(this.text);
    }

    @observable
    type = "general";

    @observable
    selected = null as SelectorCandidate | null;

    model: SerifData;

    @observable
    allCandidates: SelectorCandidate[];

    @observable
    mode: "edit" | "preview" = "edit";

    @observable
    hovered = false;

    @observable
    selection = {start: 0, end: 0};

    @computed
    get selectedText() {
        return this.text.substring(this.selection.start, this.selection.end);
    }

    @action
    onFocusGain = () => {
        this.mode = "edit";
    };
    @action
    onFocusLost = () => {
        if (!this.selectedText)
            this.mode = "preview"
    };
    @action
    onHover = () => {
        this.hovered = true;
    };
    @action
    onLeave = () => {
        this.hovered = false
    };

    @action
    onApplyStyle = (e: any, command: any, param: string | undefined) => {
        if (!this.selectedText) {
            return
        }
        const before = this.text.substring(0, this.selection.start);
        const after = this.text.substring(this.selection.end);
        const wrapped = this.selectedText;
        let afterPos = this.text.length;
        if (param === "emotion") {
            this.text = before + '*' + wrapped + '*' + after;
            afterPos = this.selection.end + 2;
        }
        if (param === "minds") {
            this.text = before + '(' + wrapped + ')' + after;
            afterPos = this.selection.end + 2;
        }
        if (param === 'emphases') {
            this.text = before + '_' + wrapped + '_' + after;
            afterPos = this.selection.end + 2;
        }
        this.setSelectedRange();
        if (this.getFocus) {
            let ref = this.getFocus().current;
            if (ref) {
                ref.focus();
            }
            this.setCursorTo = afterPos;
        }
    };
    @action
    setSelectedRange = (p?: { start: number, end: number }) => {
        if (p) {
            this.selection = p;
        } else {
            this.selection = {start: 0, end: 0}
        }
    };

    getFocus: RefCb | undefined;

    setCursorTo = -1;

    constructor(props: Props) {
        this.model = props.data;
        this.text = props.data.text;
        this.type = props.data.type || "general";
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
            selectedValue = undefined;
        }

        this.selected = selectedValue || null;
        if (this.selected) {
            this.model.character_name = this.selected.name;
        }
        reaction(() => this.selectedText, () => console.log(this.selectedText))
    }

    @action
    onEditText = (text: string) => {
        this.text = text;
        this.model.text = text;
    };

    @action
    onSwitchMode = (e: any, command?: string, mode?: string) => {
        this.type = mode || "";
        this.model.type = mode || "";
        this.mode = "edit"
        console.log(this.type, this.mode);
    };

    @action
    onSelectorField = (item: SelectorCandidate) => {
        this.selected = item;
        this.model.character_name = item.name;
    }
};


const SerifBlock = observer((props: Props) => {

    const ref = useRef<HTMLTextAreaElement>(null);

    const [data] = useState(() => {
        const s = new Store(props);
        s.getFocus = () => ref;
        return s;
    });

    const previewRef = useRef<HTMLDivElement>(null);
    useHtmlDirectInsert(previewRef, () => data.previewText);

    const hotkeys = useTextHotkeys<HTMLTextAreaElement>(props.hotkey);

    const switchEditMode = useCallback(() => {
        if (data.mode === "preview") {
            data.mode = "edit";
            ref.current && ref.current.focus()
        }
    }, [data]);

    useEffect(() => {
        if (data.mode === "edit") {
            ref.current && ref.current.focus()
        }
    }, [data.mode]);
    useEffect(() => {
        if (data.setCursorTo >= 0) {
            if (ref.current) {
                ref.current.selectionStart = ref.current.selectionEnd = data.setCursorTo;
                data.setCursorTo = -1;
            }
        }
    }, [data.setCursorTo])

    const opts = data.allCandidates.map((item: SelectorCandidate) => ({value: item, label: item.name}));
    let value: any = opts.find((o) => o.value === data.selected) || null;

    class A extends React.Component {
        handleClickOutside = (evt: any) => data.setSelectedRange();

        render() {

            return <div className="__toolbox lined-1">
                <IconButton small onClick={data.onApplyStyle} iconSpec="fas fa-bold" param="emphases"/>
                <IconButton small onClick={data.onApplyStyle} iconSpec="fas fa-smile-beam" param="emotion"/>
                <IconButton small onClick={data.onApplyStyle} iconSpec="fas fa-comment-dots" param="minds"/>
            </div>
        }
    }

    const Toolbox = onClickOutside(A);

    return (
        <div className="serif relative">
            <Select
                options={opts}
                onChange={(v: any) => {
                    data.onSelectorField(v.value)
                }}
                value={value}
                className={"selector"}
                classNamePrefix={"serif_selector"}
                components={{IndicatorSeparator: null, DropdownIndicator: null}}
            />
            <React.Fragment>
                <div className={`relative __textarea_wrapper flex-vcenter ${data.type}`}>
                    {data.selectedText &&
                    <Toolbox/>
                    }
                    <Textarea
                        className={"__textarea"}
                        inputRef={ref} value={data.text}
                        onChange={(e) => data.onEditText(e.target.value)}
                        {...hotkeys}
                        onBlur={data.onFocusLost}
                        onSelect={(e) => {
                            const start = e.currentTarget.selectionStart;
                            const end = e.currentTarget.selectionEnd;
                            if (end > start) {
                                data.setSelectedRange({start, end})
                            } else {
                                data.setSelectedRange()
                            }
                        }
                        }
                    />
                </div>
                <div className="types_panel flex-vcenter">
                    {data.type === 'general' && <IconButton onClick={data.onSwitchMode}
                                                            iconSpec={`fas fa-eye-slash is-small`}
                                                            command="type"
                                                            param="curtain"/>
                    }
                    {data.type === 'curtain' && <IconButton onClick={data.onSwitchMode}
                                                            iconSpec={`fas fa-eye is-small`}
                                                            command="type"
                                                            param="general"/>
                    }
                </div>
            </React.Fragment>
        </div>
    );
});

export default SerifBlock;