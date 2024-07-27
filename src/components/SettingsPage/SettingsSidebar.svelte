<script lang="ts">
    import { House } from "phosphor-svelte";
    import SidebarBase from "../Shared/SidebarBase.svelte";
    import { AppState, AppStateEnum } from "../../globals";

    let size = 16;

    function openSettings() {
        AppState.set(AppStateEnum.Settings);
    }

    function openNotes() {
        AppState.set(AppStateEnum.App);
    }
</script>

<SidebarBase title="Noteist">
    <ul class="menu p-0 option-list" slot="menu">
        <li>
            <a on:click={openNotes}>
                <House {size} /> Back to Notes
            </a>
        </li>
    </ul>

    <ul class="menu p-0 note-list" slot="content">
        <slot></slot>
    </ul>
</SidebarBase>

<style>
</style>
