import type { Point } from "./Point";

export class PenPoint {
    x: number;
    y: number;
    pressure: number;

    constructor(event: PointerEvent, drawArea: SVGElement, pressure: number) {
        // get the local x and y coordinates of the pointer
        let localX = event.clientX - drawArea.getBoundingClientRect().left;
        let localY = event.clientY - drawArea.getBoundingClientRect().top;

        // account for transform: scale of the drawArea's grandparent
        let parent = drawArea.parentElement!;
        let grandparent = parent.parentElement!;

        let scale = grandparent.style.transform.match(/scale\(([^)]+)\)/);

        if (scale) {
            let scaleValue = parseFloat(scale[1]);
            localX = localX / scaleValue;
            localY = localY / scaleValue;
        }

        this.x = localX;
        this.y = localY;
        this.pressure = pressure;
    }

    equals(other: PenPoint): boolean {
        return this.roundToPrecision(this.x) === this.roundToPrecision(other.x) && this.roundToPrecision(this.y) === this.roundToPrecision(other.y);
    }

    roundToPrecision(value: number): number {
        const decimals = 2;
        const factor = Math.pow(10, decimals);
        return Math.round(value * factor) / factor;
    }
}