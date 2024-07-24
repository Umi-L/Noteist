import { Directory as _Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { readDir, readFile, stat, writeFile, rename, mkdir, rmdir, deleteFile } from "./filesystem";
import { isNeutralino } from "./main";
import type {Writable} from "svelte/store";

export class Note {
    Name: string;
    HTMLPath: string;
    SVGPath: string;
    Parent: Directory;
    selfWritable: Writable<Directory | Note>

    constructor(name: string, path: string, drawingPath: string, directory: Directory) {
        this.Name = name;
        this.HTMLPath = path;
        this.SVGPath = drawingPath;
        this.Parent = directory;
    }

    async rename(name: string) {
        try {
            let splitPath = this.HTMLPath.split("/");
            let newPath = splitPath.slice(0, splitPath.length - 1).join("/") + "/" + name + ".html";

            await rename({
                from: this.HTMLPath,
                to: newPath,
                directory: _Directory.Documents
            });
        } catch (e) {
            console.error('Unable to rename directory', e);
        }

        try {
            let splitPath = this.SVGPath.split("/");
            let newPath = splitPath.slice(0, splitPath.length - 1).join("/") + "/" + name + ".svg";

            await rename({
                from: this.SVGPath,
                to: newPath,
                directory: _Directory.Documents
            });
        } catch (e) {
            console.error('Unable to rename note', e);
        }

        await this.Parent.refresh();
    }

    async delete() {
        try {
            await deleteFile({
                directory: _Directory.Documents,
                path: this.HTMLPath
            });
        } catch (e) {
            console.error('Unable to delete file', e);
        }

        try {
            await deleteFile({
                directory: _Directory.Documents,
                path: this.SVGPath
            });
        } catch (e) {
            console.error('Unable to delete file', e);
        }

        await this.Parent.refresh();
    }


    async getHTMLContent() {
        try {
            console.log('Reading file', this.HTMLPath);

            const ret = await readFile({
                path: this.HTMLPath,
                directory: _Directory.Documents
            });

            console.log('File read', ret.data);

            return ret.data;
        } catch (e) {
            console.error('Unable to read file', e);

            return ""
        }
    }

    async setHTMLContent(content: string) {
        try {
            console.log('Writing to file', this.HTMLPath, "content", content);

            await writeFile({
                data: content,
                path: this.HTMLPath,
                directory: _Directory.Documents
            });
        } catch (e) {
            console.error('Unable to write file', e);
        }
    }

    async getSVGContent() {
        try {
            console.log('Reading file', this.SVGPath);

            const ret = await readFile({
                path: this.SVGPath,
                directory: _Directory.Documents
            });

            console.log('File read', ret.data);

            return ret.data;
        } catch (e) {
            console.error('Unable to read file', e);

            return ""
        }
    }

    async setSVGContent(content: string) {
        try {
            console.log('Writing to file', this.SVGPath, "content", content);

            await writeFile({
                data: content,
                path: this.SVGPath,
                directory: _Directory.Documents
            });
        } catch (e) {
            console.error('Unable to write file', e);
        }
    }
}

export class Directory {
    Name: string;
    Files: Note[];
    Directories: Directory[];
    path: string;
    Parent: Directory | null;
    selfWritable: Writable<Directory | Note>

    constructor(name: string, path: string, Files: Note[], Directories: Directory[], parent: Directory | null) {
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
                directory: _Directory.Documents
            });
        } catch (e) {
            console.error('Unable to create svg file', e);
        }

        // create html file
        try {
            await writeFile({
                data: "",
                path: this.path + "/" + name + ".html",
                directory: _Directory.Documents
            });
        } catch (e) {
            console.error('Unable to create svg file', e);
        }

        await this.refresh();
    }

    async CreateDirectory(name: string) {
        try {
            await mkdir({
                path: this.path + "/" + name,
                directory: _Directory.Documents
            });
        } catch (e) {
            console.error('Unable to create directory', e);
        }

        await this.refresh();
    }

    async rename(name: string) {
        let newPath = this.path.split("/").slice(0, this.path.split("/").length - 1).join("/") + "/" + name;
        try {
            await rename({
                from: this.path,
                to: newPath,
                directory: _Directory.Documents
            });
        } catch (e) {
            console.error('Unable to rename directory', e);

            return;
        }

        await this.refreshParent();
    }

    replaceDirectory(newDir: Directory) {
        //@ts-ignore
        Object.assign(this, newDir);
    }

    async refresh() {
        let selfWritable = this.selfWritable;

        console.log("selfWritable is pre", this.selfWritable, "from", this.Name);

        this.replaceDirectory(await ReadDirRecursive(this.path, this.Parent));
        this.selfWritable = selfWritable;

        console.log("selfWritable is post", this.selfWritable, "from", this.Name);

        this.selfWritable.set(this);

        console.log('Refreshed dir', this.path);
    }

    async delete() {
        try {
            await rmdir({
                directory: _Directory.Documents,
                path: this.path
            });
        } catch (e) {
            console.error('Unable to delete directory', e);
        }

        await this.refreshParent();
    }

    async refreshParent() {
        if (this.Parent) {
            await this.Parent.refresh();
        }
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
            console.error('Unable to create base directory', e);
        }
    }
}


export async function ReadDirRecursive(path: string, parent: Directory | null) {
    if (Capacitor.isNativePlatform() || isNeutralino) { // if mobile or desktop
        try {
            console.log('Reading dir', path);
            const ret = await readDir({
                path: path,
                directory: _Directory.Documents,
            });

            let dirSplit = path.split("/");
            let dirname = dirSplit[dirSplit.length - 1];

            let dir = new Directory(dirname, path, [], [], parent);

            for (let file of ret.files) {
                console.log('got file', file);
                if (file.type == "directory") {
                    let relativePath = file.relativePath;

                    console.log('Reading dir from relative path', relativePath);

                    dir.Directories.push(await ReadDirRecursive(relativePath, dir));
                } else {
                    // if not a html file, skip
                    if (!file.name.endsWith('.html')) continue;

                    // get companion svg file, same name as html file but with svg extension
                    let svgFile = file.relativePath.replace('.html', '.svg');

                    // determine if file exists
                    try {
                        console.log('Checking if svg file exists', svgFile);
                        await stat({
                            path: svgFile,
                            directory: _Directory.Documents,
                        })
                    } catch (e) {
                        console.error('Unable to read svg file', e);

                        // create svg file
                        try {
                            await writeFile({
                                data: "<svg><svg/>",
                                path: svgFile,
                                directory: _Directory.Documents
                            });
                        } catch (e) {
                            console.error('Unable to create svg file', e);
                        }
                    }

                    dir.Files.push(new Note(file.name.split(".html")[0], file.relativePath, svgFile, dir));
                }
            }

            console.log('Read dir', dir);

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