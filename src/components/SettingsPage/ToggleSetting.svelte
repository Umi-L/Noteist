<script lang="ts">
    import type { Writable } from "svelte/store";
    import SettingBase from "./SettingBase.svelte";

    export let name: string;
    export let data: Writable<boolean>;

    let checkbox: HTMLInputElement;
</script>

<SettingBase {name}>
    <input type="checkbox" class="toggle" bind:checked={$data} />
</SettingBase>
