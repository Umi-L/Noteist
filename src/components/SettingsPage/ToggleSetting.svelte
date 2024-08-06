<script lang="ts">
    import type { Writable } from "svelte/store";
    import SettingBase from "./SettingBase.svelte";

    export let name: string;
    export let data: Writable<boolean>;
    export let disabled: boolean = false;

    let checkbox: HTMLInputElement;
</script>

<SettingBase {name} {disabled}>
    <input type="checkbox" class="toggle" bind:checked={$data} {disabled} />
</SettingBase>
