import {
    DeleteFileOptions,
    Directory,
    Filesystem,
    MkdirOptions,
    ReaddirOptions, ReaddirResult, ReadFileResult,
    RenameOptions,
    RmdirOptions,
    StatOptions,
    StatResult, WriteFileResult
} from '@capacitor/filesystem';
import {isNeutralino} from "./main";
import {Capacitor} from "@capacitor/core";
import type {Neutralino} from "./types/neutralino"

export interface FileInfo {
    name: string;
    type: string;
    size: number;
    mtime: number;
    ctime: number | undefined;
    relativePath: string;
}

export function readDir(options: ReaddirOptions): Promise<{ files: FileInfo[] }> {
    if (isNeutralino) {
        return new Promise((resolve, reject) => {
            let relativePath = options.path;
            let directory: Directory | undefined = options.directory;

            let path = getNeutralinoPathFromCapacitorPath(relativePath, directory);

            console.log('calling readdir with', path);
            Neutralino.filesystem.readDirectory(path).then(async (result) => {
                let fileInfos: Array<FileInfo> = [];
                for (let file of result) {

                    let name = file.path.split('/').pop()!;

                    let stats: Neutralino.Stats;

                    console.log('calling getstats within readdir with', file.path);
                    try {
                        stats = await Neutralino.filesystem.getStats(file.path);
                    } catch (e) {
                        console.error(e);
                    }

                    fileInfos.push({
                        mtime: stats.modifiedAt,
                        name: name,
                        size: stats.size,
                        ctime: stats.createdAt,
                        type: stats.isDirectory ? 'directory' : 'file',
                        relativePath: getRelativePathFromNutralinoPath(file.path).relativePath
                    });

                    console.log('added to fileInfos', fileInfos);
                }

                resolve({files: fileInfos});

            }).catch(e => reject(e));
        });
    } else if (Capacitor.isNativePlatform()) {
        return new Promise(async (resolve, reject) => {
            let result: ReaddirResult;
            try {
                result = await Filesystem.readdir(options);
            } catch (e) {
                reject(e);
                return;
            }

            let fileInfos: Array<FileInfo> = [];

            for (let file of result.files) {
                fileInfos.push({
                    mtime: file.mtime,
                    name: file.name,
                    size: file.size,
                    ctime: file.ctime,
                    type: file.type,
                    relativePath: capacitorURIToRelativePath(file.uri)
                });
            }

            resolve({files: fileInfos});
        });


    } else {
        throw new Error('readDir is not implemented for this platform');
    }
}

function getHomeDirectoryNeutralino(): string {
    if (NL_OS === 'Windows') {
        // get current drive letter from some path X:\path\to\file
        const driveLetter = NL_CWD.split(':')[0];
        const userName = NL_CWD.split('/')[2];

        return `${driveLetter}:/Users/${userName}`;
    } else if (NL_OS === 'Linux') {
        const userName = NL_CWD.split('/')[2];

        return '/home/' + userName;
    } else if (NL_OS === 'Darwin') {
        const userName = NL_CWD.split('/')[2];

        return '/Users/' + userName;
    }
}

function capacitorURIToRelativePath(uri: string): string {
    let relativePath = uri.split('Documents/')[1];

    // turn uri into path, make special characters work ie space -> %20
    return decodeURI(relativePath);
}

function getNeutralinoPathFromCapacitorPath(relativePath: string, directory: Directory | undefined): string {

    if (!directory) {
        directory = Directory.Data;
    }

    if (directory === Directory.Documents) {
        return getHomeDirectoryNeutralino() + '/Documents/' + relativePath;
    } else if (directory === Directory.Data) {
        return NL_CWD + '/' + relativePath;
    } else if (directory === Directory.Cache) {
        return NL_CWD + '/cache/' + relativePath;
    } else if (directory === Directory.External) {
        return NL_CWD + '/external/' + relativePath;
    }
}

function getRelativePathFromNutralinoPath(path: string): { relativePath: string, directory: Directory } {
    if (path.startsWith(getNeutralinoPathFromCapacitorPath("", Directory.Documents))) {
        return {
            relativePath: path.replace(getNeutralinoPathFromCapacitorPath("", Directory.Documents), ''),
            directory: Directory.Documents
        };
    } else if (getNeutralinoPathFromCapacitorPath("", Directory.Cache)) {
        return {
            relativePath: path.replace(getNeutralinoPathFromCapacitorPath("", Directory.Cache), ''),
            directory: Directory.Cache
        };
    } else if (path.startsWith(getNeutralinoPathFromCapacitorPath("", Directory.External))) {
        return {
            relativePath: path.replace(getNeutralinoPathFromCapacitorPath("", Directory.External), ''),
            directory: Directory.External
        };
    } else {
        return {
            relativePath: path.replace(getNeutralinoPathFromCapacitorPath("", Directory.Data), ''),
            directory: Directory.Data
        };
    }
}

