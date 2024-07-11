<script lang="ts">

    import {ArrowLineRight, CaretRight, Folder, Hamburger, LineSegments, List, Note} from "phosphor-svelte";
    import {sidebarOpen} from "../globals";
    import {onMount} from "svelte";
    import {Directory, InitBaseDir, ReadDirRecursive} from "../filesystem";
    import DirectoryItem from "./DirectoryItem.svelte";

    const size = 16;

    let isOpen = true;
    sidebarOpen.subscribe(value => isOpen = value);

    function toggleSidebar() {
        sidebarOpen.update(value => !value);
    }

    let fs: Directory | undefined;

    onMount(async () => {
        await InitBaseDir();

        fs = await ReadDirRecursive("");

        console.log("file system", fs);
    })
</script>

<div class="sidebar" class:open={isOpen} class:close={!isOpen}>
    <div class="header">
        <h2 class="font-bold">Writeover</h2>

        <button class="btn btn-square btn-ghost btn-sm" on:click={toggleSidebar}>
            <List size={size}/>
        </button>
    </div>

    <div class="divider"></div>

    <!-- Links -->
    <ul class="menu p-0">
        {#if fs}
            {#each fs.Directories as dir}
                <DirectoryItem directoryObject={dir}/>
            {/each}
            {#each fs.Files as file}
                <DirectoryItem directoryObject={file}/>
            {/each}
        {:else}
            <p>Loading...</p>
        {/if}
    </ul>
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

    .sidebar {
        --sidebar-width: 20rem;

        background-color: var(--color-bg);
        color: var(--color-text);
        padding: 1rem;
        height: 100%;
        overflow-y: auto;

        border-right: 1px solid var(--muted-foreground);

        transition: width 0.3s ease-out 0s;
        box-shadow: var(--shadow);
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

    h2 {
        margin: 0;
        font-size: 1.5rem;
    }
</style>