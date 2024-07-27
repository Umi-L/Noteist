<script lang="ts">

    import type {Writable} from "svelte/store";

    export let buttonType = "btn-primary";
    export let store: Writable<boolean>;

    let storeValue = false;
    store.subscribe((value) => {
        storeValue = value
    });

    function click(event: MouseEvent) {
        store.update((value) => {
            return !value;
        });

        event.preventDefault();
    }

</script>

<button class={"btn btn-sm btn-square " + buttonType} on:click={click} class:btn-outline={!storeValue}>
    <slot></slot>
</button>


<style>

</style>