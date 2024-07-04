<script lang="ts">
    import {onMount} from "svelte";
    import {PenPoint} from "./PenPoint";
    import {drawMode} from "./globals";

    let drawArea: SVGElement;

    let isDrawing = false;
    let currentSVGElement: SVGElement;
    let currentSVGStroke: Array<string> = [];
    let points: PenPoint[] = [];

    const minWidth = 1;
    const maxWidth = 20;

    let enabled = true;
    drawMode.subscribe(value => {
        enabled = value;
    });

    onMount(() => {
        // subscribe to pointer events on the drawArea
        drawArea.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('pointerup', handlePointerUp);
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

        points.push(new PenPoint(event.clientX, event.clientY, determineStrokeWidth(event)));

        // set color red and stroke width 2
        // currentSVGElement.setAttribute('stroke', 'black');
        // currentSVGElement.setAttribute('stroke-width', '1');
        currentSVGElement.setAttribute('fill', 'red');

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
            let parallelPoints = points[points.length - 2].getPointsParallelToLineBetweenPoints(currentPoint);

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

            let middleIndex = Math.ceil(currentSVGStroke.length / 2);

            // linear
            currentSVGStroke.splice(middleIndex, 0, `L${perpendicularPointsPreviousDirection[0].x} ${perpendicularPointsPreviousDirection[0].y}`, `L${perpendicularPointsPreviousDirection[1].x} ${perpendicularPointsPreviousDirection[1].y}`);

            // currentSVGStroke.splice(middleIndex, 0, `L${parallelPoints[0].x} ${parallelPoints[0].y}`, `L${parallelPoints[1].x} ${parallelPoints[1].y}`);

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
        if (!(event.pointerType == 'mouse' || event.pointerType == 'pen')) {
            return;
        }

        isDrawing = false;

        currentSVGStroke = [];
        points = [];

        console.log('drawing stopped');
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