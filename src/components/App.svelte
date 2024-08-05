<script lang="ts">
    import "../app.css";
    import { AppState, AppStateEnum } from "../globals";
    import SettingsPage from "./SettingsPage/SettingsPage.svelte";
    import NotePage from "./NotePage/NotePage.svelte";
    import { themeChange } from "theme-change";
    import { onMount } from "svelte";
    import Toasts from "./Shared/Toasts.svelte";

    if ("virtualKeyboard" in navigator) {
        //@ts-ignore
        navigator.virtualKeyboard.overlaysContent = true;
    }

    onMount(() => {
        themeChange(false);
        // 👆 false parameter is required for svelte
    });
</script>

<main class="main">
    <Toasts />
    {#if $AppState == AppStateEnum.App}
        <NotePage />
    {:else if $AppState == AppStateEnum.Settings}
        <SettingsPage />
    {/if}
</main>

<style>
    .main {
        width: 100%;
        height: 100%;
    }
</style>
