import { type Writable, writable } from "svelte/store";
import type { Editor } from "@tiptap/core";
import type { DrawingTool } from "./DrawingTool";
import { PenTool } from "./Tools/PenTool";
import { Directory, ReadDirRecursive, type Note } from "./noteUtils";

export enum AppStateEnum {
    App,
    Settings
}

export const AppState = writable(AppStateEnum.App);

export const sidebarOpen = writable(true);

export const drawMode = writable(false);
export const boldMode = writable(false);
export const italicMode = writable(false);
export const underlineMode = writable(false);
export const strikeMode = writable(false);
export const highlightMode = writable(false);
export const codeMode = writable(false);

export let currentEditor: Writable<Editor | null> = writable(null);

export let currentDrawColor: Writable<string> = writable("pink");

export let drawingUndo: Writable<() => void | null> = writable(null as any);
export let drawingRedo: Writable<() => void | null> = writable(null as any);

export let filesystem: Writable<Directory | undefined> = writable(undefined);
export let openDirectories: Writable<Set<string>> = writable(new Set());

export let drawingTool: Writable<DrawingTool> = writable(new PenTool());

export let editorChangeListeners: Array<(editor: Editor) => void> = [];
export let onEditorChange = (listener: (editor: Editor) => void) => {
    editorChangeListeners.push(listener);
}

export let currentDraggingDirOrFile: Writable<Directory | Note | null> = writable(null);
export let currentCopiedDirOrFile: Writable<Directory | Note | null> = writable(null);

export let currentNote: Writable<Note | null> = writable(null);

export let notePath: Writable<string> = writable("notes");

let currentNotePath: string = "notes";
notePath.subscribe(async (path) => {
    currentNotePath = path;
    await reloadFilesystem();
});

export async function reloadFilesystem() {

    // save the current note path
    let _openNotePath: string | undefined;
    currentNote.update((note) => {
        if (note) {
            _openNotePath = note.HTMLPath;
        }
        return note;
    });

    // reload the filesystem
    const result = await ReadDirRecursive(currentNotePath, null);
    filesystem.update((fs) => {
        return result;
    });

    // if the note was open, set it again
    if (_openNotePath && result) {
        let note = result.getChildByHTMLPathRecursive(_openNotePath);
        if (note) {
            currentNote.set(note);
        }
    }
}

export interface ToastData {
    data: {
        text: string;
        type: "error" | "success" | "info";
    };
}

// TODO implement this
export let addToast: (data: ToastData) => void = (data) => {
    console.error("addToast not implemented", data);
};

export function setAddToast(func: (data: ToastData) => void) {
    addToast = func;
}