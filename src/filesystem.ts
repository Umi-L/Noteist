/// <reference path="./types/neutralino.ts" />
import {Directory as _Directory, Filesystem} from '@capacitor/filesystem';
import {Capacitor} from '@capacitor/core';

console.log("cwd", NL_CWD);

console.log("reading dir", NL_CWD);
Neutralino.filesystem.writeFile(NL_CWD + "/test.txt", "test").then(() => {
    console.log("file written");
});

export class Note {
    name: string;
    HTMLPath: string;
    textURI: string;
    SVGPath: string;
    directory: Directory;

    constructor(name: string, path: string, textURI: string, drawingPath: string, directory: Directory) {
        this.name = name;
        this.HTMLPath = path;
        this.textURI = textURI;
        this.SVGPath = drawingPath;
        this.directory = directory;
    }

    async rename(name: string) {
        try {
            await Filesystem.rename({
                from: this.HTMLPath,
                to: this.HTMLPath.replace(this.name, name),
                directory: _Directory.Documents
            });
        } catch (e) {
            console.error('Unable to rename directory', e);
        }

        try {
            await Filesystem.rename({
                from: this.SVGPath,
                to: this.SVGPath.replace(this.name, name),
                directory: _Directory.Documents
            });
        } catch (e) {
            console.error('Unable to rename directory', e);
        }

        await this.directory.refresh();
    }

    async delete() {
        try {
            await Filesystem.deleteFile({
                directory: _Directory.Documents,
                path: this.HTMLPath
            });
        } catch (e) {
            console.error('Unable to delete file', e);
        }

        try {
            await Filesystem.deleteFile({
                directory: _Directory.Documents,
                path: this.SVGPath
            });
        } catch (e) {
            console.error('Unable to delete file', e);
        }

    }


    async getHTMLContent() {
        try {
            console.log('Reading file', this.HTMLPath);

            const ret = await Filesystem.readFile({
                path: this.HTMLPath,
                directory: _Directory.Documents
            });

            let content = "";

            // decode from b64
            if (typeof ret.data === "string") {
                content = atob(ret.data);
            } else {
                // decode from blob await
                const reader = new FileReader();
                reader.readAsText(ret.data);
                content = await new Promise((resolve) => {
                    reader.onload = () => {
                        resolve(reader.result as string);
                    }
                });
            }

            console.log('File read', content);

            return content;
        } catch (e) {
            console.error('Unable to read file', e);

            return ""
        }
    }

    async setHTMLContent(content: string) {
        try {
            console.log('Writing to file', this.HTMLPath, "content", content);

            let b64 = btoa(content);

            await Filesystem.writeFile({
                data: b64,
                path: this.HTMLPath,
                directory: _Directory.Documents
            });
        } catch (e) {
            console.error('Unable to write file', e);
        }
    }

    async getSVGContent() {
        try {
            console.log('Reading file', this.HTMLPath);

            const ret = await Filesystem.readFile({
                path: this.SVGPath,
                directory: _Directory.Documents
            });

            let content = "";

            // decode from b64
            if (typeof ret.data === "string") {
                content = atob(ret.data);
            } else {
                // decode from blob await
                const reader = new FileReader();
                reader.readAsText(ret.data);
                content = await new Promise((resolve) => {
                    reader.onload = () => {
                        resolve(reader.result as string);
                    }
                });
            }

            console.log('File read', content);

            return content;
        } catch (e) {
            console.error('Unable to read file', e);

            return ""
        }
    }

    async setSVGContent(content: string) {
        try {
            console.log('Writing to file', this.SVGPath, "content", content);

            let b64 = btoa(content);

            await Filesystem.writeFile({
                data: b64,
                path: this.SVGPath,
                directory: _Directory.Documents
            });
        } catch (e) {
            console.error('Unable to write file', e);
        }
    }
}

export class Directory {
    name: string;
    Files: Note[];
    Directories: Directory[];
    path: string;

    constructor(name: string, path: string, Files: Note[], Directories: Directory[]) {
        this.name = name;
        this.Files = Files;
        this.Directories = Directories;
        this.path = path;
    }

