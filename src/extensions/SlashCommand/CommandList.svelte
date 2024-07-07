<script lang="ts">
    import type {CommandItemProps} from './slash-command.js';
    import {anyify} from "./utils";

    export let items: CommandItemProps[] = [];
    export let command: any;
    export let editor: any;
    export let range: any;

    let selectedIndex = 0;

    const selectItem = (index: number) => {
        const item = items[index];
        // va.track('Slash Command Used', {
        // 	command: item.title
        // });
        if (item) {
            command(item);
        }
    };

    const navigationKeys = ['ArrowUp', 'ArrowDown', 'Enter'];
    const onKeyDown = (e: KeyboardEvent) => {
        console.log(e.key);
        if (!navigationKeys.includes(e.key)) return;
        e.preventDefault();
        if (e.key === 'ArrowUp') {
            selectedIndex = (selectedIndex + items.length - 1) % items.length;
        } else if (e.key === 'ArrowDown') {
            selectedIndex = (selectedIndex + 1) % items.length;
        } else if (e.key === 'Enter') {
            selectItem(selectedIndex);
        }

        const item = container.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement;
        if (item)
            item.scrollIntoView({
                block: 'nearest'
            });
    };

    let container: HTMLElement;
</script>

<svelte:window on:keydown={onKeyDown}/>

{#if items.length > 0}
    <div
            id="slash-command"
            class="z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border px-1 py-2 shadow-md transition-all"
            bind:this={container}
    >
        {#each items as item, index (index)}
            <button
                    class="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm scroll-my-2 item
				{index === selectedIndex ? 'selected' : ''}"
                    on:click={() => selectItem(index)}
                    data-index={index}
                    type="button"
            >
                <div
                        class="flex h-10 w-10 items-center justify-center rounded-md icon-wrapper"
                >
                    {#if item.icon}
                        <svelte:component this={anyify(item.icon)} size="18"/>
                    {/if}
                </div>
                <div>
                    <p class="font-medium header">{item.title}</p>
                    <p class="text-xs description">{item.description}</p>
                </div>
            </button>
        {/each}
    </div>
{/if}

<style>
    #slash-command {
        background-color: var(--muted);

        border-color: var(--muted-foreground);
    }

    .item {
        background-color: var(--muted);
    }

    .item:hover {
        background-color: var(--double-muted);
    }

    .icon-wrapper {
        background-color: var(--foreground);

        color: var(--muted);

        border-color: var(--muted-foreground);
    }

    .header {
        color: var(--foreground);
    }

    .description {
        color: var(--muted-foreground);
    }

    .selected {
        background-color: var(--double-muted);
    }
</style>