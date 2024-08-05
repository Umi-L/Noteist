<script lang="ts">
    import { writable } from "svelte/store";
    import SettingsSidebar from "./SettingsSidebar.svelte";
    import ToggleSetting from "./ToggleSetting.svelte";
    import DropdownSetting from "./DropdownSetting.svelte";
    import { sidebarOpen } from "../../globals";
    import { List } from "phosphor-svelte";
    import { onMount } from "svelte";
    import { themeChange } from "theme-change";

    let settingsPane: HTMLDivElement;

    function scrollTo(name: string) {
        const element = settingsPane.querySelector(`#${name}`);

        if (!element) {
            return;
        }

        element.scrollIntoView({ behavior: "smooth" });
    }

    let themes = [
        "default",
        "dark",
        "light",
        "bumblebee",
        "emerald",
        "corporate",
        "synthwave",
        "retro",
        "cyberpunk",
        "valentine",
        "halloween",
        "garden",
        "forest",
        "aqua",
        "lofi",
        "pastel",
        "fantasy",
        "wireframe",
        "black",
        "luxury",
        "dracula",
        "cmyk",
        "autumn",
        "business",
        "acid",
        "lemonade",
        "night",
        "coffee",
        "winter",
        "dim",
        "nord",
        "sunset",
    ];

    onMount(async () => {
        themeChange(false);
    });

    function asTitleCase(str: string) {
        return str
            .split(" ")
            .map((word) => word[0].toUpperCase() + word.slice(1))
            .join(" ");
    }
</script>

<div class="wrapper">
    <SettingsSidebar>
        <li>
            <a
                on:click={() => {
                    scrollTo("General");
                }}>General</a
            >
        </li>
        <li>
            <a
                on:click={() => {
                    scrollTo("Appearance");
                }}>Appearance</a
            >
        </li>
        <li>
            <a
                on:click={() => {
                    scrollTo("Account");
                }}>Account</a
            >
        </li>
    </SettingsSidebar>

    <div class="settings" bind:this={settingsPane}>
        <button
            class="btn btn-square btn-ghost top-left btn-sm overlay"
            class:btn-hidden={$sidebarOpen}
            class:btn-shown={!$sidebarOpen}
            on:click={() => {
                sidebarOpen.update((value) => !value);
            }}
        >
            <List size={16} />
        </button>

        <h2 id="General">General</h2>
        <div class="divider"></div>
        <DropdownSetting name="Test Setting" data={writable("Hello")}>
            <option value="Hello">Hello</option>
            <option value="World">World</option>
        </DropdownSetting>

        <h2 id="Appearance">Appearance</h2>
        <div class="divider"></div>
        <DropdownSetting
            name="Theme"
            data={writable("Hello")}
            themePicker={true}
        >
            {#each themes as theme}
                <option value={theme}>{asTitleCase(theme)}</option>
            {/each}
        </DropdownSetting>

        <h2 id="Account">Account</h2>
        <div class="divider"></div>
        <DropdownSetting name="Test Setting" data={writable("Hello")}>
            <option value="Hello">Hello</option>
            <option value="World">World</option>
        </DropdownSetting>
    </div>
</div>

<style>
    .wrapper {
        width: 100%;
        height: 100%;

        display: grid;
        grid-template-columns: min-content auto;
    }

    .settings {
        width: 100%;
        height: 100%;

        padding: 3rem;

        overflow-y: scroll;

        position: relative;
    }

    h2 {
        margin-top: 1.5rem;
    }

    .top-left {
        position: fixed;
        top: calc(1rem + var(--safe-area-inset-top));
        left: 1rem;
    }

    .btn {
        transition: opacity 0.3s;
    }

    .btn-shown {
        opacity: 1;
    }

    .btn-hidden {
        opacity: 0;

        visibility: hidden;
    }
</style>