    async CreateNote(name: string) {
        // create svg file
        try {
            await Filesystem.writeFile({
                data: "<svg><svg/>",
                path: this.path + "/" + name + ".svg",
                directory: _Directory.Documents
            });
        } catch (e) {
            console.error('Unable to create svg file', e);
        }

        // create html file
        try {
            await Filesystem.writeFile({
                data: "",
                path: this.path + "/" + name + ".html",
                directory: _Directory.Documents
            });
        } catch (e) {
            console.error('Unable to create svg file', e);
        }
    }

    async CreateDirectory(name: string) {
        try {
            await Filesystem.mkdir({
                path: this.path + "/" + name,
                directory: _Directory.Documents
            });
        } catch (e) {
            console.error('Unable to create directory', e);
        }
    }

    async rename(name: string) {
        let newPath = this.path.replace(this.name, name);
        try {
            await Filesystem.rename({
                from: this.path,
                to: newPath,
                directory: _Directory.Documents
            });
        } catch (e) {
            console.error('Unable to rename directory', e);

            return;
        }

        this.replaceDirectory(await ReadDirRecursive(newPath));
    }

    replaceDirectory(newDir: Directory) {
        // TODO not sure if working
        //@ts-ignore
        Object.assign(this, newDir);
    }

    async refresh() {
        this.replaceDirectory(await ReadDirRecursive(this.path));
    }

    async delete() {
        try {
            await Filesystem.rmdir({
                directory: _Directory.Documents,
                path: this.path
            });
        } catch (e) {
            console.error('Unable to delete directory', e);
        }
    }
}

export async function InitBaseDir() {
    if (Capacitor.isNativePlatform()) {
        try {
            const ret = await Filesystem.mkdir({
                path: "notes",
                directory: _Directory.Documents,
            });
        } catch (e) {
            console.error('Unable to create base directory', e);
        }
    }
}


export async function ReadDirRecursive(path: string) {
    if (Capacitor.isNativePlatform()) {
        try {
            console.log('Reading dir', path);
            const ret = await Filesystem.readdir({
                path: path,
                directory: _Directory.Documents,
            });
            console.log('Read dir', path);


            let dirSplit = path.split("/");
            let dirname = dirSplit[dirSplit.length - 1];

            let dir = new Directory(dirname, path, [], []);

            for (let file of ret.files) {
                if (file.type == "directory") {
                    let relativePath = getRelativePathFromURI(file.uri);

                    console.log('Reading dir', relativePath);

                    dir.Directories.push(await ReadDirRecursive(relativePath));
                } else {
                    // if not a html file, skip
                    if (!file.name.endsWith('.html')) continue;

                    // get companion svg file, same name as html file but with svg extension
                    let svgFile = file.uri.replace('.html', '.svg');

                    let drawingRelativePath = getRelativePathFromURI(svgFile);

                    // determine if file exists
                    try {
                        await Filesystem.stat({
                            path: drawingRelativePath,
                            directory: _Directory.Documents,
                        })
                    } catch (e) {
                        console.error('Unable to read svg file', e);

                        // create svg file
                        try {
                            await Filesystem.writeFile({
                                data: "<svg><svg/>",
                                path: "",
                                directory: _Directory.Documents
                            });
                        } catch (e) {
                            console.error('Unable to create svg file', e);
                        }
                    }

                    dir.Files.push(new Note(file.name.split(".html")[0], getRelativePathFromURI(file.uri), file.uri, drawingRelativePath, dir));
                }
            }

            return dir;
        } catch (e) {
            console.error('Unable to read dir', e);
        }
    } else {
        console.error('This is not a native platform');

        let dir = new Directory('notes', "", [], [
            new Directory('Folder 1', "", [], [])
        ]);

        dir.Files.push(new Note("File 1", "notes/File 1", "notes/File 1", dir));

        return dir;
    }
}

export function getRelativePathFromURI(uri: string) {
    let relativePath = uri.split('Documents/')[1];

    // turn uri into path, make special characters work ie space -> %20
    return decodeURI(relativePath);
}

export async function GetFileContent(path: string) {

}