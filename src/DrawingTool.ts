import type { Action } from "./Action";
import { getBoundingBoxRelativeToParent } from "./utils/boundingBoxUtils";

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

    getSVGTransformMatrix(gParent: SVGGElement) {
        let gTransform = gParent.getAttribute("transform")

        let gOffsetX = 0;
        let gOffsetY = 0;
        let gScaleX = 1;
        let gScaleY = 1;

        if (gTransform) {
            // translate(x,y)
            let regex = /translate\(([^,]+),([^)]+)\)/;
            let match = gTransform.match(regex);
            if (match) {
                gOffsetX = parseFloat(match[1]);
                gOffsetY = parseFloat(match[2]);
            }

            // scale(x,y)
            regex = /scale\(([^,]+),([^)]+)\)/;
            match = gTransform.match(regex);
            if (match) {
                gScaleX = parseFloat(match[1]);
                gScaleY = parseFloat(match[2]);
            }
        }

        console.log("gOffsetX, gOffsetY, gScaleX, gScaleY", gOffsetX, gOffsetY, gScaleX, gScaleY)

        let relativeBox = getBoundingBoxRelativeToParent(gParent);

        relativeBox.x -= gOffsetX;
        relativeBox.y -= gOffsetY;

        let centerX = relativeBox.width / 2 + relativeBox.x;
        let centerY = relativeBox.height / 2 + relativeBox.y;

        console.log("relativeBox", relativeBox)
        console.log("centerX, centerY", centerX, centerY)

        // // add debug circle at origin
        // let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        // circle.setAttribute("cx", centerX.toString());
        // circle.setAttribute("cy", centerY.toString());
        // circle.setAttribute("r", "5");
        // circle.setAttribute("stroke", "blue");
        // gParent.parentElement!.appendChild(circle);

        // TODO once chrome decides to implement this correctly, change it back to DOMMatrix
        let matrix = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix()
            .translate(gOffsetX, gOffsetY)
            .scale(gScaleX, gScaleY, undefined, centerX, centerY);

        return {
            matrix: matrix,
            centerOffsets: {
                x: centerX,
                y: centerY
            }
        }
    }

    getTransformedSVGPoint(point: SVGPoint, { matrix, centerOffsets }: { matrix: SVGMatrix, centerOffsets: { x: number, y: number } }): SVGPoint {

        // offset point by centerOffsets
        point.x -= centerOffsets.x;
        point.y -= centerOffsets.y;

        let transformedPoint = point.matrixTransform(matrix)

        // offset point by centerOffsets
        transformedPoint.x += centerOffsets.x;
        transformedPoint.y += centerOffsets.y;

        return transformedPoint
    }
}