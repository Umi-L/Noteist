<script lang="ts">
    import {
        CaretDown,
        CaretRight,
        DotsThreeVertical,
        Folder,
        Note as NoteIcon,
        Pen,
        Plus,
        Trash,
    } from "phosphor-svelte";
    import { Directory, Note, ReadDirRecursive } from "../../noteUtils";
    import { hideContextMenu, showContextMenu } from "../../contextmenu";
    import { currentNote, openDirectories } from "../../globals";
    import { writable, type Writable } from "svelte/store";
    import { afterUpdate, beforeUpdate, onMount } from "svelte";

    export let directoryObject: Directory | Note;

    const size = 16;
    const innerSize = 16;

    function click() {
        if (directoryObject instanceof Directory) {
            setExpanded(!getExpanded());
        } else {
            currentNote.set(directoryObject as Note);
        }
    }

    function setExpanded(isOpen: boolean) {
        if (directoryObject instanceof Directory) {
            openDirectories.update((value) => {
                if (isOpen) {
                    value.add(directoryObject.path);
                } else {
                    value.delete(directoryObject.path);
                }

                return value;
            });
        }
    }

    function getExpanded() {
        if (directoryObject instanceof Directory) {
            return $openDirectories.has(directoryObject.path);
        }

        return false;
    }

    async function addNote(event: MouseEvent) {
        if (!(directoryObject instanceof Directory)) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        hideContextMenu();

        await directoryObject.CreateNote("New Note");

        setExpanded(true);
    }

    async function deleteNote() {
        let type = "Note";
        if (directoryObject instanceof Directory) {
            type = "Folder";
        }

        // are you sure?
        if (
            !confirm(
                `Are you sure you want to delete ${type} ${directoryObject.Name}?`
            )
        ) {
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

        await directoryObject.CreateDirectory("New Folder");

        setExpanded(true);
    }

    async function rename(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();

        hideContextMenu();

        const newName = prompt("Enter new name", directoryObject.Name);

        if (newName) {
            await directoryObject.rename(newName);
        }
    }

    function openContextMenuDir(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();

        showContextMenu({ x: event.clientX, y: event.clientY }, [
            {
                label: "Add Note",
                action: addNote,
                availableCheck: () => true,
                icon: NoteIcon,
            },
            {
                label: "Add Folder",
                action: addFolder,
                availableCheck: () => true,
                icon: Folder,
            },
            {
                label: "Rename",
                action: rename,
                availableCheck: () => true,
                icon: Pen,
            },
            {
                label: "Delete",
                action: deleteNote,
                availableCheck: () => true,
                icon: Trash,
            },
        ]);
    }

    function openContextMenuFile(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();

        showContextMenu({ x: event.clientX, y: event.clientY }, [
            {
                label: "Rename",
                action: rename,
                availableCheck: () => true,
                icon: Pen,
            },
            {
                label: "Delete",
                action: deleteNote,
                availableCheck: () => true,
                icon: Trash,
            },
        ]);
    }
</script>

<ul>
    <li class="list-item">
        <a class="item" on:click={click} role="button" tabindex={0}>
            <div class="item-subwrapper">
                {#if directoryObject instanceof Directory}
                    {#if $openDirectories.has(directoryObject.path)}
                        <CaretDown />
                    {:else}
                        <CaretRight />
                    {/if}
                {/if}

                {#if directoryObject instanceof Directory}
                    <Folder {size} />
                {:else}
                    <NoteIcon {size} />
                {/if}
                {directoryObject.Name}
            </div>

            <div class="item-subwrapper">
                {#if directoryObject instanceof Directory}
                    <div class="tooltip" data-tip="More options">
                        <button
                            class="btn btn-xs btn-ghost btn-square"
                            on:click={openContextMenuDir}
                        >
                            <DotsThreeVertical size={innerSize} />
                        </button>
                    </div>

                    <div class="tooltip" data-tip="Add note">
                        <button
                            class="btn btn-xs btn-ghost btn-square"
                            on:click={addNote}
                        >
                            <Plus size={innerSize} />
                        </button>
                    </div>
                {:else}
                    <div class="tooltip" data-tip="More options">
                        <button
                            class="btn btn-xs btn-ghost btn-square"
                            on:click={openContextMenuFile}
                        >
                            <DotsThreeVertical size={innerSize} />
                        </button>
                    </div>
                {/if}
            </div>
        </a>
    </li>

    {#if directoryObject instanceof Directory}
        <ul class="children menu">
            <div class="open-indicator-wrapper">
                <div class="open-indicator"></div>
            </div>

            {#if $openDirectories.has(directoryObject.path)}
                {#if directoryObject.Directories.length === 0 && directoryObject.Files.length === 0}
                    <li>
                        <p>Empty</p>
                    </li>
                {:else}
                    {#key directoryObject}
                        {#each directoryObject.Directories as dir (dir.path)}
                            <svelte:self directoryObject={dir} />
                        {/each}
                        {#each directoryObject.Files as file (file.HTMLPath)}
                            <svelte:self directoryObject={file} />
                        {/each}
                    {/key}
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
        gap: 1px;
    }

    .list-item {
        margin-bottom: 5px;
    }

    .children {
        padding: 0 0 0 1rem;

        position: relative;
    }

    .open-indicator-wrapper {
        position: absolute;
        top: 0;
        left: 0.8rem;

        height: 100%;

        display: flex;
        align-items: center;
    }

    .open-indicator {
        height: 80%;
        width: 1px;

        border-right: 1px dashed var(--double-muted-foreground);
    }
</style>
