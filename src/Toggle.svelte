<script lang="ts">

    import type {Writable} from "svelte/store";

    export let buttonType = "btn-primary";
    export let store: Writable<boolean>;

    let storeValue = false;
    store.subscribe((value) => {
        storeValue = value
    });

</script>

<button class={"btn btn-sm btn-square " + buttonType} on:click={()=>{store.update((value)=>{return !value})}}
        class:btn-outline={!storeValue}>
    <slot></slot>
</button>


<style>

</style>