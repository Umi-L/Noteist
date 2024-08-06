<script lang="ts">
    import type { Writable } from "svelte/store";
    import SettingBase from "./SettingBase.svelte";

    export let name: string;
    export let data: Writable<number>;
    export let disabled: boolean = false;
</script>

<SettingBase {name} {disabled}>
    <input
        type="text"
        class="input input-bordered w-full max-w-xs"
        bind:value={$data}
        on:change={() => {
            if (isNaN(Number($data))) {
                $data = 0;
            }
        }}
        {disabled}
    />
</SettingBase>
