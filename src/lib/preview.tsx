import React, {useRef} from "react";
import {ContainerData, ScriptBlock, SerifData} from "./models";
import {useHtmlDirectInsert} from "./hooks";
import {processFormattedText} from "./utils";

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
    return <div>
        {container.blocks.map((b) => {
            return <BlockPreview block={b} key={b.id}/>
        })}
    </div>
};

const BlockPreview = ({block}: { block: ScriptBlock }) => {
    const ref = useRef<HTMLSpanElement>(null);
    useHtmlDirectInsert(ref, () => {
        if (block.type === "serif") {
            return processFormattedText(block.data.text)
        }
        return ""
    });

    let component;
    const type = block.type;
    switch (type) {
        case "serif":
            const data = block.data as SerifData;
            component = <div>{data.character_name}:<span ref={ref}/></div>;
            break;
        case "image":
        case "event":
        default:
            component = <div>Unknown block</div>
    }

    return <div>{component}</div>
};

export default PreviewPanel