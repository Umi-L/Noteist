import {Directory as _Directory, Filesystem} from '@capacitor/filesystem';
import {Capacitor} from '@capacitor/core';

export class File {
    name: string;
    path: string;
    directory: Directory;

    constructor(name: string, path: string, directory: Directory) {
        this.name = name;
        this.path = path;
        this.directory = directory;
    }
}

export class Directory {
    name: string;
    Files: File[];
    Directories: Directory[];

    constructor(name: string, Files: File[], Directories: Directory[]) {
        this.name = name;
        this.Files = Files;
        this.Directories = Directories;
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
            const ret = await Filesystem.readdir({
                path: path,
                directory: _Directory.Documents,
            });

            let dirSplit = path.split("/");
            let dirname = dirSplit[dirSplit.length - 1];

            let dir = new Directory(dirname, [], []);

            for (let file of ret.files) {
                if (file.type == "directory") {
                    let relativePath = file.uri.split('Documents/')[1];

                    // turn uri into path, make special characters work ie space -> %20
                    relativePath = decodeURI(relativePath);

                    console.log('Reading dir', relativePath);

                    dir.Directories.push(await ReadDirRecursive(relativePath));
                } else {
                    dir.Files.push(new File(file.name, file.uri, dir));
                }
            }

            return dir;
        } catch (e) {
            console.error('Unable to read dir', e);
        }
    } else {
        console.error('This is not a native platform');

        let dir = new Directory('notes', [], [
            new Directory('Folder 1', [], [])
        ]);

        dir.Files.push(new File("File 1", "notes/File 1", dir));

        return dir;
    }
}

export async function GetFileContent(path: string) {

}