import { writable, type Writable } from "svelte/store";
import { readFile, rootFolderName, writeFile } from "./filesystem";
import { Directory } from "@capacitor/filesystem";
import { isNativePlatform } from "./main";
import { InitThemeListener } from "./theme";

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

let initialized = false;

export async function InitSettings() {

    // subscribe to all settings
    function subscribeToSettings(obj: { [key: string]: any }) {
        for (let key in obj) {
            if (obj[key].subscribe) {
                obj[key].subscribe(() => {
                    if (!initialized) return;

                    writeSettings();
                });
            } else {
                subscribeToSettings(obj[key]);
            }
        }
    }

    await readSettings();

    subscribeToSettings(Settings);

    initialized = true;

    InitThemeListener();
}

export function writeSettings() {
    let settingsObj = {};

    // recursively write the settings object
    function writeSettingsRecursive(obj: { [key: string]: any }, settingsObj: { [key: string]: any }) {
        for (let key in obj) {
            if (obj[key].update === undefined) {
                settingsObj[key] = {};
                writeSettingsRecursive(obj[key], settingsObj[key]);
            } else {
                obj[key].update((val: any) => {
                    settingsObj[key] = { value: val, __setting: true };

                    return val;
                });
            }
        }
    }

    writeSettingsRecursive(Settings, settingsObj);

    let settingsString = JSON.stringify(settingsObj);

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

    console.log("settings written", settingsObj);
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
        let settingsObj = JSON.parse(settingsString);

        // recursively read the settings object
        function readSettingsRecursive(toWrite: { [key: string]: any }, cachedSettings: { [key: string]: any }) {
            for (let key in cachedSettings) {
                if (cachedSettings[key]["__setting"]) {
                    toWrite[key] = writable(cachedSettings[key].value);
                } else {
                    readSettingsRecursive(toWrite[key], cachedSettings[key]);
                }
            }
        }

        readSettingsRecursive(Settings, settingsObj);

        console.log("settings loaded", settingsObj);
    }
}