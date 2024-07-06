import {DrawingTool} from "../DrawingTool";
import {PenPoint} from "../PenPoint";
import type {Action} from "../Action";
import {DrawingAction} from "../DrawingAction";
import type {Point} from "../Point";

export class EraserTool extends DrawingTool {
    strokes: Array<SVGElement> = [];
    drawArea: SVGElement | null = null;
    svg: SVGElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    startDrawing(strokes: Array<SVGElement>, drawArea: SVGElement, event: PointerEvent, color: string, undoStack: Array<Action>, redoStack: Array<Action>) {
        this.strokes = strokes;
        this.drawArea = drawArea;
    }

    drawingMove(event: PointerEvent, undoStack: Array<Action>, redoStack: Array<Action>) {
        let currentPoint = new PenPoint(event, this.drawArea!, this.determineStrokeWidth(event));

        for (let stroke of this.strokes) {
            // if svg stroke is not a path, continue
            if (!(stroke instanceof SVGPathElement))
                continue;

            let boundingBox = stroke.getBoundingClientRect();
            if (event.clientX >= boundingBox.left && event.clientX <= boundingBox.right && event.clientY >= boundingBox.top && event.clientY <= boundingBox.bottom) {

                if (this.closestPoint(stroke, currentPoint).distance < currentPoint.width / 2) {
                    undoStack.push(new DrawingAction(stroke, this.drawArea!, true))
                    stroke.remove();
                }
            }
        }
    }

    stopDrawing(event: PointerEvent) {
        this.strokes = [];
        this.drawArea = null;
    }

    closestPoint(pathNode: SVGPathElement, point: PenPoint) {
        let pathLength = pathNode.getTotalLength(),
            precision = 8,
            best: DOMPoint,
            bestLength: number = 0,
            bestDistance = Infinity;

        // linear scan for coarse approximation
        for (let scan, scanLength = 0, scanDistance; scanLength <= pathLength; scanLength += precision) {
            if ((scanDistance = distance2(scan = pathNode.getPointAtLength(scanLength))) < bestDistance) {
                best = scan, bestLength = scanLength, bestDistance = scanDistance;
            }
        }

        // binary search for precise estimate
        precision /= 2;
        while (precision > 0.5) {
            let beforeLength: number = bestLength - precision;
            let afterLength: number = bestLength + precision;
            let before: DOMPoint = pathNode.getPointAtLength(beforeLength);
            let after: DOMPoint = pathNode.getPointAtLength(afterLength);
            let beforeDistance: number = distance2(before);
            let afterDistance: number = distance2(after);

            if (beforeLength >= 0 && beforeDistance < bestDistance) {
                best = before
                bestLength = beforeLength
                bestDistance = beforeDistance;
            } else if (afterLength <= pathLength && afterDistance < bestDistance) {
                best = after;
                bestLength = afterLength;
                bestDistance = afterDistance;
            } else {
                precision /= 2;
            }
        }
        return {x: best.x, y: best.y, distance: Math.sqrt(bestDistance)};

        function distance2(p: DOMPoint) {
            let dx = p.x - point.x,
                dy = p.y - point.y;
            return dx * dx + dy * dy;
        }
    }
}