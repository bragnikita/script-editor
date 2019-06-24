import {createContext, useContext} from "react";
import {BlockContainerController, ScriptContoller} from "./controller";

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
}
