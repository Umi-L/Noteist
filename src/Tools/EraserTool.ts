import {DrawingTool} from "../DrawingTool";
import {PenPoint} from "../PenPoint";

export class EraserTool extends DrawingTool {
    strokes: Array<SVGElement> = [];
    drawArea: SVGElement | null = null;

    startDrawing(strokes: Array<SVGElement>, drawArea: SVGElement, event: PointerEvent, color: string) {
        this.strokes = strokes;
        this.drawArea = drawArea;
    }

    drawingMove(event: PointerEvent) {
        for (let stroke of this.strokes) {

            // if svg stroke is not a path, continue
            if (!(stroke instanceof SVGPathElement))
                continue;

            let boundingBox = stroke.getBoundingClientRect();
            if (event.clientX >= boundingBox.left && event.clientX <= boundingBox.right && event.clientY >= boundingBox.top && event.clientY <= boundingBox.bottom) {
                if (stroke.isPointInFill(new DOMPoint(event.clientX, event.clientY))){
                    stroke.remove();
                }
            }
        }
    }

    stopDrawing(event: PointerEvent) {
        this.strokes = [];
        this.drawArea = null;
    }
}