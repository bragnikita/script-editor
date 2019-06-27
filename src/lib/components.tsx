import React, {ReactNode, useCallback, useState} from "react";
import classnames from "classnames";
import {BlockContainerController} from "./controller";
import {observer} from "mobx-react";

export interface ButtonProps<T> {
    onClick: (e: React.MouseEvent, command: string, param?: T) => void
    command?: string
    children?: ReactNode,
    className?: string,
    param?: T
    disabled?: boolean
    alt?: string
}

export const IconButton = <T extends {}>(props: ButtonProps<T> & { iconSpec: string }) => {
    return <a className={classnames(props.className, 'button')} onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        props.onClick(e, props.command || "", props.param);
    }} {...{disabled: props.disabled}}>
        {props.children ? props.children :
            <span className="icon is-small">
                <i className={props.iconSpec}/>
            </span>
        }
    </a>
};

export const SmallIconButton = <T extends {}>(props: ButtonProps<T> & { iconSpec: string }) => {
    return <div className={classnames(props.className, 'se_small_icon flex-vcenter')} onClick={(e) => {
        e.preventDefault();
        props.onClick(e, props.command || "", props.param);
    }} {...{disabled: props.disabled}}>
            <span className="icon is-small">
                <i className={props.iconSpec}/>
            </span>
    </div>
};

export const DataDisplayer = observer((props: { block: BlockContainerController }) => {
    const [json, setJson] = useState(() => props.block.serialize);
    const refresh = useCallback(() => {
        setJson(props.block.serialize)
    }, [props.block]);
    return <pre className="has-text-left relative">
        <div className="absolute right-top">
            <IconButton onClick={refresh} command="refresh" iconSpec="fas fa-sync"/>
        </div>
        {JSON.stringify(json, null, 4)}
    </pre>
});