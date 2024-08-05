import { writable } from "svelte/store";

export let Settings = {
    undoBind: writable("ctrl+z"),
    redoBind: writable("ctrl+shift+z"),
}