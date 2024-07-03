<script lang="ts">
    import {onMount} from "svelte";
    import {PenPoint} from "./PenPoint";
    import {drawMode} from "./globals";

    let drawArea: SVGElement;

    let isDrawing = false;
    let currentSVGElement: SVGElement;
    let currentSVGStroke = '';
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

    function handlePointerDown(event: PointerEvent) {

        let pressure = event.pressure;

        // if pen is not selected, return
        if (event.pointerType == 'pen') {
            // if pen is not in contact with the screen, return
            if (!event.pressure) {
                return;
            }
        } else {

            // if mouse
            if (event.pointerType != 'mouse') {
                return
            }

            // if pen is in contact with the screen, return
            if (!event.pressure) {
                pressure = 0.5;
            }
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

        console.log('drawing started');
    }

    function handlePointerMove(event: PointerEvent) {
        if (isDrawing) {
            console.log('drawing');

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

            points.push(currentPoint);


            let outsidePoints = []

            for (let i = 0; i < points.length; i++) {

                // if next point is the same as this point, skip both points
                if (i < points.length - 1 && points[i].x == points[i + 1].x && points[i].y == points[i + 1].y) {
                    i++;
                    continue;
                }


                if (i == 0) {
                    let parallelPoints = points[i].getPointsParallelToLineBetweenPoints(points[i + 1]);

                    // push to front
                    outsidePoints.unshift(parallelPoints[0]);

                    continue;
                } else if (i == points.length - 1) {
                    let parallelPoints = points[i].getPointsParallelToLineBetweenPoints(points[i - 1]);

                    // push to back
                    outsidePoints.push(parallelPoints[0]);

                    continue;
                }

                let perpendicularPointsPreviousDirection = points[i].getPointsPerpendicularToLineBetweenPoints(points[i - 1]);
                let perpendicularPointsNextDirection = points[i].getPointsPerpendicularToLineBetweenPoints(points[i + 1]);


                // push to front
                outsidePoints.unshift(perpendicularPointsPreviousDirection[0]);

                // push to back
                outsidePoints.push(perpendicularPointsPreviousDirection[1]);

                // push to front
                outsidePoints.unshift(perpendicularPointsNextDirection[1]);

                // push to back
                outsidePoints.push(perpendicularPointsNextDirection[0]);

            }

            currentSVGStroke = `M ${outsidePoints[0].x} ${outsidePoints[0].y}`;

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

            // // Linear
            // for (let i = 0; i < outsidePoints.length - 1; i += 1) {
            //     currentSVGStroke += ` L ${outsidePoints[i].x} ${outsidePoints[i].y}`;
            // }

            // // Quadratic
            // for (let i = 0; i < outsidePoints.length - 1; i += 1) {
            //     if (i == 0) {
            //         currentSVGStroke += ` Q ${outsidePoints[i].x} ${outsidePoints[i].y} ${outsidePoints[i + 1].x} ${outsidePoints[i + 1].y}`;
            //     } else {
            //         currentSVGStroke += ` T ${outsidePoints[i].x} ${outsidePoints[i].y}`;
            //     }
            // }

            // bezier
            for (let i = 0; i < outsidePoints.length - 2; i += 2) {
                let letter = i == 0 ? 'C' : 'C';
                currentSVGStroke += ` ${letter} ${outsidePoints[i].x} ${outsidePoints[i].y} ${outsidePoints[i + 1].x} ${outsidePoints[i + 1].y} ${outsidePoints[i + 2].x} ${outsidePoints[i + 2].y}`;
            }

            currentSVGElement.setAttribute('d', currentSVGStroke);


        }
    }

    function handlePointerUp(event: PointerEvent) {
        isDrawing = false;

        currentSVGStroke = '';
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