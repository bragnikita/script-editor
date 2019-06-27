import _ from "lodash";
import {action, computed, observable} from "mobx";
import {delay, timeout} from "q";
import {Exclude, plainToClassFromExist} from 'class-transformer';

const serializeData = (data?: any) => {
    if (!data) {
        return null;
    }
    if (data.serialize) {
        const res = data.serialize;
        if (_.isFunction(res))
            return res();
        else {
            return res;
        }
    }
    return _.toPlainObject(data);
};

export class ScriptBlock {
    id: string;
    @observable
    type: string;
    @observable
    data?: any;

    @observable
    meta: BlockMeta;

    constructor(id: string, type: string) {
        this.id = id;
        this.type = type;
        this.meta = new BlockMeta();
    }

    serialize = () => {
        return {
            id: this.id,
            type: this.type,
            data: serializeData(this.data)
        }
    }
}

export class BlockMeta {
    @observable
    request?: string = "";
    @observable
    active = false;
    @observable
    hovered = false;
}

export class SerifData {
    character_name?: string;
    text: string = "";
    @Exclude()
    meta: {
        request?: string
    } = {};

    serialize = () => {
        return {
            character_name: this.character_name,
            text: this.text,
        }
    }
}

export class SimpleTextData {
    @observable
    text: string = "";
    @Exclude()
    meta: {
        request?: string
    } = {}
}

export class ImageData {
    @observable
    path: string = "";
}

export class ContainerData {
    @observable
    title: string = "";
    @observable
    blocks: ScriptBlock[] = [];
}

export interface HotkeyHandle {
    next(): void
}

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
    @observable
    list: { name: string }[] = [
    ];
    private imagesRootPath: string = "";

    constructor(id: string) {
        this.rootContainer = new ScriptBlock(id, "container");
        const d = new ContainerData();
        d.blocks.push(new ScriptBlock(this.nextId(), "selector"));
        this.rootContainer.data = d;
    }

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
            const candidate = {name: request};
            this.list.push(candidate);
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
                if (!this.list.find((c) => c.name === charaName)) {
                    this.list.push({ name: charaName });
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