import {createContext, useContext, useEffect, useRef} from "react";
import {BlockContainerController, HotkeyHandle, ScriptContoller} from "./controller";
import React from "react";

export const ControllerContext = createContext<ScriptContoller | undefined>(undefined)
export const BlockContainerContext = createContext<BlockContainerController | undefined>(undefined)

export const useController = () => {
    const controller = useContext(ControllerContext)
    if (controller) {
        return controller;
    }
    throw "Controller is not provided";
};
export const useContainer = () => {
    const container = useContext(BlockContainerContext)
    if (container) {
        return container;
    }
    throw "Controller is not provided";
};

export const useTextHotkeys = <T extends {}>(handler?: HotkeyHandle) => {
    const handlers = useRef({
        onKeyPress: (e: React.KeyboardEvent<T>) => {
            if (!handler) return;
            if (e.shiftKey && e.key === 'Enter') {
                console.log('ShiftEnter', handler);
                handler.next();
                e.preventDefault();
            }
        }
    });
    return handlers.current;
};

export const useAutoCatchFocus = <T extends HTMLElement>(useR?: React.RefObject<T>) => {
    let ref = useRef<T>(null);
    if (useR) {
        ref = useR;
    }
    useEffect(() => {
        if (ref && ref.current) {
            ref.current.focus();
        }
    }, []);
    return ref;
};

export const useActiveFocus = <T extends HTMLElement>(useR?: React.RefObject<T>) => {

};