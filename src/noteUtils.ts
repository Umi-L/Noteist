import { Directory as _Directory } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";
import {
    readDir,
    readFile,
    stat,
    writeFile,
    rename,
    mkdir,
    rmdir,
    deleteFile,
} from "./filesystem";
import { isNeutralino } from "./main";
import type { Writable } from "svelte/store";
import { addToast, currentNote, filesystem, openDirectories, reloadFilesystem } from "./globals";
import { Settings } from "./settings";

let showDotFiles = true;
Settings.general.showDotFiles.subscribe((val) => {
    showDotFiles = val;
});

function error(text: string, e: any) {
    console.error(e);
    addToast({
        data: {
            text: text,
            type: "error",
        },
    });
}

export class Note {
    Name: string;
    HTMLPath: string;
    SVGPath: string;
    Parent: Directory;

    constructor(
        name: string,
        path: string,
        drawingPath: string,
        directory: Directory,
    ) {
        this.Name = name;
        this.HTMLPath = path;
        this.SVGPath = drawingPath;
        this.Parent = directory;
    }

    async rename(name: string) {

        let success = true;

        let splitPath = this.HTMLPath.split("/");

        let newHTMLPath =
            splitPath.slice(0, splitPath.length - 1).join("/") +
            "/" +
            name +
            ".html";

        let newSVGPath =
            splitPath.slice(0, splitPath.length - 1).join("/") +
            "/" +
            name +
            ".svg";


        try {
            await rename({
                from: this.HTMLPath,
                to: newHTMLPath,
                directory: _Directory.Documents,
            });
        } catch (e) {
            error("Unable to rename directory", e);

            success = false;
        }

        try {
            await rename({
                from: this.SVGPath,
                to: newSVGPath,
                directory: _Directory.Documents,
            });
        } catch (e) {
            error("Unable to rename note", e);

            success = false;
        }

        if (success) {
            currentNote.update((note) => {
                if (note == this) {
                    note.HTMLPath = newHTMLPath;
                    note.SVGPath = newHTMLPath;
                }
                return note;
            });
        }

        await this.Parent.refresh();
    }

    async move(path: string) {

        let originalName = await getNextAvailableNoteName(this.Name, path);
        let newHTMLPath = path + "/" + originalName + ".html";
        let newSVGPath = path + "/" + originalName + ".svg";

        let success = true;

        try {
            await rename({
                from: this.HTMLPath,
                to: newHTMLPath,
                directory: _Directory.Documents,
            });
        } catch (e) {
            error("Unable to move note", e);

            success = false;
        }

        try {
            await rename({
                from: this.SVGPath,
                to: newSVGPath,
                directory: _Directory.Documents,
            });
        } catch (e) {
            error("Unable to move note", e);

            success = false;
        }

        if (success) {
            currentNote.update((note) => {
                if (note == this) {
                    note.HTMLPath = newHTMLPath;
                    note.SVGPath = newSVGPath;
                }
                return note;
            });
        }

        await this.Parent.refresh();
    }

    async copyAndPaste(path: string) {
        let originalName = await getNextAvailableNoteName(this.Name, path);

        try {
            let htmlContent = await this.getHTMLContent();
            let newHtmlPath = path + "/" + originalName + ".html";

            await writeFile({
                data: htmlContent,
                directory: _Directory.Documents,
                path: newHtmlPath,
            });
        } catch (e) {
            error("Unable to copy html content of note", e);
        }

        try {
            let svgContent = await this.getSVGContent();
            let newSvgPath = path + "/" + originalName + ".svg";

            await writeFile({
                data: svgContent,
                directory: _Directory.Documents,
                path: newSvgPath,
            });
        } catch (e) {
            error("Unable to copy svg content of note", e);
        }

        await this.Parent.refresh();
    }

    async delete() {

        let success = true;

        try {
            await deleteFile({
                directory: _Directory.Documents,
                path: this.HTMLPath,
            });
        } catch (e) {
            error("Unable to delete file", e);

            success = false;
        }

        try {
            await deleteFile({
                directory: _Directory.Documents,
                path: this.SVGPath,
            });
        } catch (e) {
            error("Unable to delete file", e);

            success = false;
        }

        if (success) {
            currentNote.update((note) => {
                if (note == this) {
                    note = null;
                }
                return note;
            });
        }

        await this.Parent.refresh();
    }

