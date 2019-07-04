import React, {useEffect, useRef, useState} from "react";
import {ContainerData, ScriptBlock, SerifData, ImageData, SimpleTextData} from "./models";
import {useHtmlDirectInsert} from "./hooks";
import {processFormattedText} from "./utils";
import classNames from "classnames";
import {IconButton} from "./components";

interface PreviewPanelProps {
    script: ScriptBlock;
}

const PreviewPanel = ({script}: PreviewPanelProps) => {

    const type = script.type;

    return <div className="script_preview">
        {type === "container" && <ContainerPreview container={script.data as ContainerData}/>}
    </div>
};
const ContainerPreview = ({container}: { container: ContainerData }) => {
    return <React.Fragment>
        {container.title && <div className="header">{container.title}</div>}
        {container.blocks.map((b) => {
            return <BlockPreview block={b} key={b.id}/>
        })}
    </React.Fragment>
};

const BlockPreview = ({block}: { block: ScriptBlock }) => {
    const ref = useRef<HTMLSpanElement>(null);
    useHtmlDirectInsert(ref, () => {
        if (block.type === "serif") {
            return processFormattedText(block.data.text)
        }
        if (block.data instanceof SimpleTextData) {
            return block.data.text;
        }
        return ""
    });

    let component;
    const type = block.type;
    switch (type) {
        case "serif":
            const sd = block.data as SerifData;
            const classes = classNames('serif', sd.type || "general");
            component = <div className={classes}>
                <div className="name">{sd.character_name}</div>
                <span className="text" ref={ref}/>
            </div>;
            break;
        case "image":
            const id = block.data as ImageData;
            component = <div className="image">
                <img src={id.path}/>
            </div>;
            break;
        case "event":
            const ed = block.data as SimpleTextData;
            component = <div className="event">
                <span>{ed.text}</span>
            </div>;
            break;
        case "description":
            const dd = block.data as SimpleTextData;
            component = <div className="description">
                <span>{dd.text}</span>
            </div>;
            break;
        case "freetext":
            component = <div className="freetext">
                <span ref={ref}/>
            </div>;
            break;
        case "container":
            const cd = block.data as ContainerData;
            component = <div className="block_container">
                <ContainerPreview container={cd}/>
            </div>;
            break;
        default:
            component = <div>Unknown block</div>
    }

    return component
};

const PreviewDialog = (props: PreviewPanelProps) => {
    const [open, setOpen] = useState(false);
    useEffect(()=> {
        const html = window.document.getElementsByTagName('html')[0]
        if (open) {
            html.classList.add('is-clipped')
        } else {
            html.classList.remove('is-clipped')
        }
    },[open]);
    if (!open) {
        return <a className="button is-primary is-rounded" onClick={() => setOpen(true)}>Preview</a>
    }
    return <div className={classNames('modal', 'is-active', 'preview_dialog')}>
        <div className="modal-background"/>
        <div className="modal-content dialog-content">
            <div className="control-line w-100 flex-right py-1 px-2">
                <IconButton onClick={() => setOpen(false)} iconSpec={"fas fa-times"} />
            </div>
            <PreviewPanel script={props.script}/>
        </div>
    </div>;
};

export default PreviewPanel;
export { PreviewDialog };