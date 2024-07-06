import {DrawingTool} from "../DrawingTool";
import {PenPoint} from "../PenPoint";

export class PenTool extends DrawingTool {
    currentSVGStroke: string[] = [];
    points: PenPoint[] = [];
    currentSVGElement: SVGElement | null = null;

    startDrawing(strokes: Array<SVGElement>, drawArea: SVGElement, event: PointerEvent, color: string) {
        this.points = [];
        this.currentSVGStroke = [];
        this.currentSVGElement = null;

        this.currentSVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.currentSVGElement.setAttribute('fill', color);

        drawArea.appendChild(this.currentSVGElement);
        strokes.push(this.currentSVGElement);

        let currentPoint = new PenPoint(event.clientX, event.clientY, this.determineStrokeWidth(event));
        this.points.push(currentPoint);

        this.currentSVGStroke = [`M ${currentPoint.x} ${currentPoint.y}`];
    }

    drawingMove(event: PointerEvent) {
        let currentPoint = new PenPoint(event.clientX, event.clientY, this.determineStrokeWidth(event));

        // // draw circle
        // let circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        // circle.setAttribute('cx', currentPoint.x.toString());
        // circle.setAttribute('cy', currentPoint.y.toString());
        // circle.setAttribute('r', currentPoint.width.toString());
        // circle.setAttribute('fill', 'red');
        // drawArea.appendChild(circle);
        //
        // let perpendicularPoints = currentPoint.getPointsPerpendicularToLineBetweenPoints(points[points.length - 2]);
        //
        // for (let point of perpendicularPoints) {
        //     let circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        //     circle.setAttribute('cx', point.x.toString());
        //     circle.setAttribute('cy', point.y.toString());
        //     circle.setAttribute('r', "2");
        //     circle.setAttribute('fill', 'yellow');
        //     drawArea.appendChild(circle);
        // }

        // if previous point is the same as the current point, return
        if (currentPoint.equals(this.points[this.points.length - 1])) {

            console.log('same point');
            return;
        }

        this.points.push(currentPoint);

        let perpendicularPointsPreviousDirection = currentPoint.getPointsPerpendicularToLineBetweenPoints(this.points[this.points.length - 2]);
        let perpendicularPointsNextDirection = this.points[this.points.length - 2].getPointsPerpendicularToLineBetweenPoints(currentPoint);

        // // debug
        // for (let i = 0; i < outsidePoints.length; i++) {
        //     // draw circle
        //     let circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        //     circle.setAttribute('cx', outsidePoints[i].x.toString());
        //     circle.setAttribute('cy', outsidePoints[i].y.toString());
        //     circle.setAttribute('r', "2");
        //     circle.setAttribute('fill', 'yellow');
        //     drawArea.appendChild(circle);
        // }

        let upperMiddleIndex = Math.ceil(this.currentSVGStroke.length / 2);
        let lowerMiddleIndex = Math.floor(this.currentSVGStroke.length / 2);

        // linear
        let firstElement = `L${perpendicularPointsPreviousDirection[1].x} ${perpendicularPointsPreviousDirection[1].y}`;
        let secondElement = `L${perpendicularPointsPreviousDirection[0].x} ${perpendicularPointsPreviousDirection[0].y}`;
        let thirdElement = `L${perpendicularPointsNextDirection[0].x} ${perpendicularPointsNextDirection[0].y}`;
        let fourthElement = `L${perpendicularPointsNextDirection[1].x} ${perpendicularPointsNextDirection[1].y}`;

        // put third and 4th element on left and right of the item at leftOfMiddleIndex
        if (this.currentSVGStroke.length > 1) {
            this.currentSVGStroke.splice(lowerMiddleIndex, 0, thirdElement);
            this.currentSVGStroke.splice(upperMiddleIndex, 0, firstElement, secondElement, fourthElement);
        } else {
            this.currentSVGStroke.splice(upperMiddleIndex, 0, firstElement, secondElement);
        }

        this.setSVGPath();
    }

    stopDrawing(event: PointerEvent) {
        this.currentSVGStroke = [];
        this.points = [];
    }

    setSVGPath() {
        let finalString = "";
        for (let part of this.currentSVGStroke) {
            finalString += part;
        }

        this.currentSVGElement.setAttribute('d', finalString);
    }
}