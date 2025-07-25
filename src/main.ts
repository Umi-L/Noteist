import './app.css'
import App from './components/App.svelte'
import { StatusBar, Style } from '@capacitor/status-bar';
import { SafeArea } from "@capacitor-community/safe-area";
import { enableDragDropTouch } from './dragdroptouch/drag-drop-touch';
import { Capacitor } from "@capacitor/core";
import { InitSettings } from './settings';
import { InitThemeListener } from './theme';
import { InitUserData } from './userData';
import { startRecentNotesListener } from './listeners/recentNotesListener';
import { InitBaseDir, ReadDirRecursive } from './noteUtils';
import { filesystem } from './globals';
import { rootFolderName } from './filesystem';

enableDragDropTouch();

export let isNeutralino: boolean;
try {
    ``
    isNeutralino = !!Neutralino;

} catch (e) {
    isNeutralino = false;

    console.error(e)
}
console.log('isNeutralino', isNeutralino);

export const isNativePlatform = Capacitor.isNativePlatform() || isNeutralino;

console.log('isNativePlatform', isNativePlatform);

InitSettings();
InitUserData();
startRecentNotesListener();

async function initFilesystem() {
    // create notes directory if it doesn't exist
    await InitBaseDir();

    // read filesystem and set it to the store
    filesystem.set((await ReadDirRecursive(rootFolderName, null))!);

    console.log("initialized filesystem");
}

initFilesystem();

if (isNeutralino) {
    /*
    Function to handle click events on the tray menu items.
    This function performs different actions based on the clicked item's ID,
    such as displaying version information or exiting the application.
    */
    function onTrayMenuItemClicked(event: any) {
        switch (event.detail.id) {
            case "VERSION":
                // Display version information
                Neutralino.os.showMessageBox("Version information",
                    `Neutralinojs server: v${NL_VERSION} | Neutralinojs client: v${NL_CVERSION}`);
                break;
            case "QUIT":
                // Exit the application
                Neutralino.app.exit();
                break;
        }
    }

    /*
        Function to handle the window close event by gracefully exiting the Neutralino application.
    */
    function onWindowClose() {
        Neutralino.app.exit();
    }

    // Initialize Neutralino
    Neutralino.init();

    // Register event listeners
    Neutralino.events.on("trayMenuItemClicked", onTrayMenuItemClicked);
    Neutralino.events.on("windowClose", onWindowClose);
}

const app = new App({
    target: document.getElementById('app')!,
})

// get --background from css
const style = getComputedStyle(document.documentElement);
const background = style.getPropertyValue('--background');

// StatusBar.setBackgroundColor({ color: background }).then(() => {
//   console.log('Status bar color changed');
// }).catch((err) => {
//     console.error('Unable to change status bar color', err);
// });

SafeArea.enable({
    config: {
        customColorsForSystemBars: true,
        statusBarColor: '#00000000', // transparent
        statusBarContent: 'light',
        navigationBarColor: '#00000000', // transparent
        navigationBarContent: 'light',
    },
});

export default app