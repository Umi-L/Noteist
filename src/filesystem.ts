import {Directory as _Directory, Filesystem as FS} from '@capacitor/filesystem';
import {Capacitor} from '@capacitor/core';
import createFilesystem from "capacitor-fs";

const Filesystem = createFilesystem(FS, {
    directory: _Directory.Data,
    rootDir: "/"
});

export class Note {
    name: string;
    HTMLPath: string;
    SVGPath: string;
    directory: Directory;

    constructor(name: string, path: string, drawingPath: string, directory: Directory) {
        this.name = name;
        this.HTMLPath = path;
        this.SVGPath = drawingPath;
        this.directory = directory;
    }

    async rename(name: string) {
        try {
            await Filesystem.rename(this.HTMLPath, this.HTMLPath.replace(this.name, name));
        } catch (e) {
            console.error('Unable to rename directory', e);
        }

        try {
            await Filesystem.rename(this.SVGPath, this.SVGPath.replace(this.name, name));
        } catch (e) {
            console.error('Unable to rename directory', e);
        }

        await this.directory.refresh();
    }

    async delete() {
        try {
            await Filesystem.unlink(this.HTMLPath);
        } catch (e) {
            console.error('Unable to delete file', e);
        }

        try {
            await Filesystem.unlink(this.SVGPath);
        } catch (e) {
            console.error('Unable to delete file', e);
        }

    }


    async getHTMLContent() {
        try {
            console.log('Reading file', this.HTMLPath);

            const ret = await Filesystem.readFile(this.HTMLPath);

            let content = getDataFromArrayBuffer(ret);

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

            await Filesystem.writeFile(this.HTMLPath, content);
        } catch (e) {
            console.error('Unable to write file', e);
        }
    }

    async getSVGContent() {
        try {
            console.log('Reading file', this.HTMLPath);

            const ret = await Filesystem.readFile(this.SVGPath);

            let content = getDataFromArrayBuffer(ret);

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

            await Filesystem.writeFile(this.SVGPath, content);
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
            await Filesystem.writeFile(this.path + "/" + name + ".svg", "");
        } catch (e) {
            console.error('Unable to create svg file', e);
        }

        // create html file
        try {
            await Filesystem.writeFile(this.path + "/" + name + ".html", "");
        } catch (e) {
            console.error('Unable to create svg file', e);
        }
    }

    async CreateDirectory(name: string) {
        try {
            await Filesystem.mkdir(this.path + "/" + name);
        } catch (e) {
            console.error('Unable to create directory', e);
        }
    }

    async rename(name: string) {
        let newPath = this.path.replace(this.name, name);
        try {
            await Filesystem.rename(this.path, newPath);
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
            await Filesystem.rmdir(this.path);
        } catch (e) {
            console.error('Unable to delete directory', e);
        }
    }
}

export async function InitBaseDir() {
    if (Capacitor.isNativePlatform()) {

        console.log('Creating base directory');
        try {
            const ret = await Filesystem.mkdir("notes");
        } catch (e) {
            console.error('Unable to create base directory', e);
        }
    }
}


export async function ReadDirRecursive(path: string) {
    if (Capacitor.isNativePlatform()) {
        try {
            const ret = await Filesystem.readdir(path);

            let dirSplit = path.split("/");
            let dirname = dirSplit[dirSplit.length - 1];

            let dir = new Directory(dirname, path, [], []);

            for (let file: string of ret) {

                console.log('Reading file', file);

                let filePath = path + "/" + file;

                // if it has a file extension, it is a file
                let isDirectory = !file.includes('.');

                if (isDirectory) {
                    console.log('Reading dir', filePath);

                    dir.Directories.push(await ReadDirRecursive(filePath));
                } else {
                    // if not a html file, skip
                    if (!file.includes('.html'))
                        continue;

                    // get companion svg file, same name as html file but with svg extension
                    let svgFile = filePath.replace('.html', '.svg');

                    // // determine if file exists
                    // if (!(await Filesystem.exists(svgFile))) {
                    //     // create svg file
                    //     try {
                    //         await Filesystem.writeFile(svgFile, "");
                    //     } catch (e) {
                    //         console.error('Unable to create svg file', e);
                    //     }
                    // }

                    dir.Files.push(new Note(file.split(".html")[0], filePath, svgFile, dir));
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

function getDataFromArrayBuffer(buffer: ArrayBuffer) {
    return new TextDecoder().decode(buffer);
}