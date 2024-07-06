<script lang="ts">

    import type {Writable} from "svelte/store";

    export let buttonType = "btn-primary";
    export let store: Writable<any>;
    export let value: any;
    export let typeOnlyCheck: boolean = false;

    let storeValue = false;
    store.subscribe((value) => {
        storeValue = value
    });

    function click(event: MouseEvent) {
        store.update((_) => {
            return value;
        });
    }

</script>

<button class={"btn btn-sm btn-square " + buttonType} on:click={click} class:btn-outline={typeOnlyCheck ? ((storeValue.constructor.name != value.constructor.name)) : (storeValue != value)}>
    <slot></slot>
</button>


<style>

</style>