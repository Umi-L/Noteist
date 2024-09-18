<script lang="ts">
    import Moveable, {
        type OnDrag,
        type OnDragEnd,
        type OnDragGroup,
        type OnDragGroupEnd,
        type OnDragGroupStart,
        type OnDragStart,
    } from "svelte-moveable";

    export let usingMoveable: boolean;
    export let moveableKey: number;

    const hideChildMoveableDefaultLines = false;
    const draggable = true;
    const throttleDrag = 0;
    const edgeDraggable = true;
    const startDragRotate = 0;
    const throttleDragRotate = 0;
    const resizable = true;
    const keepRatio = false;
    const throttleResize = 0;
    const renderDirections = ["nw", "n", "ne", "w", "e", "sw", "s", "se"];
    const rotatable = true;
    const throttleRotate = 0;
    const rotationPosition = "top";
    const minWidth = 0;
    const minHeight = 0;
    const maxWidth = 0;
    const maxHeight = 0;
    let moveableRef = null;

    function dragStart(e: OnDragStart) {
        usingMoveable = true;

        // e.set([0, 0]);
        e.target.setAttribute("transform-origin", "center");

        // let beforeTranslate = e.target.getAttribute("beforeTranslate");
        // if (beforeTranslate) {
        //     let beforeTranslateValues = beforeTranslate.split(",");
        //     console.log("beforeTranslateValues", beforeTranslateValues);
        //     e.set([
        //         parseFloat(beforeTranslateValues[0]),
        //         parseFloat(beforeTranslateValues[1]),
        //     ]);
        // }
    }

    function drag(e: OnDrag) {
        console.log("drag", e);

        // set the origin to the center of the element
        if (e.target instanceof SVGElement) {
            let coordinates = getSVGTransformCoordinates(e.target);

            e.target.setAttribute(
                "transform",
                `translate(${coordinates[0] + e.delta[0]}, ${coordinates[1] + e.delta[1]})`,
            );
        } else {
            console.error("drag target is not an SVGElement", e.target);
        }
    }

    function dragEnd(e: OnDragEnd) {
        console.log("drag end", e);
    }

    function dragGroupStart(e: OnDragStart[]) {
        for (const event of e) {
            dragStart(event);
        }
    }

    function dragGroup(e: OnDrag[]) {
        for (const event of e) {
            drag(event);
        }
    }

    function dragGroupEnd(e: OnDragEnd[]) {
        for (const event of e) {
            dragEnd(event);
        }
    }

    function getSVGTransformCoordinates(svgElement: SVGElement) {
        const transform = svgElement.getAttribute("transform");
        if (transform) {
            // get translate(x, y)
            const regex = /translate\(([-]?[\d.]+), ([-]?[\d.]+)\)/;
            const match = transform.match(regex);
            if (match) {
                return [parseFloat(match[1]), parseFloat(match[2])];
            }
        }
        return [0, 0];
    }
</script>

{#key moveableKey}
    <Moveable
        bind:this={moveableRef}
        target={".drawing-selected"}
        {hideChildMoveableDefaultLines}
        {draggable}
        {throttleDrag}
        {edgeDraggable}
        {startDragRotate}
        {throttleDragRotate}
        {resizable}
        {keepRatio}
        {throttleResize}
        {renderDirections}
        {rotatable}
        {throttleRotate}
        {rotationPosition}
        dragArea={true}
        pinchable={true}
        on:dragGroupStart={({ detail: { events } }) => {
            dragGroupStart(events);
        }}
        on:dragGroup={({ detail: { events } }) => {
            dragGroup(events);
        }}
        on:dragGroupEnd={({ detail: { events } }) => {
            dragGroupEnd(events);
        }}
        on:dragStart={({ detail: e }) => {
            dragStart(e);
        }}
        on:drag={({ detail: e }) => {
            drag(e);
        }}
        on:dragEnd={({ detail: e }) => {
            dragEnd(e);
        }}
    />
{/key}
