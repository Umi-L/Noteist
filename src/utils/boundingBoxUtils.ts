export function getBoundingBoxRelativeToParent(element: HTMLElement | SVGElement) {
    let box = element.getBoundingClientRect();
    let parentBox = element.parentElement!.getBoundingClientRect();

    return {
        x: box.x - parentBox.x,
        y: box.y - parentBox.y,
        width: box.width,
        height: box.height
    }
}

export function getGroupBoundingBoxRelativeToParent(elements: (HTMLElement | SVGElement)[]) {
    let x = 0;
    let y = 0;
    let width = 0;
    let height = 0;

    for (const element of elements) {
        let relativeBox = getBoundingBoxRelativeToParent(element);

        x = Math.min(x, relativeBox.x);
        y = Math.min(y, relativeBox.y);
        width = Math.max(width, relativeBox.x + relativeBox.width);
        height = Math.max(height, relativeBox.y + relativeBox.height);
    }

    return {
        x,
        y,
        width,
        height
    }
}