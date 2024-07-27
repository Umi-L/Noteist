<script lang="ts">
    import { writable } from "svelte/store";
    import SettingsSidebar from "./SettingsSidebar.svelte";
    import ToggleSetting from "./ToggleSetting.svelte";
    import DropdownSetting from "./DropdownSetting.svelte";
    import { sidebarOpen } from "../../globals";
    import { List } from "phosphor-svelte";

    let settingsPane: HTMLDivElement;

    function scrollTo(name: string) {
        const element = settingsPane.querySelector(`#${name}`);

        if (!element) {
            return;
        }

        element.scrollIntoView({ behavior: "smooth" });
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
        <ToggleSetting name="Test Setting" data={writable(false)} />
        <ToggleSetting name="Test Setting" data={writable(false)} />
        <ToggleSetting name="Test Setting" data={writable(false)} />
        <ToggleSetting name="Test Setting" data={writable(false)} />
        <ToggleSetting name="Test Setting" data={writable(false)} />
        <ToggleSetting name="Test Setting" data={writable(false)} />
        <ToggleSetting name="Test Setting" data={writable(false)} />
        <DropdownSetting name="Test Setting" data={writable("Hello")}>
            <option value="Hello">Hello</option>
            <option value="World">World</option>
        </DropdownSetting>

        <h2 id="Account">Account</h2>
        <div class="divider"></div>
        <ToggleSetting name="Test Setting" data={writable(false)} />
        <ToggleSetting name="Test Setting" data={writable(false)} />
        <ToggleSetting name="Test Setting" data={writable(false)} />
        <ToggleSetting name="Test Setting" data={writable(false)} />
        <ToggleSetting name="Test Setting" data={writable(false)} />
        <ToggleSetting name="Test Setting" data={writable(false)} />
        <ToggleSetting name="Test Setting" data={writable(false)} />
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

        padding: 2rem;

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
