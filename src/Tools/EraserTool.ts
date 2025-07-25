import { DrawingTool } from "../DrawingTool";
import { PenPoint } from "../PenPoint";
import type { Action } from "../Action";
import { DrawingAction } from "../DrawingAction";
import type { Point } from "../Point";

export class EraserTool extends DrawingTool {
    strokes: Array<SVGElement> = [];
    drawArea: SVGElement | null = null;
    indicator: SVGElement | null = null;
    radius: number = 2;

    startDrawing(strokes: Array<SVGElement>, drawArea: SVGElement, event: PointerEvent, color: string, undoStack: Array<Action>, redoStack: Array<Action>) {
        this.strokes = strokes;
        this.drawArea = drawArea;

        let currentPoint = new PenPoint(event, this.drawArea!, this.determineStrokeWidth(event));

        // get --muted-foreground css variable
        let mutedForeground = getComputedStyle(document.documentElement).getPropertyValue('--muted-foreground');

        // indicator is a circle that shows where the eraser is
        this.indicator = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        this.indicator.setAttribute('stroke', mutedForeground);
        this.indicator.setAttribute('fill', 'none');
        this.indicator.setAttribute('stroke-width', '1');
        this.indicator.setAttribute('stroke-linecap', 'round');
        this.indicator.setAttribute('stroke-linejoin', 'round');
        this.indicator.setAttribute('cx', `${currentPoint.x}`);
        this.indicator.setAttribute('cy', `${currentPoint.y}`);
        this.indicator.setAttribute('r', `${this.radius * currentPoint.pressure}`);

        drawArea.appendChild(this.indicator);

        redoStack = [];
    }

    drawingMove(event: PointerEvent, undoStack: Array<Action>, redoStack: Array<Action>) {
        let currentPoint = new PenPoint(event, this.drawArea!, this.determineStrokeWidth(event));
        this.indicator!.setAttribute('cx', `${currentPoint.x}`);
        this.indicator!.setAttribute('cy', `${currentPoint.y}`);

        for (let gParent of this.drawArea!.querySelectorAll('g')) {

            let stroke = gParent.children[0] as SVGPathElement;

            // if svg stroke is not a path, continue
            if (!(stroke instanceof SVGPathElement))
                continue;

            let gTransform = gParent.getAttribute("transform")

            let gOffsetX = 0;
            let gOffsetY = 0;

            if (gTransform) {
                let gTransformValues = gTransform.split("(")[1].split(")")[0].split(",");
                gOffsetX = parseFloat(gTransformValues[0]);
                gOffsetY = parseFloat(gTransformValues[1]);
            }


            let pointMatrix = this.getSVGTransformMatrix(gParent)
            let boundingBox = gParent.getBoundingClientRect();
            if (event.clientX >= boundingBox.left && event.clientX <= boundingBox.right && event.clientY >= boundingBox.top && event.clientY <= boundingBox.bottom) {
                if (this.closestPointWithinDistance(stroke, currentPoint, currentPoint.pressure * this.radius, pointMatrix)) {
                    undoStack.push(new DrawingAction(gParent, this.drawArea!, true))
                    gParent.remove();
                }
            }
        }
    }

    stopDrawing(event: PointerEvent) {
        this.strokes = [];
        this.drawArea = null;

        if (this.indicator) {
            this.indicator.remove();
            this.indicator = null;
        }
    }

    closestPointWithinDistance(pathNode: SVGPathElement, point: PenPoint, checkDistance: number, pointMatrix: { matrix: SVGMatrix, centerOffsets: { x: number, y: number } }) {
        let pathLength = pathNode.getTotalLength(),
            bestLength: number = 0,
            bestDistance = Infinity;

        let checkDistance2 = checkDistance * checkDistance;

        let step = pathLength / 50; // Adjust the initial step size as needed

        const distance2 = (p: DOMPoint) => {
            let pTransformed = this.getTransformedSVGPoint(p, pointMatrix);
            let dx = pTransformed.x - point.x;
            let dy = pTransformed.y - point.y;

            return dx * dx + dy * dy;
        }

        // Linear scan with adaptive step size for coarse approximation
        for (let scan, scanLength = 0, scanDistance; scanLength <= pathLength; scanLength += step) {
            if ((scanDistance = distance2(scan = pathNode.getPointAtLength(scanLength))) < bestDistance) {
                bestLength = scanLength, bestDistance = scanDistance;

                if (scanDistance < checkDistance2) {
                    return true;
                }
            }
        }

        // Binary search for precise estimate
        let precision = step / 2;
        while (precision > 0.5) {

            let beforeLength: number = bestLength - precision;
            let afterLength: number = bestLength + precision;
            let before = pathNode.getPointAtLength(beforeLength);
            let after = pathNode.getPointAtLength(afterLength);
            let beforeDistance: number = distance2(before);
            let afterDistance: number = distance2(after);

            if (beforeLength >= 0 && beforeDistance < bestDistance) {
                bestLength = beforeLength;
                bestDistance = beforeDistance;
            } else if (afterLength <= pathLength && afterDistance < bestDistance) {
                bestLength = afterLength;
                bestDistance = afterDistance;
            } else {
                precision /= 2;
            }

            if (bestDistance < checkDistance2)
                return true;
        }

        return false;
    }

}