import {type Writable, writable} from "svelte/store";
import type {Editor} from "@tiptap/core";
import type {DrawingTool} from "./DrawingTool";
import {PenTool} from "./Tools/PenTool";

export const drawMode = writable(false);
export const boldMode = writable(false);
export const italicMode = writable(false);
export const underlineMode = writable(false);
export const strikeMode = writable(false);
export const highlightMode = writable(false);
export const codeMode = writable(false);

export let currentEditor: Writable<Editor | null> = writable(null);

export let currentDrawColor: Writable<string> = writable("pink");

export let drawingUndo: Writable<()=>void | null> = writable(null);
export let drawingRedo: Writable<()=>void | null> = writable(null);

export let drawingTool: Writable<DrawingTool> = writable(new PenTool());