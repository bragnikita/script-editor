import _ from "lodash";
import {action, observable} from "mobx";
import {createContext} from "react";

export class ScriptBlock {
    id: string;
    @observable
    type: string;
    @observable
    data?: any;

    constructor(id: string, type: string) {
        this.id = id;
        this.type = type;
    }
}

export class SerifData {
    character_id?: string;
    character_name?: string;
    text: string = "";
    meta: {
        request?: string
    } = {}
}

export interface HotkeyHandle {
    next(): void
}

export class BlockContainerController {

    @observable
    list: ScriptBlock[] = [];

    addBlock = (type?: string, after?: ScriptBlock) => {
        let block;
        if (!type || type === "selector") {
            block = new ScriptBlock(this.nextId, "selector")
        } else {
            block = new ScriptBlock(this.nextId, type);
            block.data = this.createData(type);
        }
        if (!after) {
            this.list.push(block)
        } else {
            const index = this.list.indexOf(after);
            this.list.splice(index+1, 0, block);
        }
    };

    @action
    mutateBlock = (b: ScriptBlock, type: string, request?: string) => {
        b.type = type;
        b.data = this.createData(b.type, request);
    };

    private createData = (blockType: string, request?: string) => {
        if (blockType === "serif") {
            const data = new SerifData();
            data.meta.request = request;
            return data;
        }
        return {};
    };

    @action deleteBlock = (b: ScriptBlock) => {
        if (this.list.length == 1) {
            this.mutateBlock(b, "selector")
        } else {
            const index = this.list.indexOf(b);
            if (index > -1) {
                this.list.splice(index, 1);
            }
        }
    };

    @action up = (b: ScriptBlock) => {
        const index = this.list.indexOf(b);
        if (index > 0) {
            this.list.splice(index, 1);
            this.list.splice(index-1, 0, b)
        }
    };

    @action down = (b: ScriptBlock) => {
        const index = this.list.indexOf(b);
        if (index < this.list.length - 1) {
            this.list.splice(index, 1);
            this.list.splice(index+1, 0, b)
        }
    };

    isLast = (b: ScriptBlock) => { return this.list.indexOf(b) == this.list.length - 1};
    isFirst = (b: ScriptBlock) => { return this.list.indexOf(b) == 0};


    private get nextId() {
        return _.random(0, 999999999999).toString(10)
    }
}

export class ScriptContoller {
    list: { name: string }[] = [
        { name: "Felicia"},
        { name: "Yachio"},
        { name: "Iroha"},
    ];

    fetchCharacters = (request?: string) => {


        if (!request) {
            return this.list;
        }

        const normalizedRequest = request.trim().toLowerCase().replace(" ", "");
        const filtred = this.list.filter((item) => {
            const normalized = item.name.toLowerCase().replace(" ", "");
            return normalized.startsWith(normalizedRequest);

        });
        if (filtred.length == 0) {
            const candidate = { name: request }
            this.list.push(candidate);
            return [candidate];
        } else {
            return filtred;
        }
    }
}