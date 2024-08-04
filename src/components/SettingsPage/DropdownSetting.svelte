<script lang="ts">
    import type { Writable } from "svelte/store";
    import SettingBase from "./SettingBase.svelte";

    export let name: string;
    export let placeholder: string | undefined = undefined;
    export let data: Writable<string> | Writable<string | undefined>;
    export let themePicker: boolean = false;
</script>

<SettingBase {name}>
    <select
        class="select w-full max-w-xs"
        bind:value={$data}
        data-choose-theme={themePicker}
    >
        {#if placeholder}
            <option disabled selected value={undefined}>{placeholder}</option>
        {/if}
        <slot></slot>
    </select>
</SettingBase>
