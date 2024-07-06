import type {Action} from "./Action";

export abstract class DrawingTool {
    minWidth: number = 1;
    maxWidth: number = 10;

    startDrawing(strokes: Array<SVGElement>, drawArea: SVGElement, event: PointerEvent, color: string, undoStack: Array<Action>, redoStack: Array<Action>) {

    }

    drawingMove(event: PointerEvent, undoStack: Array<Action>, redoStack: Array<Action>) {

    }

    stopDrawing(event: PointerEvent) {

    }


    determineStrokeWidth(event: PointerEvent): number {
        return this.minWidth + (this.maxWidth - this.minWidth) * event.pressure;
    }
}