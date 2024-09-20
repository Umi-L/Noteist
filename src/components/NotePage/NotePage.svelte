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
    let noteScrollbarWrapper: HTMLDivElement;

    let resizeObserver: ResizeObserver;

    let loadedDrawing = false;
    let loadedText = false;

    let zoom = 1;

    // get the value of 7rem in px
    const noteBottomPadding =
        7 * parseFloat(getComputedStyle(document.documentElement).fontSize);

    // to be ran when the note begins to exist
    function onNoteExists() {
        // get the amount the user has scrolled
        noteHeight = window.innerHeight;
        minNoteHeight = window.innerHeight;

        // on user scrolling
        noteScrollbarWrapper.addEventListener("scroll", () => {
            // if within noteBottomPadding of the bottom
            if (
                noteScrollbarWrapper.scrollTop +
                    noteScrollbarWrapper.clientHeight >=
                noteScrollbarWrapper.scrollHeight - noteBottomPadding
            ) {
                // add the amount of space required to keep the bottom padding at noteBottomPadding
                noteHeight +=
                    noteScrollbarWrapper.scrollTop +
                    noteScrollbarWrapper.clientHeight -
                    (noteScrollbarWrapper.scrollHeight - noteBottomPadding);
            }

            // if the user has scrolled up away from the bottom
            if (
                noteScrollbarWrapper.scrollTop +
                    noteScrollbarWrapper.clientHeight <
                noteScrollbarWrapper.scrollHeight - noteBottomPadding
            ) {
                // remove the amount of space required to keep the bottom padding at noteBottomPadding
                noteHeight -=
                    noteScrollbarWrapper.scrollHeight -
                    noteBottomPadding -
                    (noteScrollbarWrapper.scrollTop +
                        noteScrollbarWrapper.clientHeight);
            }

            if (noteHeight < minNoteHeight) {
                noteHeight = minNoteHeight;
            }
        });

        function applyZoom(amount: number, centerX: number, centerY: number) {
            let zoomOriginX =
                (centerX -
                    noteScrollbarWrapper.getBoundingClientRect().left +
                    noteScrollbarWrapper.scrollLeft) /
                zoom;

            let zoomOriginY =
                (centerY -
                    noteScrollbarWrapper.getBoundingClientRect().top +
                    noteScrollbarWrapper.scrollTop) /
                zoom;

            zoom += amount;

            if (zoom < 1) {
                zoom = 1;
            }

            if (zoom > 3) {
                zoom = 3;
            }

            let newScrollLeft =
                zoomOriginX * zoom -
                (centerX - noteScrollbarWrapper.getBoundingClientRect().left);
            let newScrollTop =
                zoomOriginY * zoom -
                (centerY - noteScrollbarWrapper.getBoundingClientRect().top);

            // set the new scroll position
            noteScrollbarWrapper.scrollLeft = newScrollLeft;
            noteScrollbarWrapper.scrollTop = newScrollTop;
        }

        noteScrollbarWrapper.addEventListener(
            "wheel",
            (event) => {
                if (event.ctrlKey) {
                    // if the deltaY is less than 0.1, return
                    if (Math.abs(event.deltaY) < 0.1) {
                        return;
                    }

                    event.preventDefault();

                    applyZoom(
                        event.deltaY * -0.01,
                        event.clientX,
                        event.clientY,
                    );
                }
            },
            { passive: false },
        );

        let startDistance = 0;
        // on mobile pinch zoom
        noteScrollbarWrapper.addEventListener(
            "touchstart",
            (event) => {
                if (event.touches.length < 2) {
                    return;
                }

                event.preventDefault();

                const touch1 = event.touches[0];
                const touch2 = event.touches[1];

                startDistance = Math.hypot(
                    touch1.clientX - touch2.clientX,
                    touch1.clientY - touch2.clientY,
                );
            },
            { passive: false },
        );

        noteScrollbarWrapper.addEventListener(
            "touchmove",
            (event) => {
                if (event.touches.length < 2) {
                    return;
                }

                event.preventDefault();

                const touch1 = event.touches[0];
                const touch2 = event.touches[1];

                const distance = Math.hypot(
                    touch1.clientX - touch2.clientX,
                    touch1.clientY - touch2.clientY,
                );

                // get midpoint of the two touches
                const midX = (touch1.clientX + touch2.clientX) / 2;
                const midY = (touch1.clientY + touch2.clientY) / 2;

                let amount = (distance - startDistance) * 0.0005;

                applyZoom(amount, midX, midY);
            },
            { passive: false },
        );
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
            $lowestDrawingPoint,
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
            class="scrollbar"
            class:uninteractable={!loadedText || !loadedDrawing}
            bind:this={noteScrollbarWrapper}
        >
            {#if !loadedText || !loadedDrawing}
                <div class="loading-wrapper">
                    <span class="loading loading-spinner loading-lg"></span>
                    Loading...
                </div>
            {/if}

            <div
                class="note"
                bind:this={note}
                style={`transform: scale(${zoom});`}
            >
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

        position: relative;

        /*pointer-events: none;*/
        user-select: none;
        transform-origin: 0% 0%;
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

    .scrollbar {
        height: 100%;
        width: 100%;

        overflow: auto;

        position: relative;
    }
</style>
