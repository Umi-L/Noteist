<script lang="ts">
    import {getContext} from "svelte";
    import type {Writable} from "svelte/store";
    import {AnchorSide} from "./AnchorSide";

    export let wrapper;
    export let isOpen;
    export let isDialog;

    let isVertical: Writable<boolean> = getContext("vertical")
    let vertical = false;
    isVertical.subscribe(value => {
        vertical = value;
    });

    let colorPickerAnchorSide: Writable<AnchorSide> = getContext("colorPickerAnchorSide");
    let openingDirection: AnchorSide = AnchorSide.TopRight;
    colorPickerAnchorSide.subscribe(value => {
        openingDirection = value;
    });
</script>

<div
        bind:this={wrapper}
        class="wrapper"
        class:is-open={isOpen}
        role={isDialog ? 'dialog' : undefined}
        aria-label="color picker"
        class:top-justified={openingDirection === AnchorSide.Top}
        class:bottom-justified={openingDirection === AnchorSide.Bottom}
        class:left-justified={openingDirection === AnchorSide.Left}
        class:right-justified={openingDirection === AnchorSide.Right}
        class:vertical={vertical}
>
    <slot />
</div>

<style>
    div {
        padding: 8px;
        background-color: var(--cp-bg-color, white);
        margin: 0 10px 10px;
        border: 1px solid var(--cp-border-color, black);
        border-radius: 12px;
        display: none;
        width: max-content;
    }
    .is-open {
        display: inline-block;
    }
    [role='dialog'] {
        position: absolute;
        z-index: var(--picker-z-index, 2);

        --spacer-distance: 20px;
    }

    .top-justified {
        top: calc(var(--input-size, 25px) + var(--spacer-distance));
        right: 0px;
    }
    .bottom-justified {
        bottom: calc(var(--input-size, 25px) + var(--spacer-distance));
        right: 0px;
    }
    .left-justified {
        bottom: var(--spacer-distance);
        right: 0px;
    }
    .right-justified {
        right: 0px;
        top: var(--spacer-distance);
    }

    .vertical {
        transform: rotate(-90deg);
    }
</style>
