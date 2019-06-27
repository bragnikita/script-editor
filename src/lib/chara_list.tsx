import React, {useState} from 'react';
import {observer, useLocalStore} from 'mobx-react'
import {IconButton} from "./components";
import {FieldState} from "formstate";
import {action, observable} from "mobx";
import classnames from 'classnames';

type CharaListItem = { name: string }

interface CharaListProps {
    list: CharaListItem[];
    onCharaRenamed?: (oldName: string, newName: string) => void
}

export const CharaListPanel = observer((props: CharaListProps) => {

    const [store] = useState(() => {

        class Store {
            list = props.list;
            nameField = new FieldState<string>("");
            @observable
            editing: CharaListItem | null = null;
            @action
            delete = (e: any, command: string, param: any) => {
                const index = this.list.indexOf(param);
                this.list.splice(index, 1)
            };
            @action
            edit = (item: CharaListItem) => {
                this.editing = item;
                this.nameField.onChange(item.name)
            };
            @action
            commit = () => {
                if (this.editing) {
                    const oldName = this.editing.name;
                    const newName = this.nameField.$;
                    if (props.onCharaRenamed) {
                        props.onCharaRenamed(oldName, newName);
                    }
                    this.editing.name = newName;
                    this.nameField.onChange("");
                    this.editing = null;

                } else {
                    const chara = observable({ name: "" });
                    chara.name = this.nameField.$;
                    this.nameField.onChange("");
                    this.list.push(chara);
                }
            };
            @action
            cancel = () => {
                this.editing = null;
                this.nameField.onChange("");
            };
        }

        return new Store();
    });

    const AddNew = observer(({}: {}) => {
        return <div className="__add_field lined-2 flex-vcenter w-100">
            <input type="text" className="input flex-grow-1"
                   value={store.nameField.value}
                   onChange={(e) => store.nameField.onChange(e.target.value)}
            />
            {store.nameField.$ &&
            <div className="lined-1">
                <IconButton onClick={store.commit} iconSpec="fas fa-check"/>
                <IconButton onClick={store.cancel} iconSpec="fas fa-times"/>
            </div>
            }
        </div>
    });

    return <div className="chara_list_panel">
        <div className="w-100 mb-3">
            <AddNew/>
        </div>
        <div className="__list">
            {store.list.map((item) => {
                return <div key={item.name}
                            className={classnames('__list_item lined-2', {'selected': store.editing === item})}
                            onClick={() => store.edit(item)}>
                    <span className="flex-grow-1">
                        {item.name}
                    </span>
                    <IconButton onClick={store.delete} iconSpec="fas fa-trash" command="delete" param={item}/>
                </div>
            })}
        </div>
    </div>
});
