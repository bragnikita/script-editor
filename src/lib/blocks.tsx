import {HotkeyHandle, SimpleTextData} from "./controller";
import {observer, useLocalStore} from "mobx-react";
import {FieldState} from "formstate";
import * as React from "react";
import {useAutoCatchFocus, useTextHotkeys} from "./hooks";
import {DropEvent, useDropzone} from "react-dropzone";
import {useCallback, useEffect, useState} from "react";
import {inspect} from "util";
import classnames from 'classnames';

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
        o.field.onDidChange(({newValue}) => {
            props.data.text = newValue
        });
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

interface DescriptionBlockProps {
    data: SimpleTextData,
    hotkeys: Hotkeys
}


export const DescriptionBlock = observer((props: DescriptionBlockProps) => {

    const store = useLocalStore(() => {
        const o = {
            field: new FieldState<string>(props.data.text)
        };
        o.field.onDidChange(({newValue}) => {
            props.data.text = newValue
        });
        return o;
    });

    const hotkeys = useTextHotkeys<HTMLInputElement>(props.hotkeys);
    const ref = useAutoCatchFocus<HTMLInputElement>();


    return <div className="description w-100 flex-vcenter">
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

export const ImageBlock = observer((props: any) => {

    const [imgBin, setImgBin] = useState();

    const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: File[], e: DropEvent) => {
        console.log(inspect(acceptedFiles));
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            const muFileReader = new FileReader();
            muFileReader.addEventListener("load", () => {
                const res = muFileReader.result;
                if (imgBin) {
                    URL.revokeObjectURL(imgBin);
                }
                setImgBin(res)
            });
            muFileReader.readAsDataURL(file);
        }
    }, []);
    useEffect(() => () => {if (imgBin) { URL.revokeObjectURL(imgBin) }},[]);

    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop, multiple: false});

    return <div className={classnames("b_image w-100 h-100")}>
        <div {...getRootProps({
            className: classnames("w-100 h-100", {
                "drop": !imgBin,
                "preview-container": !!imgBin
            })
        })}>
            <input {...getInputProps()}/>
            {!imgBin && <span className="drop-label">'Click here of drag and drop image'</span>}
            {imgBin &&
            <div className="preview-wrapper">
                <figure className="figure">
                    <img src={imgBin} className="preview"/>
                </figure>
                <progress className="progress is-small is-primary" max="100">15%</progress>
            </div>
            }
        </div>
    </div>
});