<script>import "./app.css";
import {TextB} from "phosphor-svelte";
import DrawingOverlay from "./DrawingOverlay.svelte";
import Editor from "./Editor.svelte";
import Toolbar from "./Toolbar.svelte";
</script>

<main>
    <DrawingOverlay />
    <Editor />
    <Toolbar />

</main>

<style>
    .logo {
        height: 6em;
        padding: 1.5em;
        will-change: filter;
        transition: filter 300ms;
    }

    .logo:hover {
        filter: drop-shadow(0 0 2em #646cffaa);
    }

    .logo.svelte:hover {
        filter: drop-shadow(0 0 2em #ff3e00aa);
    }

    .read-the-docs {
        color: #888;
    }

    main{
        width: 100%;
        height: 100%;
    }
</style>