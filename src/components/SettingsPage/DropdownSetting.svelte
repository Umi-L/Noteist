<script lang="ts">
    import type { Writable } from "svelte/store";
    import SettingBase from "./SettingBase.svelte";

    export let name: string;
    export let placeholder: string | undefined = undefined;
    export let data: Writable<string> | Writable<string | undefined>;
    export let disabled: boolean = false;
</script>

<SettingBase {name} {disabled}>
    <select class="select w-full max-w-xs" bind:value={$data} {disabled}>
        {#if placeholder}
            <option disabled selected value={undefined}>{placeholder}</option>
        {/if}
        <slot></slot>
    </select>
</SettingBase>
