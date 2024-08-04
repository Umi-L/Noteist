import hotkeys from 'hotkeys-js';
import { Settings } from './settings';

console.log("Keybinds loaded");

Settings.undoBind.subscribe((value) => {
    hotkeys(value, function (event, handler) {
        // Prevent the default refresh event under WINDOWS system
        event.preventDefault()
        alert('UNDO BIND PRESSED')
    });
});

interface KeybindsInterface {
    onUndo: Function[];
    onRedo: Function[];
}

export let Keybinds: KeybindsInterface = {
    onUndo: [],
    onRedo: [],
}

// list of call backs