import React, {useCallback, useEffect, useRef, useState} from 'react';
import {observer} from 'mobx-react'
import {IconButton} from "./components";
import {FieldState} from "formstate";
import {action, observable, runInAction} from "mobx";
import classnames from 'classnames';
import _  from 'lodash';
import {useInputHotKeys} from "./hooks";
import {CharaListItem} from "./models";



interface CharaListProps {
    list: CharaListItem[];
    onCharaRenamed?: (oldName: string, newName: string) => void
    inputRef?: React.RefObject<HTMLInputElement>
}

export const CharaListPanel = observer((props: CharaListProps) => {

    const [store] = useState(() => {

        class Store {
            list = props.list;
            @observable
            filtered: CharaListItem[] = [];
            nameField = new FieldState<string>("").enableAutoValidation().onDidChange(config => {
                if (this.editing) {
                    return;
                }
                this.doFilter(config.newValue)
            });
            @observable
            editing: CharaListItem | null = null;
            @action
            delete = (e: any, command: string, param: any) => {
                _.pull(this.list, param);
                _.pull(this.filtered, param);
                if (props.onCharaRenamed) {
                    props.onCharaRenamed(param.name, "");
                }
            };
            @action
            edit = (item: CharaListItem) => {
                this.editing = item;
                this.nameField.onChange(item.name)
            };
            @action
            commit = () => {
                const newName = this.nameField.value;
                if (this.list.find((v) => v.name === newName)) {
                    return;
                }
                if (this.editing) {
                    const oldName = this.editing.name;
                    if (props.onCharaRenamed) {
                        props.onCharaRenamed(oldName, newName);
                    }
                    this.editing.name = newName;
                    this.nameField.onChange("");
                    this.editing = null;

                } else {
                    const chara = {name: ""};
                    chara.name = newName;
                    this.nameField.onChange("");
                    this.list.push(chara);
                }
                this.resetList();
            };
            @action
            cancel = () => {
                this.editing = null;
                this.nameField.onChange("");
                this.resetList();
            };

            doFilter = _.debounce((search) => {
                const target = search.toLowerCase();
                runInAction(() => {
                    let selected;
                    if (target) {
                        selected = this.list.filter((v: CharaListItem) => {
                            const name = v.name.toLowerCase();
                            return name.startsWith(target) || name.includes(target)
                        });
                    } else {
                        selected = this.list;
                    }
                    this.filtered.splice(0, this.filtered.length);
                    this.filtered.push(...selected)
                });
            }, 100);
            @action
            resetList = () => {
                this.filtered.splice(0, this.filtered.length);
                this.filtered.push(...this.list)
            }

        }

        console.log('recreated');
        const s = new Store();
        s.resetList();
        return s;
    });

    const AddNew = observer(({}: {}) => {
        const hk = useInputHotKeys({
            enter: () => {
                store.commit()
            }, esc: () => {
                store.cancel()
            }
        });
        useEffect(() => {
            if (props.inputRef && props.inputRef.current) {
                props.inputRef.current.focus()
            }
        });

        return <div className="__add_field lined-2 flex-vcenter w-100">
            <input type="text" className="input flex-grow-1"
                   value={store.nameField.value}
                   onChange={(e) => store.nameField.onChange(e.target.value)}
                   {...hk}
                   ref={props.inputRef}
            />
            {store.nameField.value &&
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
            {store.filtered.map((item) => {
                return <div key={item.name}
                            className={classnames('__list_item lined-2', {'selected': store.editing === item})}
                            onClick={() => store.edit(item)}>
                    <span className="flex-grow-1 align-left">
                        {item.name}
                    </span>
                    <IconButton onClick={store.delete} iconSpec="fas fa-trash" command="delete" param={item}/>
                </div>
            })}
        </div>
    </div>
});

interface CharacterEditDialogProps extends CharaListProps {
    header?: string
}

export const CharacterEditDialog = (props: CharacterEditDialogProps) => {

    const [open, setOpen] = useState(false);

    const closeHandler = useCallback(() => setOpen(false), []);

    const ref = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (open && ref.current) {
            ref.current.focus()
        }
    }, [open]);

    return <React.Fragment>
        <button className="button is-rounded" onClick={() => setOpen(true)}>Chara list</button>
        <div className={`modal ${open ? 'is-active' : ''}`}>
            <div className="modal-background" onClick={closeHandler}/>
            <div className="modal-card">
                {props.header &&
                <header className="modal-card-head">
                    <p className="modal-card-title">{props.header}</p>
                    <button className="delete" aria-label="close" onClick={closeHandler}/>
                </header>
                }
                <section className="modal-card-body">
                    <CharaListPanel
                        onCharaRenamed={props.onCharaRenamed}
                        list={props.list}
                        inputRef={ref}
                    />
                </section>
                <footer className="modal-card-foot">
                    <button className="button" onClick={closeHandler}>Close</button>
                </footer>
            </div>
        </div>
    </React.Fragment>
};