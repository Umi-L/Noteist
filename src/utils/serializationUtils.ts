import { get, writable } from "svelte/store";

export function serializeJsonObjectWithStores(objectWithStores: any) {
    let obj = {};

    // recursively write the settings object
    function writeObjectRecursive(obj: { [key: string]: any }, settingsObj: { [key: string]: any }) {
        for (let key in obj) {
            if (obj[key].update === undefined) {
                settingsObj[key] = {};
                writeObjectRecursive(obj[key], settingsObj[key]);
            } else {
                // TODO optimize this?
                settingsObj[key] = { value: get(obj[key]), __setting: true };
            }
        }
    }

    writeObjectRecursive(objectWithStores, obj);

    let objectString = JSON.stringify(obj);

    return objectString;
}

export function deserializeJsonObjectWithStores(objectString: string, objectWithStores: any) {
    let obj = JSON.parse(objectString);

    // recursively read the settings object
    function readRecursive(toWrite: { [key: string]: any }, cached: { [key: string]: any }) {
        for (let key in cached) {
            if (cached[key]["__setting"]) {
                toWrite[key] = writable(cached[key].value);
            } else {
                readRecursive(toWrite[key], cached[key]);
            }
        }
    }

    readRecursive(objectWithStores, obj);

    console.log("settings loaded", obj);
}

export function addCallbackToAllWritablesInObject(obj: { [key: string]: any }, callback: () => void) {
    let initialized = false;

    for (let key in obj) {
        if (obj[key].subscribe) {
            obj[key].subscribe(() => {
                if (!initialized) return;
                callback();
            });
        } else {
            addCallbackToAllWritablesInObject(obj[key], callback);
        }
    }

    initialized = true;
}