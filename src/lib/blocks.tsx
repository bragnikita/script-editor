import {HotkeyHandle, SimpleTextData} from "./controller";
import {observer, useLocalStore} from "mobx-react";
import {FieldState} from "formstate";
import * as React from "react";
import {useAutoCatchFocus, useTextHotkeys} from "./hooks";

type Hotkeys = HotkeyHandle;

interface EventBlockProps {
    data: SimpleTextData,
    hotkeys: Hotkeys
}


export const EventBlock = observer((props: EventBlockProps) => {

    const store = useLocalStore(() => {
        const o = {
            field: new FieldState<string>(props.data.text)
        };
        o.field.onDidChange(({newValue}) => {props.data.text = newValue});
        return o;
    });

    const hotkeys = useTextHotkeys<HTMLInputElement>(props.hotkeys);
    const ref = useAutoCatchFocus<HTMLInputElement>();


    return <div className="event w-100 flex-vcenter">
        <input
            type="text"
            className="input w-100"
            onChange={(e) => store.field.onChange(e.target.value)}
            value={store.field.value}
            ref={ref}
            {...hotkeys}
        />
    </div>
});