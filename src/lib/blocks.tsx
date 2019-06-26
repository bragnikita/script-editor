import {HotkeyHandle, SimpleTextData, ImageData} from "./controller";
import {observer, useLocalStore} from "mobx-react";
import {FieldState} from "formstate";
import * as React from "react";
import {useAutoCatchFocus, useTextHotkeys} from "./hooks";
import {DropEvent, useDropzone} from "react-dropzone";
import {useCallback, useEffect, useState} from "react";
import {inspect} from "util";
import classnames from 'classnames';
import {IconButton} from "./components";

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

type FnUpload = (file: File) => Promise<string>
type FnDelete = () => Promise<void>

interface ImageBlockProps {
    data: ImageData,
    onUpload: FnUpload,
    onDelete: FnDelete,
}

export const ImageBlock = observer((props: ImageBlockProps) => {

    const [imgBin, setImgBin] = useState();
    const [loadingStatus, setLoadingStatus] = useState("none");

    const onDelete = useCallback(async () => {
        setLoadingStatus('loading');
        await props.onDelete();
        props.data.path = "";
        setLoadingStatus('none');
    }, []);

    const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: File[], e: DropEvent) => {
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

            setLoadingStatus('loading');
            const imgPath = await props.onUpload(file);
            URL.revokeObjectURL(imgBin);
            setImgBin(undefined);
            props.data.path = imgPath;
            setLoadingStatus('finished');
        }
    }, [props.data]);
    useEffect(() => () => {
        if (imgBin) {
            URL.revokeObjectURL(imgBin)
        }
    }, []);

    const {getRootProps, getInputProps} = useDropzone({onDrop, multiple: false});

    return <div className={classnames("b_image w-100 h-100")}>
        {loadingStatus === 'finished' && <div className="finished_indicator">
            <span className="icon fas fa-lg fa-check-circle col-green"/>
        </div>
        }
        <div {...getRootProps({
            className: classnames("w-100 h-100", {
                "drop": !imgBin && !props.data.path,
                "preview-container": !!imgBin
            })
        })}>
            <input {...getInputProps()}/>
            {!imgBin && (
                props.data.path ?
                    <div className="preview-wrapper h-100">
                        <img src={props.data.path} className="preview"/>
                    </div>
                    :
                    <span className="drop-label">'Click here of drag and drop image'</span>
            )}
            {imgBin &&
            <div className="preview-wrapper">
                <figure className="figure">
                    <img src={imgBin} className="preview"/>
                </figure>
                {loadingStatus === "loading" &&
                <progress className="progress is-small is-primary" max="100">15%</progress>}
            </div>
            }
        </div>
        {props.data.path && loadingStatus !== "loading" &&
        <IconButton onClick={onDelete} iconSpec="fas fa-trash" className="delete_image_btn"/>
        }
    </div>
});