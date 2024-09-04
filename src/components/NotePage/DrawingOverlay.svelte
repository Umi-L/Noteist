<script lang="ts">
    import { onMount } from "svelte";
    import { PenPoint } from "../../PenPoint";
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

    export let lowestVerticalPointWritable: Writable<number>;
    export let onDrawingChange: () => void;
    export let scrollingElement: HTMLElement;

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
        }
    }
    ``;
    let isDrawing = false;

    let strokes: Array<SVGElement> = [];
    let undoStack: Array<Action> = [];
    let redoStack: Array<Action> = [];

    let tool: DrawingTool = new PenTool();
    drawingTool.subscribe((value) => {
        tool = value;
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

        onDrawingChange();
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
</script>

<svg
    bind:this={drawArea}
    class="drawing-area"
    class:enabled
    class:drawing={isDrawing}
>
</svg>

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

    .drawing-area.enabled {
        pointer-events: all;
    }

    .drawing {
        /*  stop dragging  */
        touch-action: none;
    }
</style>