export function stat(options: StatOptions): Promise<StatResult> {
    if (isNeutralino) {
        return new Promise((resolve, reject) => {
            let relativePath = options.path;
            let directory: Directory | undefined = options.directory;

            let path = getNeutralinoPathFromCapacitorPath(relativePath, directory);

            console.log('calling getstats with', path);

            console.log('calling getstats with', path);
            Neutralino.filesystem.getStats(path).then((result) => {

                resolve({
                    type: result.isDirectory === 'DIRECTORY' ? 'directory' : 'file',
                    size: result.size,
                    ctime: result.createdAt,
                    mtime: result.modifiedAt,
                    uri: ""
                });
            }).catch(e => reject(e));
        });
    } else if (Capacitor.isNativePlatform()) {
        return Filesystem.stat(options);
    } else {
        throw new Error('stat is not implemented for this platform');
    }
}

export function readFile(options: { path: string, directory?: Directory }): Promise<{ data: string }> {
    if (isNeutralino) {
        return new Promise((resolve, reject) => {
            let relativePath = options.path;
            let directory: Directory | undefined = options.directory;

            let path = getNeutralinoPathFromCapacitorPath(relativePath, directory);

            console.log('calling readfile with', path);
            Neutralino.filesystem.readFile(path).then((result) => {
                resolve({data: result});
            }).catch(e => reject(e));
        });
    } else if (Capacitor.isNativePlatform()) {
        return new Promise(async (resolve, reject) => {
            let ret: ReadFileResult;
            try {
                ret = await Filesystem.readFile(options);
            } catch (e) {
                reject(e);
                return;
            }

            console.log("read data from", options.path, ret.data);

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

            console.log("decoded data from", options.path, ret.data);

            resolve({data: content});
        });
    } else {
        throw new Error('readFile is not implemented for this platform');
    }
}

export function writeFile(options: { path: string, data: string, directory?: Directory }): Promise<{
    relativePath: string
}> {
    if (isNeutralino) {
        return new Promise((resolve, reject) => {
            let relativePath = options.path;
            let directory: Directory | undefined = options.directory;

            let path = getNeutralinoPathFromCapacitorPath(relativePath, directory);

            console.log('calling writefile with', path, options.data);
            Neutralino.filesystem.writeFile(path, options.data).then(() => {
                resolve({
                    relativePath: getRelativePathFromNutralinoPath(path).relativePath
                });
            }).catch(e => reject(e));
        });
    } else if (Capacitor.isNativePlatform()) {
        return new Promise(async (resolve, reject) => {

            // convert data to b64
            options.data = btoa(options.data);

            let result: WriteFileResult;
            try {
                result = await Filesystem.writeFile(options);
            } catch (e) {
                reject(e);
                return;
            }

            resolve({
                relativePath: result.uri
            });
        });
    } else {
        throw new Error('writeFile is not implemented for this platform');
    }
}

export function mkdir(options: MkdirOptions): Promise<void> {
    if (isNeutralino) {
        return new Promise((resolve, reject) => {
            let relativePath = options.path;
            let directory: Directory | undefined = options.directory;

            let path = getNeutralinoPathFromCapacitorPath(relativePath, directory);

            console.log('calling createDirectory with', path);
            Neutralino.filesystem.createDirectory(path).then(() => {
                resolve();
            }).catch(e => reject(e));
        });
    } else if (Capacitor.isNativePlatform()) {
        return Filesystem.mkdir(options);
    } else {
        throw new Error('mkdir is not implemented for this platform');
    }
}

export function rmdir(options: RmdirOptions): Promise<void> {
    if (isNeutralino) {
        return new Promise((resolve, reject) => {
            let relativePath = options.path;
            let directory: Directory | undefined = options.directory;

            let path = getNeutralinoPathFromCapacitorPath(relativePath, directory);

            console.log('calling remove with', path);
            Neutralino.filesystem.remove(path).then(() => {
                resolve();
            }).catch(e => reject(e));
        });
    } else if (Capacitor.isNativePlatform()) {
        return Filesystem.rmdir(options);
    } else {
        throw new Error('rmdir is not implemented for this platform');
    }
}

export function rename(options: RenameOptions): Promise<void> {
    if (isNeutralino) {
        return new Promise((resolve, reject) => {
            let relativePath = options.from;
            let directory: Directory | undefined = options.directory;

            let path = getNeutralinoPathFromCapacitorPath(relativePath, directory);

            let relativeNewPath = options.to;
            let newDirectory: Directory | undefined = options.directory;

            let newPath = getNeutralinoPathFromCapacitorPath(relativeNewPath, newDirectory);

            console.log('calling move with', path, newPath);
            Neutralino.filesystem.move(path, newPath).then(() => {
                resolve();
            }).catch(e => reject(e));
        });
    } else if (Capacitor.isNativePlatform()) {
        return Filesystem.rename(options);
    } else {
        throw new Error('rename is not implemented for this platform');
    }
}

export function deleteFile(options: DeleteFileOptions): Promise<void> {
    if (isNeutralino) {
        return new Promise((resolve, reject) => {
            let relativePath = options.path;
            let directory: Directory | undefined = options.directory;

            let path = getNeutralinoPathFromCapacitorPath(relativePath, directory);

            console.log('calling remove with', path);
            Neutralino.filesystem.remove(path).then(() => {
                resolve();
            }).catch(e => reject(e));
        });
    } else if (Capacitor.isNativePlatform()) {
        return Filesystem.deleteFile(options);
    } else {
        throw new Error('deleteFile is not implemented for this platform');
    }
}