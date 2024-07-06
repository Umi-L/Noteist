export abstract class DrawingTool {
    minWidth: number = 1;
    maxWidth: number = 10;

    startDrawing(strokes: Array<SVGElement>, drawArea: SVGElement, event: PointerEvent, color: string) {

    }

    drawingMove(event: PointerEvent) {

    }

    stopDrawing(event: PointerEvent) {

    }


    determineStrokeWidth(event: PointerEvent): number {
        return this.minWidth + (this.maxWidth - this.minWidth) * event.pressure;
    }
}