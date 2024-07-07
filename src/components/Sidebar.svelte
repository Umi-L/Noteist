<script lang="ts">

    import {Hamburger, LineSegments, List, Note} from "phosphor-svelte";
    import {sidebarOpen} from "../globals";

    const size = 16;

    let isOpen = true;
    sidebarOpen.subscribe(value => isOpen = value);

    function toggleSidebar() {
        sidebarOpen.update(value => !value);
    }
</script>

<div class="sidebar" class:open={isOpen} class:close={!isOpen}>
    <div class="header">
        <h2 class="font-bold">DrawNotes</h2>

        <button class="btn btn-square btn-ghost btn-sm" on:click={toggleSidebar}>
            <List size={size}/>
        </button>
    </div>

    <div class="divider"></div>

    <!-- Links -->
    <ul class="menu p-0">
        <li>
            <a>
                <Note size={size}/>
                Home
            </a>
        </li>
        <li>
            <a>
                <Note size={size}/>
                Dashboard
            </a>
        </li>
        <li>
            <a>
                <Note size={size}/>
                Projects
            </a>
        </li>
        <li>
            <a>
                <Note size={size}/>
                Tasks
            </a>
        </li>
        <li>
            <a>
                <Note size={size}/>
                Reporting
            </a>
        </li>
        <li>
            <a>
                <Note size={size}/>
                Users
            </a>
        </li>
    </ul>
</div>

<style>

    @keyframes slideOut {

        0% {
            width: 15rem;
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
            width: 15rem;
            padding-left: 1rem;
            padding-right: 1rem;
        }

    }

    .sidebar {

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
    }
</style>