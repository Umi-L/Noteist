<script lang="ts">

    import {CaretDown, CaretRight, DotsThreeVertical, Folder, Note, Pen, Plus} from "phosphor-svelte";
    import {Directory, File} from "../filesystem";
    import {hideContextMenu, showContextMenu} from "../contextmenu";

    export let directoryObject: Directory | File;

    const size = 16;
    const innerSize = 16;

    let expanded = false;

    function click() {
        if (directoryObject instanceof Directory) {
            expanded = !expanded;
        }
    }

    function addNote(event: MouseEvent) {
        if (!(directoryObject instanceof Directory)) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        hideContextMenu();

        directoryObject.Files.push(new File("New Note", "", {} as Directory));

        directoryObject = directoryObject;

        expanded = true;
    }

    function addFolder(event: MouseEvent) {
        if (!(directoryObject instanceof Directory)) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        hideContextMenu();

        directoryObject.Directories.push(new Directory("New Folder", [], []));

        directoryObject = directoryObject;

        expanded = true;
    }

    function rename(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();

        hideContextMenu();

        const newName = prompt("Enter new name", directoryObject.name);

        if (newName) {
            directoryObject.name = newName;
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
                icon: Note
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
                    <Note size={size}/>
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

