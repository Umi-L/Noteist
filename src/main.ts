import './app.css'
import App from './components/App.svelte'
import { StatusBar, Style } from '@capacitor/status-bar';
import {SafeArea} from "@capacitor-community/safe-area";
import type { Neutralino } from "./types/neutralino"

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

let isNeutralino: boolean;
try {
    isNeutralino = !!Neutralino;

} catch (e) {
    isNeutralino = false;

    console.error(e)
}
console.log('isNeutralino', isNeutralino);

export default app