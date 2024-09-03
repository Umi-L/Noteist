import { Settings } from "./settings";

export function InitThemeListener() {
    Settings.appearance.theme.subscribe((theme) => {
        setThemeToBrowser(theme);
    });


    // set the theme
    Settings.appearance.theme.update((theme) => {

        console.log("theme listener initialized", theme);

        setThemeToBrowser(theme);

        return theme;
    });
}

function setThemeToBrowser(theme: string) {
    let html = document.getElementsByTagName("html")[0];

    html.setAttribute("data-theme", theme);

    console.log("setting theme", theme);
}