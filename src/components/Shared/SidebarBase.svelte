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
        House,
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

    let hasOpened = false;

    let sidebar: HTMLDivElement;

    function toggleSidebar() {
        sidebarOpen.update((value) => !value);
    }

    onMount(async () => {
        await InitBaseDir();

        filesystem.set((await ReadDirRecursive("notes", null))!);

        console.log("file system", $filesystem);
    });

    onMount(() => {
        // get css variable --animation-time from sidebar
        const animationTime =
            getComputedStyle(sidebar).getPropertyValue("--animation-time");

        // set hasOpened to true after the animation time
        setTimeout(
            () => {
                hasOpened = true;
            },
            parseFloat(animationTime) * 1000
        );
    });
</script>

<div
    class="sidebar"
    class:open={$sidebarOpen}
    class:close={!$sidebarOpen}
    class:dont-animate={!hasOpened}
    bind:this={sidebar}
>
    <div class="header">
        <h2 class="font-bold">{title}</h2>

        <div>
            <button
                class="btn btn-square btn-ghost btn-sm"
                on:click={toggleSidebar}
            >
                <List {size} />
            </button>
        </div>
    </div>

    <div class="divider"></div>

    <slot name="menu" />

    <div class="divider"></div>

    <slot name="content" />
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
        background-color: var(--background);
        color: var(--foreground);
        padding: 1rem;
        height: 100%;

        border-right: 1px solid var(--border);

        transition: width 0.3s ease-out 0s;
        box-shadow: var(--shadow);

        overflow: hidden;

        --animation-time: 0.3s;
    }

    .dont-animate {
        animation-delay: calc(var(--animation-time) * -1) !important;
    }

    .note-list {
        overflow-y: auto;

        overflow-x: hidden;
    }

    .open {
        animation: slideIn var(--animation-time) ease-out 0s forwards;
    }

    .close {
        overflow: hidden !important;
        animation: slideOut var(--animation-time) ease-out 0s forwards;
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
