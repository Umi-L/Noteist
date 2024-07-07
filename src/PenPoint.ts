import type {Point} from "./Point";

export class PenPoint {
    x: number;
    y: number;
    width: number;

    constructor(event: PointerEvent, drawArea: SVGElement, width: number) {
        let localX = event.clientX - drawArea.getBoundingClientRect().left;
        let localY = event.clientY - drawArea.getBoundingClientRect().top;
        this.x = localX;
        this.y = localY;
        this.width = width;
    }

    getPointsPerpendicularToLineBetweenPoints(other: PenPoint): Point[] {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const udx = dx / length;
        const udy = dy / length;
        const halfWidth = this.width / 2;
        return [
            { x: this.roundToPrecision(this.x + halfWidth * udy), y: this.roundToPrecision(this.y - halfWidth * udx) },
            { x: this.roundToPrecision(this.x - halfWidth * udy), y: this.roundToPrecision(this.y + halfWidth * udx) },
        ];
    }

    getPointsParallelToLineBetweenPoints(other: PenPoint): Point[] {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const udx = dx / length;
        const udy = dy / length;
        const halfWidth = this.width / 2;
        return [
            { x: this.roundToPrecision(this.x + halfWidth * udx), y: this.roundToPrecision(this.y + halfWidth * udy) },
            { x: this.roundToPrecision(this.x - halfWidth * udx), y: this.roundToPrecision(this.y - halfWidth * udy) },
        ];
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