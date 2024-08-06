import { writable } from "svelte/store";

export let Settings = {
    keybinds: {
        undoBind: writable("ctrl+z"),
        redoBind: writable("ctrl+shift+z"),
    },
    general: {
        detectDrawingMode: writable(true),
        autoLeaveDrawingMode: writable(true),
        autoLeaveDrawingModeTime: writable(5000),
        showDotFiles: writable(false),
    },
    appearance: {
        theme: writable("default"),
    }
}