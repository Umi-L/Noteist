import { draw } from "svelte/transition";
import type { Action } from "../Action";
import { DrawingTool } from "../DrawingTool";
import { PenPoint } from "../PenPoint";
import Color from "colorjs.io";

export class SelectTool extends DrawingTool {
    currentSVGStroke: string[] = [];
    points: PenPoint[] = [];
    currentSVGElement: SVGGeometryElement | null = null;
    closingSVGElement: SVGGeometryElement | null = null;
    drawArea: SVGElement | null = null;

    startDrawing(strokes: Array<SVGElement>, drawArea: SVGElement, event: PointerEvent, color: string, undoStack: Array<Action>, redoStack: Array<Action>) {

        drawArea.querySelectorAll(".drawing-selected").forEach((element) => {
            element.classList.remove("drawing-selected");
        });

        this.points = [];
        this.currentSVGElement = null;
        this.drawArea = drawArea;

        this.currentSVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.closingSVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.currentSVGElement.setAttribute('stroke', "var(--foreground)");
        this.currentSVGElement.setAttribute('stroke-width', "2");
        this.currentSVGElement.setAttribute('stroke-dasharray', "5,5");

        this.closingSVGElement.setAttribute('stroke', "var(--foreground)");
        this.closingSVGElement.setAttribute('stroke-width', "2");
        this.closingSVGElement.setAttribute('stroke-dasharray', "5,5");

        // get the css variable for the foreground color
        let cssVar = getComputedStyle(document.documentElement).getPropertyValue('--foreground');

        let foregroundColor = new Color(cssVar).to("srgb");

        // set the fill color to the foreground color with 0.2 opacity
        this.currentSVGElement.setAttribute('fill', `rgba(${foregroundColor.r * 255}, ${foregroundColor.g * 255}, ${foregroundColor.b * 255}, 0.2)`);

        drawArea.appendChild(this.currentSVGElement);
        drawArea.appendChild(this.closingSVGElement);

        let currentPoint = new PenPoint(event, drawArea, event.pressure);
        this.points.push(currentPoint);

        this.currentSVGElement.setAttribute('d', "M" + currentPoint.x + " " + currentPoint.y);
    }

    drawingMove(event: PointerEvent, undoStack: Array<Action>, redoStack: Array<Action>) {
        let currentPoint = new PenPoint(event, this.drawArea!, this.determineStrokeWidth(event));

        this.points.push(currentPoint);

        this.currentSVGElement!.setAttribute('d', this.currentSVGElement!.getAttribute('d') + " L" + currentPoint.x + " " + currentPoint.y);

        this.closingSVGElement!.setAttribute('d', "M" + this.points[0].x + " " + this.points[0].y + " L" + currentPoint.x + " " + currentPoint.y);
    }

    stopDrawing(event: PointerEvent) {
        // remove the closing path and get it out of the way
        this.closingSVGElement?.remove();

        const checkingBounds = this.currentSVGElement?.getBoundingClientRect();

        // find intersecting elements
        this.drawArea?.querySelectorAll("g").forEach((compareG) => {
            if (compareG === this.currentSVGElement) return;

            let compareRect = compareG.getBoundingClientRect();

            // check for bounding box intersection
            if (this.bboxIntersect(checkingBounds!, compareRect)) {

                let gTransform = compareG.getAttribute("transform")

                let gOffsetX = 0;
                let gOffsetY = 0;

                if (gTransform) {
                    let gTransformValues = gTransform.split("(")[1].split(")")[0].split(",");
                    gOffsetX = parseFloat(gTransformValues[0]);
                    gOffsetY = parseFloat(gTransformValues[1]);
                }

                let gChild = compareG.children[0] as SVGElement;

                // if the child is a path, then we can sample the points
                if (gChild instanceof SVGGeometryElement) {

                    let points = this.samplePathPoints(gChild, gOffsetX, gOffsetY);

                    // check for path intersection
                    for (let i = 0; i < points.length; i++) {
                        if (this.currentSVGElement!.isPointInFill(points[i])) {
                            compareG.classList.add("drawing-selected");
                        }
                    }
                } else {
                    compareG.classList.add("drawing-selected");
                }
            }
        });

        // remove the paths
        this.currentSVGElement?.remove();
    }

    colorToHex(str: string) {
        let canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        ctx!.fillStyle = str;
        let hex = ctx!.fillStyle;
        return hex;
    }

    // Convert hex to RGB
    hexToRgb(hex: string) {
        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);
        return `${r}, ${g}, ${b}`;
    }

    bboxIntersect(a: DOMRect, b: DOMRect) {
        return (a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y);
    }

    samplePathPoints(path: SVGGeometryElement, gOffsetX: number, gOffsetY: number) {
        const pathLength = path.getTotalLength()
        const points = []
        for (let i = 0; i < pathLength; i += 10)
            points.push(path.getPointAtLength(i).matrixTransform(new DOMMatrix().translate(gOffsetX, gOffsetY)))
        return points
    }
}