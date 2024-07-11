<script lang="ts">

    import {CaretDown, CaretRight, DotsThreeVertical, Folder, Note, Plus} from "phosphor-svelte";
    import {Directory, File} from "../filesystem";

    export let directoryObject: Directory | File;

    const size = 16;
    const innerSize = 12;

    let expanded = false;

    function click() {
        if (directoryObject instanceof Directory) {
            expanded = !expanded;
        }
    }

    function addNote(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();

        directoryObject.Files.push(new File("New Note"));

        directoryObject = directoryObject;

        expanded = true;
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
                    <button class="btn btn-xs btn-ghost btn-square">
                        <DotsThreeVertical size={innerSize}/>
                    </button>

                    <button class="btn btn-xs btn-ghost btn-square" on:click={addNote}>
                        <Plus size={innerSize}/>
                    </button>
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

