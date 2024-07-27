<script lang="ts">
    import { onMount } from "svelte";
    import {
        type IMenuOption,
        setHideContextMenu,
        setShowContextMenu,
    } from "../../contextmenu";
    import type { Point } from "../../Point";

    let menu: HTMLUListElement;
    let shown = false;
    let menuOptions: Array<IMenuOption> = [];

    const size = 16;

    function _showContextMenu(pos: Point, options: Array<IMenuOption>) {
        menu.style.left = `${pos.x}px`;
        menu.style.top = `${pos.y}px`;

        menuOptions = options;
        shown = true;
    }

    function _hideContextMenu() {
        shown = false;
    }

    onMount(() => {
        setShowContextMenu(_showContextMenu);
        setHideContextMenu(_hideContextMenu);

        window.addEventListener("click", () => {
            _hideContextMenu();
        });
    });
</script>

<ul class="menu rounded-box w-56" bind:this={menu} class:hidden={!shown}>
    {#each menuOptions as option, i}
        <li
            class="rounded-box w-full"
            class:disabled={!option.availableCheck()}
        >
            <a
                class="w-full"
                on:click={option.action}
                role="button"
                tabindex={i}
            >
                {#if option.icon}
                    <svelte:component this={option.icon} {size} />
                {/if}
                {option.label}
            </a>
        </li>
    {/each}
</ul>

<style>
    .menu {
        position: fixed;

        background-color: var(--muted);
        border: 1px solid var(--muted-foreground);

        z-index: 10000;
    }

    .hidden {
        display: none;
    }
</style>
