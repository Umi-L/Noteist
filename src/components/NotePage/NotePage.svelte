<script lang="ts">
    import { currentNote, onEditorChange, sidebarOpen } from "../../globals";
    import type { Note } from "../../noteUtils";
    import { onMount } from "svelte";
    import Sidebar from "./NoteSidebar.svelte";
    import ContextMenu from "./ContextMenu.svelte";
    import DrawingOverlay from "./DrawingOverlay.svelte";
    import Toolbar from "./Toolbar.svelte";
    import { List } from "phosphor-svelte";
    import Editor from "./Editor.svelte";
    import type { Editor as EditorType } from "@tiptap/core";
    import { writable, type Writable } from "svelte/store";
    import HomeMenu from "./HomeMenu.svelte";

    let note: HTMLDivElement;
    let innerNote: HTMLDivElement;
    let noteWidth: number;
    let noteHeight: number;
    let minNoteHeight: number;
    let lowestEditorPoint: number;
    let lowestDrawingPoint: Writable<number> = writable(0);
    let toolbarWrapper: HTMLDivElement;

    let resizeObserver: ResizeObserver;

    let loadedDrawing = false;
    let loadedText = false;

    // get the value of 7rem in px
    const noteBottomPadding =
        7 * parseFloat(getComputedStyle(document.documentElement).fontSize);

    // to be ran when the note begins to exist
    function onNoteExists() {
        // get the amount the user has scrolled
        noteHeight = note.scrollHeight;
        minNoteHeight = note.scrollHeight;

        // on user scrolling
        note.addEventListener("scroll", () => {
            // if within noteBottomPadding of the bottom
            if (
                note.scrollTop + note.clientHeight >=
                note.scrollHeight - noteBottomPadding
            ) {
                // add the amount of space required to keep the bottom padding at noteBottomPadding
                noteHeight +=
                    note.scrollTop +
                    note.clientHeight -
                    (note.scrollHeight - noteBottomPadding);
            }

            // if the user has scrolled up away from the bottom
            if (
                note.scrollTop + note.clientHeight <
                note.scrollHeight - noteBottomPadding
            ) {
                // remove the amount of space required to keep the bottom padding at noteBottomPadding
                noteHeight -=
                    note.scrollHeight -
                    noteBottomPadding -
                    (note.scrollTop + note.clientHeight);
            }

            if (noteHeight < minNoteHeight) {
                noteHeight = minNoteHeight;
            }
        });
    }

    // reactive block that will only run if innerNote is defined
    $: if (innerNote) {
        onNoteExists();
    }

    onMount(() => {
        onEditorChange((editor: EditorType) => {
            editorChanged(editor);
        });
    });

    function calculateMinNoteHeight() {
        if (!innerNote) {
            return;
        }

        minNoteHeight = Math.max(
            note.clientHeight,
            lowestEditorPoint,
            $lowestDrawingPoint
        );

        if (noteHeight < minNoteHeight) {
            noteHeight = minNoteHeight;
        }
    }

    function drawingChanged() {
        console.log("new lowest drawing point: ", $lowestDrawingPoint);

        calculateMinNoteHeight();
    }

    function editorChanged(editor: EditorType) {
        if (!innerNote) {
            return;
        }

        lowestEditorPoint =
            editor.view.dom.children[
                editor.view.dom.children.length - 1
            ].getBoundingClientRect().bottom -
            editor.view.dom.children[0].getBoundingClientRect().top;

        calculateMinNoteHeight();
    }

    let _note: Note | null;
    currentNote.subscribe((value) => {
        _note = value;

        loadedDrawing = false;
        loadedText = false;

        // set note scroll to top
        if (note) {
            note.scrollTop = 0;
        }

        if (_note) {
            if (resizeObserver) {
                resizeObserver.disconnect();
            }

            // on next frame once the note has been rendered
            requestAnimationFrame(() => {
                noteWidth = note.offsetWidth;

                console.log("note width", noteWidth);

                resizeObserver = new ResizeObserver((entries) => {
                    console.log("resize");
                    for (let entry of entries) {
                        noteWidth = entry.contentRect.width;
                    }
                });

                resizeObserver.observe(note);
            });
        }
    });
</script>

<div class="wrapper">
    <Sidebar />

    <ContextMenu />
    {#if _note}
        <div
            class="note scrollbar"
            bind:this={note}
            class:uninteractable={!loadedText || !loadedDrawing}
        >
            {#if !loadedText || !loadedDrawing}
                <div class="loading-wrapper">
                    <span class="loading loading-spinner loading-lg"></span>
                    Loading...
                </div>
            {/if}

            <div
                class="drawing-overlay-wrapper"
                style={`height: calc(${noteHeight}px + var(--note-bottom-padding, 0px));`}
            >
                <DrawingOverlay
                    onLoadedData={() => {
                        loadedDrawing = true;
                        console.log("loaded drawing");

                        calculateMinNoteHeight();
                    }}
                    lowestVerticalPointWritable={lowestDrawingPoint}
                    onDrawingChange={drawingChanged}
                    scrollingElement={note}
                />
            </div>

            <div class="toolbar-wrapper">
                <div
                    class="toolbar-subwrapper"
                    style={`width: ${noteWidth}px;`}
                    bind:this={toolbarWrapper}
                >
                    <Toolbar
                        maxWidth={noteWidth}
                        maxHeight={noteHeight}
                        {toolbarWrapper}
                    />
                </div>

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
            </div>

            <div
                class="inner-note"
                bind:this={innerNote}
                style={`height: calc(${noteHeight}px + var(--note-bottom-padding, 0px));`}
            >
                <Editor
                    onLoadedData={(editor) => {
                        loadedText = true;
                        console.log("loaded text");

                        editorChanged(editor);
                    }}
                />
            </div>
        </div>
    {:else}
        <HomeMenu />

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
    {/if}
</div>

<style>
    .wrapper {
        width: 100%;
        height: 100%;

        display: grid;
        grid-template-columns: min-content auto;
    }

    .note {
        display: flex;
        flex-direction: column;
        align-items: center;

        width: 100%;
        height: 100%;

        overflow-y: auto;

        position: relative;

        /*pointer-events: none;*/
        user-select: none;
    }

    .inner-note {
        --note-bottom-padding: 7rem;

        flex-shrink: 0;

        width: calc(100% - 3rem * 2);

        margin-top: var(--safe-area-inset-top);

        overflow: hidden;
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
        height: 100%;

        pointer-events: none;
        user-select: none;
    }

    .text-center {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
    }

    .loading-wrapper {
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;

        position: absolute;

        display: flex;
        justify-content: center;
        align-items: center;

        flex-direction: column;

        background-color: rgba(0, 0, 0, 0.2);

        z-index: 1000;
    }

    .uninteractable {
        pointer-events: none !important;
        user-select: none !important;
    }
</style>
