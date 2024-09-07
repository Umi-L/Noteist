<script lang="ts">
    import {
        Folder,
        Gear,
        House,
        Note as NoteIcon,
        Plus,
    } from "phosphor-svelte";
    import {
        AppState,
        AppStateEnum,
        currentNote,
        filesystem,
        sidebarOpen,
    } from "../../globals";
    import { onMount } from "svelte";
    import {
        Directory,
        getNextAvailableDirName,
        getNextAvailableNoteName,
        InitBaseDir,
        ReadDirRecursive,
    } from "../../noteUtils";
    import DirectoryItem from "./DirectoryItem.svelte";
    import { writable, type Writable } from "svelte/store";
    import SidebarBase from "../Shared/SidebarBase.svelte";
    import NotePage from "./NotePage.svelte";

    const size = 16;

    let isOpen = true;
    sidebarOpen.subscribe((value) => (isOpen = value));

    function toggleSidebar() {
        sidebarOpen.update((value) => !value);
    }

    async function addNewFolder() {
        let nextName = await getNextAvailableDirName(
            "New Folder",
            $filesystem!.path
        );

        console.log("next name", nextName);

        $filesystem?.CreateDirectory(nextName);
    }

    async function addNewNote() {
        let nextName = await getNextAvailableNoteName(
            "New Note",
            $filesystem!.path
        );

        console.log("next name", nextName);

        $filesystem?.CreateNote(nextName);
    }

    function openSettings() {
        AppState.set(AppStateEnum.Settings);
    }

    function openHome() {
        currentNote.set(null);
    }
</script>

<SidebarBase title="Noteist">
    <ul class="menu p-0 option-list" slot="menu">
        <li>
            <a on:click={openHome}>
                <House {size} /> Home
            </a>
        </li>
        <li>
            <a on:click={openSettings}>
                <Gear {size} /> Settings
            </a>
        </li>
        <li>
            <a on:click={addNewNote}>
                <NoteIcon {size} /> New Note
            </a>
        </li>
        <li>
            <a on:click={addNewFolder}>
                <Folder {size} /> New Folder
            </a>
        </li>
    </ul>
    <div class="items" slot="content">
        <!-- Links -->
        <ul class="menu p-0 note-list">
            {#if $filesystem != undefined}
                {#key $filesystem}
                    {#each $filesystem.Directories as dir}
                        <DirectoryItem directoryObject={dir} />
                    {/each}
                    {#each $filesystem.Files as file}
                        <DirectoryItem directoryObject={file} />
                    {/each}
                {/key}
            {:else}
                <p>Loading...</p>
            {/if}
        </ul>
    </div>
</SidebarBase>

<style>
    @keyframes slideOut {
        0% {
            width: var(--sidebar-width);
            padding-left: 1rem;
            padding-right: 1rem;
        }

        99% {
            width: 0;
            border-right: 1px solid var(--muted-foreground);
            padding: 1rem 0;
        }

        100% {
            width: 0;
            border-right: none;
            padding: 0;
        }
    }

    @keyframes slideIn {
        0% {
            width: 0;
            border-right: none;
            padding: 0;
        }

        1% {
            width: 0;
            border-right: 1px solid var(--muted-foreground);
            padding: 1rem 0;
        }

        100% {
            width: var(--sidebar-width);
            padding-left: 1rem;
            padding-right: 1rem;
        }
    }

    .items {
        height: 100%;
        overflow-y: scroll;
    }

    .sidebar {
        --sidebar-width: 20rem;

        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 1rem;
        height: 100%;

        border-right: 1px solid var(--muted-foreground);

        transition: width 0.3s ease-out 0s;
        box-shadow: var(--shadow);

        overflow: hidden;
    }

    .note-list {
        overflow-y: auto;

        overflow-x: hidden;

        padding-right: 1rem;
    }

    .open {
        animation: slideIn 0.3s ease-out 0s forwards;
    }

    .close {
        overflow: hidden !important;
        animation: slideOut 0.3s ease-out 0s forwards;
    }

    .menu {
        gap: 5px;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        margin-left: 1rem;

        margin-top: var(--safe-area-inset-top);
    }

    .addFolder {
        width: 100%;
        display: flex;

        margin-top: 5rem;
    }

    h2 {
        margin: 0;
        font-size: 1.2rem;
    }
</style>
