import { writable, type Writable } from "svelte/store";
import { isNativePlatform } from "./main";
import { readFile, rootFolderName, writeFile } from "./filesystem";
import { Directory } from "@capacitor/filesystem";
import { addCallbackToAllWritablesInObject, deserializeJsonObjectWithStores, serializeJsonObjectWithStores } from "./utils/serializationUtils";
import { User } from "phosphor-svelte";

export let UserData = {
    recentlyOpened: writable([]) as Writable<string[]>,
};


export async function InitUserData() {
    await readUserData();

    addCallbackToAllWritablesInObject(UserData, writeUserData);

    console.log("UserData initialized");
}

export function writeUserData() {

    let dataString = serializeJsonObjectWithStores(UserData);

    localStorage.setItem("userData", dataString);

    if (isNativePlatform) {
        try {
            // write to file
            writeFile({
                path: `${rootFolderName}/userData.json`,
                data: dataString,
                directory: Directory.Documents,
            });
        } catch (e) {
            console.error("error writing userData", e);
        }
    }

    console.log("userData written", dataString);
}

export async function readUserData() {
    let dataString: string | null = null;

    if (isNativePlatform) {
        try {
            let result = await readFile({
                path: `${rootFolderName}/userData.json`,
                directory: Directory.Documents,
            })

            dataString = result.data;
        } catch (e) {
            console.error("error reading userData", e);

            // if doesn't exist fallback to localstorage
            dataString = localStorage.getItem("userData");
        }
    } else {
        dataString = localStorage.getItem("userData");
    }

    if (dataString) {
        deserializeJsonObjectWithStores(dataString, UserData);
    }
}