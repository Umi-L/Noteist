<script lang="ts">
    export let buttonType = "btn-primary";
    export let pressedCallback: () => void;
    export let noBaseClasses = false;

    function click(event: MouseEvent) {
        pressedCallback();

        event.preventDefault();
    }
</script>

<button
    class={(noBaseClasses ? "" : "btn btn-sm btn-square btn-outline ") +
        buttonType}
    on:click={click}
>
    <slot></slot>
</button>

<style>
</style>
