import { writable, type Writable } from "svelte/store";
import { readFile, rootFolderName, writeFile } from "./filesystem";
import { Directory } from "@capacitor/filesystem";
import { isNativePlatform } from "./main";
import { InitThemeListener } from "./theme";
import { addCallbackToAllWritablesInObject, deserializeJsonObjectWithStores, serializeJsonObjectWithStores } from "./utils/serializationUtils";

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

export async function InitSettings() {

    await readSettings();

    addCallbackToAllWritablesInObject(Settings, writeSettings);

    InitThemeListener();
}

export function writeSettings() {
    let settingsString = serializeJsonObjectWithStores(Settings);

    localStorage.setItem("settings", settingsString);

    if (isNativePlatform) {
        try {
            // write to file
            writeFile({
                path: `${rootFolderName}/settings.json`,
                data: settingsString,
                directory: Directory.Documents,
            });
        } catch (e) {
            console.error("error writing settings", e);
        }
    }

    console.log("settings written", settingsString);
}

export async function readSettings() {
    let settingsString: string | null = null;

    if (isNativePlatform) {
        try {
            let result = await readFile({
                path: `${rootFolderName}/settings.json`,
                directory: Directory.Documents,
            })

            settingsString = result.data;
        } catch (e) {
            console.error("error reading settings", e);

            // if doesn't exist fallback to localstorage
            settingsString = localStorage.getItem("settings");
        }
    } else {
        settingsString = localStorage.getItem("settings");
    }

    if (settingsString) {
        deserializeJsonObjectWithStores(settingsString, Settings);
    }
}