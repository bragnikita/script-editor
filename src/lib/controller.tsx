import React from 'react';

class ScriptBlock {
    id: string;
    type: string;
    data?: any;

    constructor(id: string, type: string) {
        this.id = id;
        this.type = type;
    }
}

interface HasChildren {
    addAfter(block: ScriptBlock): ScriptBlock;
    moveUp(block: ScriptBlock): void;
    moveDown(block: ScriptBlock): void;
}

class ScriptController {

    model: ScriptBlock;

    constructor(model: ScriptBlock) {
        this.model = model;
    }


    addBlockAfter = (type: string, afterId: string) => {

    }

}
