import React, {ReactNode} from "react";
import classnames from "classnames";

export interface ButtonProps<T> {
    onClick: (e: React.MouseEvent<HTMLAnchorElement>, command: string, param?: T) => void
    command: string
    children?: ReactNode,
    className?: string,
    param?: T
    disabled? : boolean
}

export const IconButton = <T extends {}>(props: ButtonProps<T> & { iconSpec: string }) => {
    return <a className={classnames(props.className, 'button')} onClick={(e) => {
        e.preventDefault();
        props.onClick(e, props.command, props.param);
    }} {...{ disabled: props.disabled }}>
        {props.children ? props.children :
            <span className="icon is-small">
                <i className={props.iconSpec} />
            </span>
        }
    </a>
}