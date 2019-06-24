import React, {ReactNode, useCallback, useEffect, useState} from "react";
import classnames from "classnames";
import {BlockContainerController} from "./controller";
import {reaction} from "mobx";
import {observer} from "mobx-react";
import {useAutoCatchFocus} from "./hooks";

export interface ButtonProps<T> {
    onClick: (e: React.MouseEvent<HTMLAnchorElement>, command: string, param?: T) => void
    command: string
    children?: ReactNode,
    className?: string,
    param?: T
    disabled?: boolean
}

export const IconButton = <T extends {}>(props: ButtonProps<T> & { iconSpec: string }) => {
    return <a className={classnames(props.className, 'button')} onClick={(e) => {
        e.preventDefault();
        props.onClick(e, props.command, props.param);
    }} {...{disabled: props.disabled}}>
        {props.children ? props.children :
            <span className="icon is-small">
                <i className={props.iconSpec}/>
            </span>
        }
    </a>
};

export const DataDisplayer = observer((props: { block: BlockContainerController }) => {
    const [json, setJson] = useState(() => props.block.serialize);
    const refresh = useCallback(() => { setJson(props.block.serialize) },[props.block]);
    return <pre className="has-text-left relative">
        <div className="absolute right-top">
            <IconButton onClick={refresh} command="refresh" iconSpec="fas fa-sync"/>
        </div>
        {JSON.stringify(json, null, 4)}
    </pre>
});