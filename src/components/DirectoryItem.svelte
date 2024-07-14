<script lang="ts">

    import {
        CaretDown,
        CaretRight,
        DotsThreeVertical,
        Folder,
        Note as NoteIcon,
        Pen,
        Plus,
        Trash
    } from "phosphor-svelte";
    import {Directory, Note, ReadDirRecursive} from "../noteUtils";
    import {hideContextMenu, showContextMenu} from "../contextmenu";
    import {currentNote} from "../globals";

    export let directoryObject: Directory | Note;

    const size = 16;
    const innerSize = 16;

    let expanded = false;

    function click() {
        if (directoryObject instanceof Directory) {
            expanded = !expanded;
        } else {
            currentNote.set(directoryObject as Note);
        }
    }

    async function addNote(event: MouseEvent) {
        if (!(directoryObject instanceof Directory)) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        hideContextMenu();

        await directoryObject.CreateNote("New Note");

        directoryObject = (await ReadDirRecursive(directoryObject.path))!;

        expanded = true;
    }

    async function deleteNote() {

        let type = "Note";
        if (directoryObject instanceof Directory) {
            type = "Folder";
        }

        // are you sure?
        if (!confirm(`Are you sure you want to delete ${type} ${directoryObject.name}?`)) {
            return;
        }

        await directoryObject.delete();
    }

    async function addFolder(event: MouseEvent) {
        if (!(directoryObject instanceof Directory)) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        hideContextMenu();

        await directoryObject.CreateDirectory("New Folder")

        directoryObject = (await ReadDirRecursive(directoryObject.path))!;

        expanded = true;
    }

    function rename(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();

        hideContextMenu();

        const newName = prompt("Enter new name", directoryObject.name);

        if (newName) {
            directoryObject.rename(newName);
        }
    }

    function openContextMenuDir(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();

        showContextMenu({x: event.clientX, y: event.clientY}, [
            {
                label: "Add Note",
                action: addNote,
                availableCheck: () => true,
                icon: NoteIcon
            },
            {
                label: "Add Folder",
                action: addFolder,
                availableCheck: () => true,
                icon: Folder
            },
            {
                label: "Rename",
                action: rename,
                availableCheck: () => true,
                icon: Pen
            },
            {
                label: "Delete",
                action: deleteNote,
                availableCheck: () => true,
                icon: Trash
            }
        ]);
    }

    function openContextMenuFile(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();

        showContextMenu({x: event.clientX, y: event.clientY}, [
            {
                label: "Rename",
                action: rename,
                availableCheck: () => true,
                icon: Pen
            },
            {
                label: "Delete",
                action: deleteNote,
                availableCheck: () => true,
                icon: Trash
            }
        ]);
    }
</script>

<ul>
    <li class="menu">

        <a class="item" on:click={click} role="button" tabindex={0}>
            <div class="item-subwrapper">
                {#if directoryObject instanceof Directory}
                    {#if expanded}
                        <CaretDown/>
                    {:else}
                        <CaretRight/>
                    {/if}
                {/if}

                {#if directoryObject instanceof Directory}
                    <Folder size={size}/>
                {:else}
                    <NoteIcon size={size}/>
                {/if}
                {directoryObject.name}
            </div>

            <div class="item-subwrapper">
                {#if directoryObject instanceof Directory}
                    <div class="tooltip" data-tip="More options">
                        <button class="btn btn-xs btn-ghost btn-square" on:click={openContextMenuDir}>
                            <DotsThreeVertical size={innerSize}/>
                        </button>
                    </div>

                    <div class="tooltip" data-tip="Add note">
                        <button class="btn btn-xs btn-ghost btn-square" on:click={addNote}>
                            <Plus size={innerSize}/>
                        </button>
                    </div>
                {:else}
                    <div class="tooltip" data-tip="More options">
                        <button class="btn btn-xs btn-ghost btn-square" on:click={openContextMenuFile}>
                            <DotsThreeVertical size={innerSize}/>
                        </button>
                    </div>
                {/if}
            </div>
        </a>
    </li>

    {#if directoryObject instanceof Directory}
        <ul class="children menu">
            {#if expanded}
                {#if directoryObject.Directories.length === 0 && directoryObject.Files.length === 0}
                    <li>
                        <p>Empty</p>
                    </li>
                {:else}
                    {#each directoryObject.Directories as dir}
                        <svelte:self directoryObject={dir}/>
                    {/each}
                    {#each directoryObject.Files as file}
                        <svelte:self directoryObject={file}/>
                    {/each}
                {/if}
            {/if}
        </ul>
    {/if}
</ul>

<style>

    .item {
        display: flex;
        align-items: center;

        justify-content: space-between;
    }

    .item-subwrapper {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .menu {
        gap: 5px;
    }

    .children {
        padding: 0 0 0 1rem;
    }
</style>