    async getHTMLContent() {
        try {
            console.debug("Reading file", this.HTMLPath);

            const ret = await readFile({
                path: this.HTMLPath,
                directory: _Directory.Documents,
            });

            console.debug("File read", ret.data);

            return ret.data;
        } catch (e) {
            error("Unable to read file", e);

            return "";
        }
    }

    async setHTMLContent(content: string) {
        try {
            console.debug("Writing to file", this.HTMLPath, "content", content);

            await writeFile({
                data: content,
                path: this.HTMLPath,
                directory: _Directory.Documents,
            });
        } catch (e) {
            error("Unable to write file", e);
        }
    }

    async getSVGContent() {
        try {
            console.debug("Reading file", this.SVGPath);

            const ret = await readFile({
                path: this.SVGPath,
                directory: _Directory.Documents,
            });

            console.debug("File read", ret.data);

            return ret.data;
        } catch (e) {
            error("Unable to read file", e);

            return "";
        }
    }

    async setSVGContent(content: string) {
        try {
            console.debug("Writing to file", this.SVGPath, "content", content);

            await writeFile({
                data: content,
                path: this.SVGPath,
                directory: _Directory.Documents,
            });
        } catch (e) {
            error("Unable to write file", e);
        }
    }
}

export class Directory {
    Name: string;
    Files: Note[];
    Directories: Directory[];
    path: string;
    Parent: Directory | null;

    constructor(
        name: string,
        path: string,
        Files: Note[],
        Directories: Directory[],
        parent: Directory | null,
    ) {
        this.Name = name;
        this.Files = Files;
        this.Directories = Directories;
        this.path = path;
        this.Parent = parent;
    }

    async CreateNote(name: string) {
        // create svg file
        try {
            await writeFile({
                data: "<svg><svg/>",
                path: this.path + "/" + name + ".svg",
                directory: _Directory.Documents,
            });
        } catch (e) {
            error("Unable to create svg file", e);
        }

        // create html file
        try {
            await writeFile({
                data: "<h1></h1>",
                path: this.path + "/" + name + ".html",
                directory: _Directory.Documents,
            });
        } catch (e) {
            error("Unable to create svg file", e);
        }

        currentNote.update((note) => {
            return new Note(
                name,
                this.path + "/" + name + ".html",
                this.path + "/" + name + ".svg",
                this,
            );
        });

        await this.refresh();
    }

    async move(path: string) {

        let originalName = await getNextAvailableDirName(this.Name, path);
        let newPath = path + "/" + originalName;

        try {
            await rename({
                from: this.path,
                to: newPath,
                directory: _Directory.Documents,
            });
        } catch (e) {
            error("Unable to move directory", e);
        }

        await this.refreshParent();
    }

    async copyAndPaste(path: string) {

        let originalName = await getNextAvailableDirName(this.Name, path);
        let newPath = path + "/" + originalName;

        try {
            await mkdir({
                path: newPath,
                directory: _Directory.Documents,
            });
        } catch (e) {
            error("Unable to create directory", e);
        }

        let children = this.getAllChildrenRecursive();

        for (let child of children) {
            if (child instanceof Note) {
                await child.copyAndPaste(newPath);
            }
        }

        // TODO this is wrong but will work given refresh always refreshes from the root
        await this.refreshParent();
    }

    getAllChildrenRecursive() {
        let children: (Directory | Note)[] = [];

        for (let file of this.Files) {
            children.push(file);
        }

        for (let dir of this.Directories) {
            children.push(dir);
            children.push(...dir.getAllChildrenRecursive());
        }

        return children;
    }

    getChildByHTMLPathRecursive(path: string): Note | null {
        let childrenRecursive = this.getAllChildrenRecursive();

        for (let child of childrenRecursive) {
            if (child instanceof Note) {
                if (child.HTMLPath == path) {
                    return child;
                }
            }
        }

        return null;
    }

    async CreateDirectory(name: string) {
        try {
            await mkdir({
                path: this.path + "/" + name,
                directory: _Directory.Documents,
            });
        } catch (e) {
            error("Unable to create directory", e);
        }

        await this.refresh();
    }

    async rename(name: string) {
        let newPath =
            this.path
                .split("/")
                .slice(0, this.path.split("/").length - 1)
                .join("/") +
            "/" +
            name;

        let success = true;

        try {
            await rename({
                from: this.path,
                to: newPath,
                directory: _Directory.Documents,
            });
        } catch (e) {
            error("Unable to rename directory", e);

            success = false;
        }

        if (success) {
            openDirectories.update((dirs) => {
                if (dirs.has(this.path)) {
                    dirs.delete(this.path);
                    dirs.add(newPath);
                }

                return dirs;
            });
        }


        await this.refreshParent();
    }

