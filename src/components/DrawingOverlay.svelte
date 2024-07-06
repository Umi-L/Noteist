<script lang="ts">
    import {onMount} from "svelte";
    import {PenPoint} from "../PenPoint";
    import {currentDrawColor, drawingRedo, drawingTool, drawingUndo, drawMode} from "../globals";
    import {PenTool} from "../Tools/PenTool";
    import type {DrawingTool} from "../DrawingTool";
    import type {Action} from "../Action";

    let drawArea: SVGElement;

    let isDrawing = false;

    let strokes: Array<SVGElement> = [];
    let undoStack: Array<Action> = [];
    let redoStack: Array<Action> = [];

    let tool: DrawingTool = new PenTool();
    drawingTool.subscribe(value => {
        tool = value;
    });

    let enabled = true;
    drawMode.subscribe(value => {
        enabled = value;
    });

    let color = 'black';
    currentDrawColor.subscribe(value => {
        color = value;
    });

    onMount(() => {
        drawingUndo.set(undo);
        drawingRedo.set(redo);

        // subscribe to pointer events on the drawArea
        drawArea.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('pointerup', handlePointerUp);

        // on two finger tap
        drawArea.addEventListener('touchstart', (event) => {

            // if two finger tap
            if (event.touches.length == 2) {
                // remove last stroke
                if (strokes.length > 0) {
                    strokes[strokes.length - 1].remove();
                    strokes.pop();
                }
            }
        });
    });

    function isValidPointerEvent(event: PointerEvent): boolean {
        // if pen is not selected, return
        if (event.pointerType == 'pen') {
            // if pen is not in contact with the screen, return
            if (!event.pressure) {
                return false;
            }
        } else {
            // if mouse
            if (event.pointerType != 'mouse') {
                return false;
            }
        }

        return true;
    }

    function handlePointerDown(event: PointerEvent) {
        if (!isValidPointerEvent(event)) {
            return;
        }

        isDrawing = true;

        let correctEvent = new PointerEvent('pointerdown', event);

        tool.startDrawing(strokes, drawArea, event, color, undoStack, redoStack);

        console.log('drawing started');
    }

    function handlePointerMove(event: PointerEvent) {
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

        if (!(event.pointerType == 'mouse' || event.pointerType == 'pen')) {
            return;
        }

        isDrawing = false;

        tool.stopDrawing(event);

        console.log('drawing stopped');
    }

    function undo() {

        console.log('undo');

        if (strokes.length > 0) {
            strokes[strokes.length - 1].remove();

            let action = undoStack.pop()!;

            redoStack.push(action);

            action.undo();
        }
    }

    function redo() {

        console.log('redo');

        if (redoStack.length > 0) {
            let action = redoStack.pop()!;
            undoStack.push(action);

            action.redo();
        }
    }
</script>


<svg bind:this={drawArea} class="drawing-area" style={enabled ? "pointer-events: all;" : "pointer-events: none;"}>

</svg>


<style>
    .drawing-area {
        width: 100%;
        height: 100%;
        /*  stop dragging  */
        touch-action: none;

        /*  transparent background  */
        background-color: transparent;

        /*  make it on top  */
        z-index: 100;

        position: absolute;
        left: 0;
        top: 0;
    }
</style>