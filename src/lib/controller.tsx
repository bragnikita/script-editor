import _ from "lodash";
import {action, computed, observable} from "mobx";
import {delay, timeout} from "q";
import {Exclude, plainToClassFromExist} from 'class-transformer';
import {ContainerData, ScriptBlock, SerifData, SimpleTextData, ImageData, CharactersList} from "./models";



export class BlockContainerController {

    id: string;
    @observable
    list: ScriptBlock[] = [];

    constructor(id: string, list: ScriptBlock[]) {
        this.id = id;
        this.list = list;
    }

    addBlock = (type?: string, after?: ScriptBlock) => {
        console.log("addBlock", type, after);
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
            this.list.splice(index + 1, 0, block);
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
        if (blockType === "event") {
            const data = new SimpleTextData();
            data.text = request || "";
            return data;
        }
        if (blockType === "description") {
            const data = new SimpleTextData();
            data.text = request || "";
            return data;
        }
        if (blockType === "image") {
            const data = new ImageData();
            return data;
        }
        if (blockType === "container") {
            const data = new ContainerData();
            data.title = request || "";
            const firstBlock = new ScriptBlock(this.nextId, "selector");
            data.blocks.push(firstBlock);
            return data;
        }
        if (blockType === "freetext") {
            const data = new SimpleTextData();
            data.text = request || "";
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
            this.list.splice(index - 1, 0, b)
        }
    };

    @action down = (b: ScriptBlock) => {
        const index = this.list.indexOf(b);
        if (index < this.list.length - 1) {
            this.list.splice(index, 1);
            this.list.splice(index + 1, 0, b)
        }
    };

    isLast = (b: ScriptBlock) => {
        return this.list.indexOf(b) == this.list.length - 1
    };
    isFirst = (b: ScriptBlock) => {
        return this.list.indexOf(b) == 0
    };

    get serialize() {
        return this.list.map((b) => b.serialize())
    };


    private get nextId() {
        return this.id + "_" + _.random(0, 999999999999).toString(10)
    }
}

export class ScriptContoller {

    @observable
    title: string = "";
    @observable
    rootContainer: ScriptBlock;
    list: CharactersList;
    private imagesRootPath: string = "";

    constructor(id: string, chara: CharactersList) {
        this.list = chara;
        this.rootContainer = new ScriptBlock(id, "container");
        const d = new ContainerData();
        d.blocks.push(new ScriptBlock(this.nextId(), "selector"));
        this.rootContainer.data = d;
    }

    fetchCharacters = (request?: string) => {


        if (!request) {
            return this.list.items;
        }

        const normalizedRequest = request.trim().toLowerCase().replace(" ", "");
        const filtred = this.list.items.filter((item) => {
            const normalized = item.name.toLowerCase().replace(" ", "");
            return normalized.startsWith(normalizedRequest);

        });
        if (filtred.length == 0) {
            const candidate = {name: request};
            this.list.items.push(candidate);
            return [candidate];
        } else {
            return filtred;
        }
    };

    uploadImage = async (blockId: string, file: File) => {
        console.log('Uploading', blockId, file.name)
        await delay(3000);
        return `${this.imagesRootPath}/image.jpg`
    };

    deleteImage = async (blockId: string) => {
        console.log('Deleting', blockId);
        await delay(500)
    };

    renameCharacter = (oldName: string, newName: string) => {
        this._renameCharacter(this.rootContainer, oldName, newName);
    };

    private _renameCharacter = (block: ScriptBlock, oldName: string, newName: string) => {
        if (block.type === 'serif') {
            const data = block.data as SerifData;
            if (data.character_name === oldName) {
                data.character_name = newName;
            }
        }
        if (block.type === 'container') {
            const data = block.data as ContainerData;
            data.blocks.forEach((b) => this._renameCharacter(b, oldName, newName));
        }
    };

    importScript = (json: any) => {
        this.title = json.title;
        this.imagesRootPath = json.imagesRootPath;
        this.rootContainer = this.importFromJson(json.root)
    };

    private importFromJson = (json: any) => {
        const block = new ScriptBlock(json.id, json.type);
        let data;
        if (block.type === "serif") {
            data = plainToClassFromExist(new SerifData(), json.data);
            const charaName = (data as SerifData).character_name;
            if (charaName) {
                if (!this.list.items.find((c) => c.name === charaName)) {
                    this.list.items.push({ name: charaName });
                }
            }
        }
        if (block.type === "event") {
            data = plainToClassFromExist(new SimpleTextData(), json.data);
        }
        if (block.type === "image") {
            data = plainToClassFromExist(new ImageData(), json.data);
        }
        if (block.type === "description") {
            data = plainToClassFromExist(new SimpleTextData(), json.data);
        }
        if (block.type === "container") {
            const d = new ContainerData();
            d.title = json.data.title;
            if (json.data.blocks) {
                d.blocks = json.data.blocks.map((b: any) => {
                    return this.importFromJson(b);
                })
            } else {
                d.blocks = [];
            }
            data = d;
        }
        block.data = data;
        return block;
    };

    nextId = () => {
        return this.rootContainer.id + "_" + _.random(0, 999999999999).toString(10)
    }

}