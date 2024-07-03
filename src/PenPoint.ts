import type {Point} from "./Point";

export class PenPoint {
    x: number;
    y: number;
    width: number;

    constructor(public x: number, public y: number, width: number) {
        this.x = x;
        this.y = y;
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
            { x: this.x + halfWidth * udy, y: this.y - halfWidth * udx },
            { x: this.x - halfWidth * udy, y: this.y + halfWidth * udx },
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
            { x: this.x + halfWidth * udx, y: this.y + halfWidth * udy },
            { x: this.x - halfWidth * udx, y: this.y - halfWidth * udy },
        ];
    }
}