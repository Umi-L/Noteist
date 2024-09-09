<script lang="ts">
    import { onMount } from "svelte";
    import { PenPoint } from "../../PenPoint";
    import Moveable from "svelte-moveable";
    import {
        currentDrawColor,
        currentNote,
        drawingRedo,
        drawingTool,
        drawingUndo,
        drawMode,
    } from "../../globals";
    import { PenTool } from "../../Tools/PenTool";
    import type { DrawingTool } from "../../DrawingTool";
    import type { Action } from "../../Action";
    import type { Note } from "../../noteUtils";
    import { Settings } from "../../settings";
    import { isPenEvent } from "../../utils";
    import type { Writable } from "svelte/store";
    import { draw } from "svelte/transition";

    export let lowestVerticalPointWritable: Writable<number>;
    export let onDrawingChange: () => void;
    export let scrollingElement: HTMLElement;
    export let onLoadedData: () => void;

    let leaveDrawingModeTimeout: number | null = null;

    let detectDrawingMode: boolean;
    Settings.general.detectDrawingMode.subscribe((value) => {
        detectDrawingMode = value;
    });

    let autoLeaveDrawingMode: boolean;
    let autoLeaveDrawingModeTime: number;
    Settings.general.autoLeaveDrawingMode.subscribe((value) => {
        autoLeaveDrawingMode = value;
    });

    Settings.general.autoLeaveDrawingModeTime.subscribe((value) => {
        autoLeaveDrawingModeTime = value;
    });

    let drawArea: SVGElement;

    let hasFetchedContent = false;

    let note: Note | null = null;
    currentNote.subscribe(async (_note) => {
        hasFetchedContent = false;

        note = _note;

        loadData();
    });

    async function loadData() {
        if (note != null && !hasFetchedContent && drawArea) {
            let content = await note.getSVGContent();

            console.log(content);

            // strip outer svg tags
            content = content.replace(/<\/?svg[^>]*>/g, "");

            console.log("replaced", content);

            drawArea.innerHTML = content;

            hasFetchedContent = true;

            calculateLowestPoint();

            onLoadedData();
        }
    }

    let isDrawing = false;

    let strokes: Array<SVGElement> = [];
    let undoStack: Array<Action> = [];
    let redoStack: Array<Action> = [];

    let tool: DrawingTool = new PenTool();
    drawingTool.subscribe((value) => {
        tool = value;

        if (!drawArea) return;

        // when tool changes, remove selections
        drawArea.querySelectorAll(".drawing-selected").forEach((element) => {
            element.classList.remove("drawing-selected");
        });

        moveableKey++;
    });

    let enabled = false;
    drawMode.subscribe((value) => {
        enabled = value;
    });

    let color = "black";
    currentDrawColor.subscribe((value) => {
        color = value;
    });

    onMount(() => {
        drawingUndo.set(undo);
        drawingRedo.set(redo);

        // subscribe to pointer events on the drawArea
        drawArea.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("pointermove", handlePointerMove);
        document.addEventListener("pointerup", handlePointerUp);

        // on two finger tap
        drawArea.addEventListener("touchstart", (event) => {
            // if two finger tap
            if (event.touches.length == 2) {
                // remove last stroke
                if (strokes.length > 0) {
                    strokes[strokes.length - 1].remove();
                    strokes.pop();
                }
            }
        });

        // on touchmove
        drawArea.addEventListener("touchmove", (event) => {
            // stop scrolling when drawing so drawing wont scroll the screen but still allow scrolling when not drawing
            if (isDrawing) {
                event.preventDefault();
            }
        });

        loadData();
    });

    function isValidPointerEvent(event: PointerEvent): boolean {
        // if pen is not selected, return
        if (event.pointerType == "pen") {
            // if pen is not in contact with the screen, return
            if (!event.pressure) {
                return false;
            }
        } else {
            // if mouse
            if (event.pointerType != "mouse") {
                return false;
            }
        }

        return true;
    }

    function handlePointerDown(event: PointerEvent) {
        console.debug("drawing down", event);

        if (!isValidPointerEvent(event)) {
            return;
        }

        isDrawing = true;

        tool.startDrawing(
            strokes,
            drawArea,
            event,
            color,
            undoStack,
            redoStack
        );

        console.log("drawing started");
    }

    function handlePointerMove(event: PointerEvent) {
        if (detectDrawingMode) {
            if (isPenEvent(event)) {
                drawMode.set(true);

                if (autoLeaveDrawingMode) {
                    if (leaveDrawingModeTimeout) {
                        clearTimeout(leaveDrawingModeTimeout);
                    }

                    leaveDrawingModeTimeout = setTimeout(() => {
                        drawMode.set(false);
                    }, autoLeaveDrawingModeTime);
                }
            }
        }

        if (isDrawing) {
            if (!isValidPointerEvent(event)) {
                return;
            }

            tool.drawingMove(event, undoStack, redoStack);
        }
    }

    function handlePointerUp(event: PointerEvent) {
        moveableKey++;

        if (!isDrawing) {
            return;
        }

        console.debug("drawing up", event);

        if (!(event.pointerType == "mouse" || event.pointerType == "pen")) {
            return;
        }

        isDrawing = false;

        tool.stopDrawing(event);

        console.log("drawing stopped");

        if (note && hasFetchedContent) {
            note.setSVGContent(drawArea.outerHTML);
        }

        calculateLowestPoint();

        onDrawingChange();
    }

    function calculateLowestPoint() {
        // foreach child find the one with the lowest bottom
        let lowestVerticalPoint = 0;
        for (let i = 0; i < drawArea.children.length; i++) {
            let child = drawArea.children[i];

            let childRect = child.getBoundingClientRect();

            let childBottom = childRect.bottom;

            let distance = childBottom + scrollingElement.scrollTop;

            if (distance > lowestVerticalPoint) {
                lowestVerticalPoint = distance;
            }
        }

        lowestVerticalPointWritable.set(lowestVerticalPoint);
    }

    function undo() {
        console.log("undo");

        if (strokes.length > 0) {
            strokes[strokes.length - 1].remove();

            let action = undoStack.pop()!;

            redoStack.push(action);

            action.undo();
        }
    }

    function redo() {
        console.log("redo");

        if (redoStack.length > 0) {
            let action = redoStack.pop()!;
            undoStack.push(action);

            action.redo();
        }
    }

    const hideChildMoveableDefaultLines = false;
    const draggable = true;
    const throttleDrag = 0;
    const edgeDraggable = true;
    const startDragRotate = 0;
    const throttleDragRotate = 0;
    const resizable = true;
    const keepRatio = false;
    const throttleResize = 0;
    const renderDirections = ["nw", "n", "ne", "w", "e", "sw", "s", "se"];
    const rotatable = true;
    const throttleRotate = 0;
    const rotationPosition = "top";
    const minWidth = 0;
    const minHeight = 0;
    const maxWidth = 0;
    const maxHeight = 0;
    let moveableRef = null;

    let moveableKey = 0;