    replaceDirectory(newDir: Directory) {
        //@ts-ignore
        Object.assign(this, newDir);
    }

    async refresh() {
        this.replaceDirectory((await ReadDirRecursive(this.path, this.Parent))!);

        reloadFilesystem();

        console.log("Refreshed dir", this.path);
    }

    async delete() {

        let success = true;

        try {
            await rmdir({
                directory: _Directory.Documents,
                path: this.path,
            });
        } catch (e) {
            error("Unable to delete directory", e);

            success = false;
        }

        if (success) {
            openDirectories.update((dirs) => {
                dirs.delete(this.path);
                return dirs;
            });
        }

        await this.refreshParent();
    }

    async refreshParent() {
        if (this.Parent) {
            await this.Parent.refresh();
        }
    }
}

export async function getNextAvailableNoteName(name: string, path: string) {
    let i = 1;
    let newName = name;

    console.log("Checking if note exists", path + "/" + newName + ".html");

    while (true) {
        try {
            let result = await stat({
                path: path + "/" + newName + ".html",
                directory: _Directory.Documents,
            });

            console.debug("Stat result", result);
        }
        catch (e) {
            return newName;
        }

        newName = name + " (" + i + ")";

        i++;
    }
}

export async function getNextAvailableDirName(name: string, path: string) {
    let i = 1;
    let newName = name;

    while (true) {

        console.log("Checking if dir exists", path + "/" + newName);

        try {
            let result = await stat({
                path: path + "/" + newName,
                directory: _Directory.Documents,
            });

            console.debug("Stat result", result);
        }
        catch (e) {
            return newName;
        }

        newName = name + " (" + i + ")";

        i++;
    }
}

export async function InitBaseDir() {
    if (Capacitor.isNativePlatform() || isNeutralino) {
        try {
            const ret = await mkdir({
                path: "notes",
                directory: _Directory.Documents,
            });
        } catch (e) {
            console.log("Unable to create base directory", e);
        }
    }
}

export async function ReadDirRecursive(path: string, parent: Directory | null) {
    if (Capacitor.isNativePlatform() || isNeutralino) {
        // if mobile or desktop
        try {
            console.debug("Reading dir", path);
            const ret = await readDir({
                path: path,
                directory: _Directory.Documents,
            });

            let dirSplit = path.split("/");
            let dirname = dirSplit[dirSplit.length - 1];

            let dir = new Directory(dirname, path, [], [], parent);

            for (let file of ret.files) {

                // if is dotfile and settings say not to show dotfiles, skip
                if (file.name.startsWith(".") && !showDotFiles) continue;

                console.debug("got file", file);
                if (file.type == "directory") {
                    let relativePath = file.relativePath;

                    console.debug("Reading dir from relative path", relativePath);

                    dir.Directories.push((await ReadDirRecursive(relativePath, dir))!);
                } else {
                    // if not a html file, skip
                    if (!file.name.endsWith(".html")) continue;

                    // get companion svg file, same name as html file but with svg extension
                    let svgFile = file.relativePath.replace(".html", ".svg");

                    // determine if file exists
                    try {
                        console.debug("Checking if svg file exists", svgFile);
                        await stat({
                            path: svgFile,
                            directory: _Directory.Documents,
                        });
                    } catch (e) {
                        error("Unable to read svg file", e);

                        // create svg file
                        try {
                            await writeFile({
                                data: "<svg><svg/>",
                                path: svgFile,
                                directory: _Directory.Documents,
                            });
                        } catch (e) {
                            error("Unable to create svg file", e);
                        }
                    }

                    dir.Files.push(
                        new Note(
                            file.name.split(".html")[0],
                            file.relativePath,
                            svgFile,
                            dir,
                        ),
                    );
                }
            }

            console.debug("Read dir", dir);

            return dir;
        } catch (e) {
            error("Unable to read dir", e);
        }
    } else {
        error("This is not a native platform", "This is not a native platform");

        // return dummy data for testing
        // @ts-ignore
        let dir = new Directory(
            "notes",
            "",
            [],
            [
                // @ts-ignore
                new Directory("Folder 1", "", [], [])
            ],
        );


        const numNotes = 20;

        for (let i = 0; i < numNotes; i++) {
            dir.Files.push(new Note("File " + i, "notes/File " + i, "notes/File " + i, dir));
        }

        return dir;
    }
}
