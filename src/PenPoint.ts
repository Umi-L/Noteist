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
            { x: Math.round(this.x + halfWidth * udy), y: Math.round(this.y - halfWidth * udx) },
            { x: Math.round(this.x - halfWidth * udy), y: Math.round(this.y + halfWidth * udx) },
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
            { x: Math.round(this.x + halfWidth * udx), y: Math.round(this.y + halfWidth * udy) },
            { x: Math.round(this.x - halfWidth * udx), y: Math.round(this.y - halfWidth * udy) },
        ];
    }

    equals(other: PenPoint): boolean {
        return Math.round(this.x) === Math.round(other.x) && Math.round(this.y) === Math.round(other.y);
    }
}