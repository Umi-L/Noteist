<script>import "../app.css";
import {TextB} from "phosphor-svelte";
import DrawingOverlay from "./DrawingOverlay.svelte";
import Editor from "./Editor.svelte";
import Toolbar from "./Toolbar.svelte";
import Sidebar from "./Sidebar.svelte";


if ("virtualKeyboard" in navigator) {
    navigator.virtualKeyboard.overlaysContent = true;
}

</script>

<main class="main">

    <Sidebar/>

    <div class="note">
            <DrawingOverlay/>
            <Editor/>
            <Toolbar/>
    </div>
</main>

<style>
    .main {
        width: 100%;
        height: 100%;

        display: grid;
        grid-template-columns: min-content auto;
    }

    .note{
        width: 100%;
        height: 100%;

        overflow: hidden;

        position: relative;
    }


</style>