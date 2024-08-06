export function isPenEvent(e: PointerEvent) {
    return e.pointerType === "pen" || e.pointerType === "stylus";
}