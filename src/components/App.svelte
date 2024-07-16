<script lang="ts">
    import "../app.css";
    import {List, TextB} from "phosphor-svelte";
    import DrawingOverlay from "./DrawingOverlay.svelte";
    import Toolbar from "./Toolbar.svelte";
    import Sidebar from "./Sidebar.svelte";
    import {currentNote, onEditorChange, sidebarOpen} from "../globals";
    import {onMount} from "svelte";
    import Editor from "./Editor.svelte";
    import type {Editor as EditorType} from "@tiptap/core";
    import ContextMenu from "./ContextMenu.svelte";
    import type {Note} from "../noteUtils";

    if ("virtualKeyboard" in navigator) {
        navigator.virtualKeyboard.overlaysContent = true;
    }

    let isSidebarOpen = false;
    sidebarOpen.subscribe(value => {
        isSidebarOpen = value;
    });

    let note: HTMLDivElement;
    let innerNote: HTMLDivElement;
    let noteWidth: number;
    let noteHeight: number;

    onMount(() => {
        noteWidth = note.offsetWidth;
        noteHeight = innerNote.scrollHeight;

        new ResizeObserver((entries) => {
            console.log("resize");
            for (let entry of entries) {
                noteWidth = entry.contentRect.width;
            }
        }).observe(note);

        onEditorChange((editor: EditorType) => {
            noteHeight = innerNote.scrollHeight;
        });

    });

    let _note: Note | null;
    currentNote.subscribe(value => {
        _note = value;
    });


</script>

<main class="main">

    <Sidebar/>

    <ContextMenu/>

    <div class="note scrollbar" bind:this={note}>
        {#if _note}
            <div class="drawing-overlay-wrapper" style={`height: calc(${noteHeight}px + var(--note-bottom-padding)`}>
                <DrawingOverlay/>
            </div>
        {/if}


        <div class="toolbar-wrapper">
            <div class="toolbar-subwrapper" style={`width: ${noteWidth}px;`}>
                <Toolbar/>
            </div>

            <button class="btn btn-square btn-ghost top-left btn-sm overlay" class:btn-hidden={isSidebarOpen}
                    class:btn-shown={!isSidebarOpen}
                    on:click={()=>{sidebarOpen.update(value => !value)}}>
                <List size={16}/>
            </button>
        </div>

        <div class="inner-note" bind:this={innerNote}>
            {#if _note}
                <Editor/>
            {:else }
                <div class="text-center">
                    <h1 class="text-2xl">No note selected</h1>
                </div>
            {/if}
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

        /*pointer-events: none;*/
        user-select: none;
    }

    .inner-note {
        width: calc(100% - 3rem * 2);
        height: 100%;

        margin-top: var(--safe-area-inset-top);
    }

    .top-left {
        position: absolute;
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

    .overlay {
        z-index: 10000;

        pointer-events: all;
        user-select: none;
    }

    .toolbar-wrapper {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 100;
        width: 100%;
        height: 100%;

        pointer-events: none;
        user-select: none;
    }

    .toolbar-subwrapper {
        height: 100%;
        position: absolute;
        right: 0;

        user-select: none;
        pointer-events: none;
    }

    .drawing-overlay-wrapper {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;

        pointer-events: none;
        user-select: none;

        --note-bottom-padding: 7rem;
    }

    .text-center {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
    }


</style>