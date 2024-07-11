import type {Point} from "./Point";
import type {SvelteComponent} from "svelte";
import type {ConstructorOfATypedSvelteComponent} from "svelte-check/dist/src/svelte-shims";

export let showContextMenu = (pos: Point, options: Array<IMenuOption>) => {
    console.log('Showing context menu');
};

export let hideContextMenu = (() => {
    console.log('Hiding context menu');
});

export let setShowContextMenu = (func: (pos: Point, options: Array<IMenuOption>) => void) => {
    showContextMenu = func;
}

export let setHideContextMenu = (func: () => void) => {
    hideContextMenu = func;
}

export interface IMenuOption {
    label: string;
    icon?: ConstructorOfATypedSvelteComponent;
    subMenuOptions?: IMenuOption[];
    availableCheck: () => boolean;
    action: (event: MouseEvent) => void;
}