import { currentNote } from "../globals";
import { UserData } from "../userData";

export function startRecentNotesListener() {
    currentNote.subscribe((value) => {

        console.log("currentNote", value);

        if (!value) return;

        UserData.recentlyOpened.update((recentlyOpened) => {

            console.log("calling from listener", recentlyOpened);

            if (recentlyOpened.includes(value!.HTMLPath)) {
                recentlyOpened.splice(recentlyOpened.indexOf(value!.HTMLPath), 1);
            }

            recentlyOpened.unshift(value!.HTMLPath);

            if (recentlyOpened.length > 10) {
                recentlyOpened.pop();
            }

            return recentlyOpened;
        });
    });
}