</script>

<svg
    bind:this={drawArea}
    class="drawing-area"
    class:enabled
    class:drawing={isDrawing}
>
</svg>
{#key moveableKey}
    <Moveable
        bind:this={moveableRef}
        target={".drawing-selected"}
        {hideChildMoveableDefaultLines}
        {draggable}
        {throttleDrag}
        {edgeDraggable}
        {startDragRotate}
        {throttleDragRotate}
        {resizable}
        {keepRatio}
        {throttleResize}
        {renderDirections}
        {rotatable}
        {throttleRotate}
        {rotationPosition}
        dragArea={true}
        pinchable={true}
        on:dragGroup={({ detail: { events } }) => {
            events.forEach((ev) => {
                ev.target.style.transform = ev.transform;
            });
        }}
        on:dragGroupEnd={({ detail: { events } }) => {
            moveableKey++;
        }}
        on:resizeGroupStart={({ detail: { setMin, setMax } }) => {
            setMin([minWidth, minHeight]);
            setMax([maxWidth, maxHeight]);
        }}
        on:resizeGroup={({ detail: { events } }) => {
            events.forEach((ev) => {
                ev.target.style.width = `${ev.width}px`;
                ev.target.style.height = `${ev.height}px`;
                ev.target.style.transform = ev.drag.transform;
            });
        }}
        on:rotateGroup={({ detail: { events } }) => {
            events.forEach((ev) => {
                ev.target.style.transform = ev.drag.transform;
            });

            moveableKey++;
        }}
        on:drag={({ detail: e }) => {
            e.target.style.transform = e.transform;
        }}
        on:dragEnd={({ detail: e }) => {
            moveableKey++;
        }}
        on:resize={({ detail: e }) => {
            e.target.style.width = `${e.width}px`;
            e.target.style.height = `${e.height}px`;
            e.target.style.transform = e.drag.transform;
        }}
        on:resizeEnd={({ detail: e }) => {
            moveableKey++;
        }}
        on:rotate={({ detail: e }) => {
            e.target.style.transform = e.transform;
        }}
        on:rotateEnd={({ detail: e }) => {
            moveableKey++;
        }}
    />
{/key}

<style>
    .drawing-area {
        width: 100%;
        height: 100%;

        /*  transparent background  */
        background-color: transparent;

        /*  make it on top  */
        z-index: 100;

        position: absolute;
        top: 0;

        pointer-events: none;
    }

    :global(.moveable-control-box) {
        pointer-events: all;
    }

    :global(.drawing-selected) {
        pointer-events: bounding-box;
        background-color: transparent;
    }

    .drawing-area.enabled {
        pointer-events: all;
    }

    .drawing {
        /*  stop dragging  */
        touch-action: none;
    }
</style>
