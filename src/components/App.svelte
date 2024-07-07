<script>import "../app.css";
import {List, TextB} from "phosphor-svelte";
import DrawingOverlay from "./DrawingOverlay.svelte";
import Editor from "./Editor.svelte";
import Toolbar from "./Toolbar.svelte";
import Sidebar from "./Sidebar.svelte";
import {sidebarOpen} from "../globals";


if ("virtualKeyboard" in navigator) {
    navigator.virtualKeyboard.overlaysContent = true;
}

let isSidebarOpen = false;
sidebarOpen.subscribe(value => {
    isSidebarOpen = value;
});
</script>

<main class="main">

    <Sidebar/>

    <div class="note">

        <button class="btn btn-square btn-ghost top-left btn-sm overlay" class:btn-hidden={isSidebarOpen} class:btn-shown={!isSidebarOpen}
                on:click={()=>{sidebarOpen.update(value => !value)}}>
            <List size={16}/>
        </button>

        <DrawingOverlay/>
        <Toolbar/>

        <div class="inner-note">
            <Editor/>
        </div>
    </div>
</main>

<style>
    .main {
        width: 100%;
        height: 100%;

        display: grid;
        grid-template-columns: min-content auto;
    }

    .note {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        width: 100%;
        height: 100%;

        overflow-y: auto;

        position: relative;
    }

    .inner-note {
        width: calc(100% - 3rem * 2);
        height: 100%;
    }

    .top-left {
        position: absolute;
        top: 1rem;
        left: 1rem;
    }

    .btn{
        transition: opacity 0.3s;
    }

    .btn-shown{
        opacity: 1;
    }

    .btn-hidden{
        opacity: 0;

        visibility: hidden;
    }

    .overlay{
        z-index: 1000;
    }


</style>