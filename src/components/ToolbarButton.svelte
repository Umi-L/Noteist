<script lang="ts">

    export let buttonType = "btn-primary";
    export let pressedCallback: () => void;

    function click(event: MouseEvent) {
        pressedCallback();
    }

</script>

<button class={"btn btn-sm btn-square btn-outline " + buttonType} on:click={click}>
    <slot></slot>
</button>


<style>

</style>