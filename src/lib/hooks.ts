import {createContext, useCallback, useContext, useEffect, useRef} from "react";
import {BlockContainerController, ScriptContoller} from "./controller";
import React from "react";
import {HotkeyHandle} from "./models";

export const ControllerContext = createContext<ScriptContoller | undefined>(undefined)
export const BlockContainerContext = createContext<BlockContainerController | undefined>(undefined)

export const useController = () => {
    const controller = useContext(ControllerContext);
    if (controller) {
        return controller;
    }
    throw "Controller is not provided";
};
export const useContainer = () => {
    const container = useContext(BlockContainerContext);
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

type InputHotKeysHandlers = {
    enter?: () => boolean | void
    esc?: () => boolean | void
    all?: (key: string, shift: boolean, ctrl: boolean, alt: boolean) => boolean | void
}

export const useInputHotKeys = <T extends {}>(handlersMap: InputHotKeysHandlers) => {
    const onKeyPress = useCallback((e: React.KeyboardEvent<T>) => {
        const key = e.key;
        let notPreventDefault = true;
        if (key === 'Enter' && handlersMap.enter) {
            const p = handlersMap.enter();
            notPreventDefault = notPreventDefault && !!p;
        }
        if (handlersMap.all) {
            const p = handlersMap.all(key, e.shiftKey, e.ctrlKey, e.altKey);
            notPreventDefault = notPreventDefault && !!p;
        }
        if (!notPreventDefault) {
            e.preventDefault()
        }
    }, []);
    const onKeyDown = useCallback((e: React.KeyboardEvent<T>) => {
        const key = e.key;
        let notPreventDefault = true;
        if (key === 'Escape' && handlersMap.esc) {
             notPreventDefault = !!handlersMap.esc();
        }
        if (!notPreventDefault) {
            e.preventDefault();
        }
    }, []);
    return {onKeyPress, onKeyDown}
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

export function useOutsideAlerter<T extends HTMLElement>(ref: React.RefObject<T>) {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: MouseEvent) {
        console.log(event.target, ref.current)
        if (ref.current && !(ref.current === event.target as any)) {
            alert("You clicked outside of me!");
        }
    }

    useEffect(() => {
        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    });
}