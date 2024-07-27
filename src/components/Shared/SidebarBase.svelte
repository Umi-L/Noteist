<script lang="ts">
    import {
        ArrowLineRight,
        CaretRight,
        Folder,
        Gear,
        Hamburger,
        LineSegments,
        List,
        Note,
        Plus,
    } from "phosphor-svelte";
    import {
        AppState,
        AppStateEnum,
        filesystem,
        sidebarOpen,
    } from "../../globals";
    import { onMount } from "svelte";
    import { Directory, InitBaseDir, ReadDirRecursive } from "../../noteUtils";

    export let title: string;

    const size = 16;

    function toggleSidebar() {
        sidebarOpen.update((value) => !value);
    }

    onMount(async () => {
        await InitBaseDir();

        filesystem.set((await ReadDirRecursive("notes", null))!);

        console.log("file system", $filesystem);
    });

    function addNewFolder() {
        $filesystem?.CreateDirectory("New Directory");
    }

    function openSettings() {
        AppState.set(AppStateEnum.Settings);
    }
</script>

<div class="sidebar" class:open={$sidebarOpen} class:close={!$sidebarOpen}>
    <div class="header">
        <h2 class="font-bold">{title}</h2>

        <div>
            <button
                class="btn btn-square btn-ghost btn-sm"
                on:click={openSettings}
            >
                <Gear {size} />
            </button>
            <button
                class="btn btn-square btn-ghost btn-sm"
                on:click={toggleSidebar}
            >
                <List {size} />
            </button>
        </div>
    </div>

    <div class="divider"></div>

    <slot></slot>
</div>

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
        background-color: var(--color-bg);
        color: var(--color-text);
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
