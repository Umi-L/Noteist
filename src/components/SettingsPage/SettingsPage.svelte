<script lang="ts">
    import { writable } from "svelte/store";
    import SettingsSidebar from "./SettingsSidebar.svelte";
    import ToggleSetting from "./ToggleSetting.svelte";
    import DropdownSetting from "./DropdownSetting.svelte";

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
    }

    h2 {
        margin-top: 1.5rem;
    }
</style>
