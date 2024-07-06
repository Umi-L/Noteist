<script lang="ts">
    import {onMount} from "svelte";
    import {PenPoint} from "./PenPoint";
    import {currentDrawColor, drawingRedo, drawingUndo, drawMode} from "./globals";

    let drawArea: SVGElement;

    let isDrawing = false;
    let currentSVGElement: SVGElement;
    let currentSVGStroke: Array<string> = [];
    let points: PenPoint[] = [];

    let strokes: Array<SVGElement> = [];
    let redoStack: Array<SVGElement> = [];

    const minWidth = 1;
    const maxWidth = 20;

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

        let pressure = event.pressure;

        if (!isValidPointerEvent(event)) {
            return;
        }

        // if mouse use constant pressure
        if (event.pointerType == 'mouse') {
            pressure = 0.5;
        }


        isDrawing = true;

        // create a new SVG path element
        currentSVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        drawArea.appendChild(currentSVGElement);

        strokes.push(currentSVGElement);
        redoStack = [];

        points.push(new PenPoint(event.clientX, event.clientY, determineStrokeWidth(event)));

        // set color red and stroke width 2
        // currentSVGElement.setAttribute('stroke', 'black');
        // currentSVGElement.setAttribute('stroke-width', '1');
        currentSVGElement.setAttribute('fill', color);

        let currentPoint = new PenPoint(event.clientX, event.clientY, determineStrokeWidth(event));

        currentSVGStroke = [`M ${currentPoint.x} ${currentPoint.y}`];

        points.push(currentPoint);

        console.log('drawing started');
    }

    function handlePointerMove(event: PointerEvent) {
        if (isDrawing) {

            let currentPoint = new PenPoint(event.clientX, event.clientY, determineStrokeWidth(event));

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
            if (currentPoint.equals(points[points.length - 1])) {

                console.log('same point');
                return;
            }

            points.push(currentPoint);

            let perpendicularPointsPreviousDirection = currentPoint.getPointsPerpendicularToLineBetweenPoints(points[points.length - 2]);
            let perpendicularPointsNextDirection = points[points.length - 2].getPointsPerpendicularToLineBetweenPoints(currentPoint);

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

            let upperMiddleIndex = Math.ceil(currentSVGStroke.length / 2);
            let lowerMiddleIndex = Math.floor(currentSVGStroke.length / 2);

            // linear
            let firstElement = `L${perpendicularPointsPreviousDirection[1].x} ${perpendicularPointsPreviousDirection[1].y}`;
            let secondElement = `L${perpendicularPointsPreviousDirection[0].x} ${perpendicularPointsPreviousDirection[0].y}`;
            let thirdElement = `L${perpendicularPointsNextDirection[0].x} ${perpendicularPointsNextDirection[0].y}`;
            let fourthElement = `L${perpendicularPointsNextDirection[1].x} ${perpendicularPointsNextDirection[1].y}`;

            // put third and 4th element on left and right of the item at leftOfMiddleIndex
            if (currentSVGStroke.length > 1) {
                currentSVGStroke.splice(lowerMiddleIndex, 0, thirdElement);
                currentSVGStroke.splice(upperMiddleIndex, 0, firstElement, secondElement, fourthElement);
            } else {
                currentSVGStroke.splice(upperMiddleIndex, 0, firstElement, secondElement);
            }

            setSVGPath();
        }
    }

    function setSVGPath() {
        let finalString = "";
        for (let part of currentSVGStroke) {
            finalString += part;
        }

        currentSVGElement.setAttribute('d', finalString);
    }

    function handlePointerUp(event: PointerEvent) {
        if (!isDrawing) {
            return;
        }

        if (!(event.pointerType == 'mouse' || event.pointerType == 'pen')) {
            return;
        }

        isDrawing = false;

        currentSVGStroke = [];
        points = [];

        console.log('drawing stopped');
    }

    function undo() {

        console.log('undo');

        if (strokes.length > 0) {
            strokes[strokes.length - 1].remove();
            redoStack.push(strokes.pop()!);
        }
    }

    function redo() {

        console.log('redo');

        if (redoStack.length > 0) {
            let stroke = redoStack.pop()!;
            strokes.push(stroke);
            drawArea.appendChild(stroke);
        }
    }

    function determineStrokeWidth(event: PointerEvent): number {
        return minWidth + (maxWidth - minWidth) * event.pressure;
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