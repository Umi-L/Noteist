import { DrawingTool } from "../DrawingTool";
import { PenPoint } from "../PenPoint";
import type { Action } from "../Action";
import { DrawingAction } from "../DrawingAction";
import { getStroke } from 'perfect-freehand';

export class PenTool extends DrawingTool {
    currentSVGStroke: string[] = [];
    points: PenPoint[] = [];
    currentSVGElement: SVGElement | null = null;
    drawArea: SVGElement | null = null;
    gParent: SVGGElement | null = null;

    startDrawing(strokes: Array<SVGElement>, drawArea: SVGElement, event: PointerEvent, color: string, undoStack: Array<Action>, redoStack: Array<Action>) {
        this.points = [];
        this.currentSVGElement = null;
        this.drawArea = drawArea;

        this.gParent = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.currentSVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.currentSVGElement.setAttribute('fill', color);

        this.gParent.appendChild(this.currentSVGElement);

        drawArea.appendChild(this.gParent);
        strokes.push(this.gParent);
        undoStack.push(new DrawingAction(this.gParent, this.drawArea, false));

        let currentPoint = new PenPoint(event, drawArea, event.pressure);
        this.points.push(currentPoint);
    }

    drawingMove(event: PointerEvent, undoStack: Array<Action>, redoStack: Array<Action>) {
        let currentPoint = new PenPoint(event, this.drawArea!, this.determineStrokeWidth(event));

        this.points.push(currentPoint);

        let stroke = this.getSvgPathFromStroke(getStroke(this.points, {
            size: 1,
            thinning: 0.5,
            smoothing: 0,
            streamline: 0,
            easing: (t) => t,
            simulatePressure: false,
            last: true,
            start: {
                cap: true,
                taper: 0,
                easing: (t) => t,
            },
            end: {
                cap: true,
                taper: 0,
                easing: (t) => t,
            },
        }));

        this.currentSVGElement!.setAttribute('d', stroke);
    }

    getSvgPathFromStroke(points: number[][]): string {
        const average = (a: number, b: number) => (a + b) / 2
        const len = points.length

        if (!len) {
            return ''
        }

        const first = points[0]
        let result = `M${first[0].toFixed(3)},${first[1].toFixed(3)}Q`

        for (let i = 0, max = len - 1; i < max; i++) {
            const a = points[i]
            const b = points[i + 1]
            result += `${a[0].toFixed(3)},${a[1].toFixed(3)} ${average(
                a[0],
                b[0]
            ).toFixed(3)},${average(a[1], b[1]).toFixed(3)} `
        }

        result += 'Z'

        return result
    }

    stopDrawing(event: PointerEvent) {
        this.currentSVGStroke = [];
        this.points = [];
    }
}