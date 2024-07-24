<script lang="ts">
    import {
        ArrowLineRight,
        CaretRight,
        Folder,
        Hamburger,
        LineSegments,
        List,
        Note,
        Plus,
    } from "phosphor-svelte";
    import {sidebarOpen} from "../globals";
    import {onMount} from "svelte";
    import {Directory, InitBaseDir, ReadDirRecursive} from "../noteUtils";
    import DirectoryItem from "./DirectoryItem.svelte";
    import {writable, type Writable} from "svelte/store";

    const size = 16;

    let isOpen = true;
    sidebarOpen.subscribe((value) => (isOpen = value));

    function toggleSidebar() {
        sidebarOpen.update((value) => !value);
    }

    let filesystem: Directory | undefined;
    let filesystemWritable: Writable<Directory | undefined> = writable(undefined);

    filesystemWritable.subscribe((value) => filesystem = value);

    onMount(async () => {
        await InitBaseDir();

        filesystemWritable.set(await ReadDirRecursive("notes", null));
        filesystem!.selfWritable = filesystemWritable as any;

        console.log("file system", filesystem);
    });

    function addNewFolder() {
        filesystem?.CreateDirectory("New Directory");
    }
</script>

<class class="sidebar" class:open={isOpen} class:close={!isOpen}>
    <div>
        <div class="header">
            <h2 class="font-bold">Writeover</h2>

            <button
                    class="btn btn-square btn-ghost btn-sm"
                    on:click={toggleSidebar}
            >
                <List {size}/>
            </button>
        </div>

        <div class="divider"></div>

        <!-- Links -->
        <ul class="menu p-0">
            {#if filesystem}
                {#key filesystem}
                    {#each filesystem.Directories as dir (dir.path)}
                        <DirectoryItem directoryObjectWritable={writable(dir)}/>
                    {/each}
                    {#each filesystem.Files as file (file.HTMLPath)}
                        <DirectoryItem directoryObjectWritable={writable(file)}/>
                    {/each}
                {/key}
            {:else}
                <p>Loading...</p>
            {/if}
        </ul>
    </div>
    <button class="addFolder btn btn-ghost" on:click={addNewFolder}>
        <Plus/>
    </button>
</class>

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

        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
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

    .addFolder {
        width: 100%;
        display: flex;
    }

    h2 {
        margin: 0;
        font-size: 1.5rem;
    }
</style>
