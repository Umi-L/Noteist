<script lang="ts">
    import Moveable, {
        type OnDrag,
        type OnDragEnd,
        type OnDragGroup,
        type OnDragGroupEnd,
        type OnDragGroupStart,
        type OnDragStart,
        type OnScale,
    } from "svelte-moveable";
    import { getGroupBoundingBoxRelativeToParent } from "../../utils/boundingBoxUtils";

    export let usingMoveable: boolean;
    export let moveableKey: number;

    const hideChildMoveableDefaultLines = false;
    const draggable = true;
    const throttleDrag = 0;
    const edgeDraggable = true;
    const startDragRotate = 0;
    const throttleDragRotate = 0;
    const resizable = false;
    const scalable = true;
    const keepRatio = true;
    const throttleResize = 0;
    const renderDirections = ["nw", "n", "ne", "w", "e", "sw", "s", "se"];
    const rotatable = false;
    const throttleRotate = 0;
    const rotationPosition = "top";
    const minWidth = 0;
    const minHeight = 0;
    const maxWidth = 0;
    const maxHeight = 0;
    const dragArea = true;
    let moveableRef = null;

    // --- Dragging ---
    function dragStart(e: OnDragStart) {
        usingMoveable = true;

        // e.set([0, 0]);
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
            let transform = getSVGTransform(e.target);

            transform.translate.x += e.delta[0];
            transform.translate.y += e.delta[1];

            setSVGTransformCoordinates(e.target, transform);

            // e.target.setAttribute("transform", stripUnits(e.transform));
        } else {
            console.error("drag target is not an SVGElement", e.target);
        }
    }

    function dragEnd(e: OnDragEnd) {
        // console.log("drag end", e);
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

    // --- Scale ---
    function scaleStart(e: OnDragStart) {
        console.log("scale start", e);
    }

    function scale(e: OnScale) {
        console.log("scale", e);

        if (e.target instanceof SVGElement) {
            let transform = getSVGTransform(e.target);

            transform.scale.x *= e.delta[0];
            transform.scale.y *= e.delta[1];

            setSVGTransformCoordinates(e.target, transform);
        }
    }

    function scaleEnd(e: OnDragEnd) {
        console.log("scale end", e);
    }

    function scaleGroupStart(e: OnDragStart[]) {
        for (const event of e) {
            scaleStart(event);
        }
    }

    function scaleGroup(e: OnScale[], targets: (HTMLElement | SVGElement)[]) {
        // let relativeBox = getGroupBoundingBoxRelativeToParent(targets);
        // let center = {
        //     x: relativeBox.x + relativeBox.width / 2,
        //     y: relativeBox.y + relativeBox.height / 2,
        // };

        for (const event of e) {
            console.log("scale", e);

            if (event.target instanceof SVGElement) {
                let transform = getSVGTransform(event.target);

                transform.scale.x *= event.delta[0];
                transform.scale.y *= event.delta[1];

                // TODO make the element stay centered when scaling

                setSVGTransformCoordinates(event.target, transform);
            } else {
                console.error(
                    "scale target is not an SVGElement",
                    event.target,
                );
            }
        }
    }

    function scaleGroupEnd(e: OnDragEnd[]) {
        for (const event of e) {
            scaleEnd(event);
        }
    }

    // --- Helpers ---
    function getSVGTransform(svgElement: SVGElement) {
        const transform = svgElement.getAttribute("transform");

        let final = {
            translate: { x: 0, y: 0 },
            scale: {
                x: 1,
                y: 1,
            },
        };

        if (transform) {
            // get translate(x, y)
            let regex = /translate\(([-]?[\d.]+), ([-]?[\d.]+)\)/;
            let match = transform.match(regex);
            if (match) {
                final.translate.x = parseFloat(match[1]);
                final.translate.y = parseFloat(match[2]);
            }

            // get scale(x, y)
            regex = /scale\(([-]?[\d.]+), ([-]?[\d.]+)\)/;
            match = transform.match(regex);
            if (match) {
                final.scale.x = parseFloat(match[1]);
                final.scale.y = parseFloat(match[2]);
            }
        }
        return final;
    }

    function setSVGTransformCoordinates(
        svgElement: SVGElement,
        transform: {
            translate: { x: number; y: number };
            scale: { x: number; y: number };
        },
    ) {
        svgElement.setAttribute(
            "transform",
            `translate(${transform.translate.x}, ${transform.translate.y}) scale(${transform.scale.x}, ${transform.scale.y})`,
        );
    }

    function stripUnits(value: string) {
        // replave px with ""
        return value.replaceAll("px", "");
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
        {scalable}
        {keepRatio}
        {throttleResize}
        {renderDirections}
        {rotatable}
        {throttleRotate}
        {rotationPosition}
        {dragArea}
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
        on:scaleGroupStart={({ detail: { events } }) => {
            scaleGroupStart(events);
        }}
        on:scaleGroup={({ detail: { events, targets } }) => {
            scaleGroup(events, targets);
        }}
        on:scaleGroupEnd={({ detail: { events } }) => {
            scaleGroupEnd(events);
        }}
        on:scaleStart={({ detail: e }) => {
            scaleStart(e);
        }}
        on:scale={({ detail: e }) => {
            scale(e);
        }}
        on:scaleEnd={({ detail: e }) => {
            scaleEnd(e);
        }}
    />
{/key}
