<script lang="ts">
    import {
        ArrowClockwise,
        ArrowCounterClockwise,
        CodeBlock,
        DotsSix,
        DotsSixVertical,
        Eraser,
        Highlighter,
        NotePencil,
        Pen,
        Pencil,
        ScribbleLoop,
        Selection,
        TextB,
        TextItalic,
        TextStrikethrough,
        TextUnderline,
        X,
    } from "phosphor-svelte";
    import {
        boldMode,
        codeMode,
        currentDrawColor,
        currentEditor,
        drawingRedo,
        drawingTool,
        drawingUndo,
        drawMode,
        highlightMode,
        italicMode,
        strikeMode,
        underlineMode,
    } from "../../globals";
    import Toggle from "./Toggle.svelte";
    import { onMount, setContext } from "svelte";
    import type { Editor } from "@tiptap/core";
    import ColorPicker from "svelte-awesome-color-picker";
    import { type Writable, writable } from "svelte/store";
    import { AnchorSide } from "../../AnchorSide";
    import ToolbarButton from "./ToolbarButton.svelte";
    import SetterToggle from "./SetterToggle.svelte";
    import { EraserTool } from "../../Tools/EraserTool";
    import { PenTool } from "../../Tools/PenTool";
    import { SelectTool } from "../../Tools/SelectTool";

    export let maxWidth: number;
    export let maxHeight: number;
    export let toolbarWrapper: HTMLDivElement;

    const size = 16;

    let handle: HTMLDivElement;
    let toolbar: HTMLDivElement;
    let colorPickerWrapper: HTMLDialogElement;

    let isDragging = false;
    let isVertical = writable(false);

    let toolbarSide: AnchorSide | null = AnchorSide.Bottom;

    let vertical = false;
    isVertical.subscribe((value) => {
        vertical = value;
    });

    let isDrawing = false;
    drawMode.subscribe((value) => {
        isDrawing = value;
    });

    setContext("vertical", isVertical);

    let editor: Editor | null = null;
    currentEditor.subscribe((value) => {
        editor = value;
    });

    let drawColor = "black";
    currentDrawColor.subscribe((value) => {
        drawColor = value;
    });

    function start(e: MouseEvent | TouchEvent): void {
        e.preventDefault();
        isDragging = true;

        toolbarSide = null;

        let parentRect = toolbarWrapper.getBoundingClientRect();

        const x = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
        const y = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;

        toolbar.style.left = `${x - parentRect.left - toolbar.offsetWidth / 2}px`;
        toolbar.style.top = `${y - parentRect.top - toolbar.offsetHeight / 2}px`;
        toolbar.style.transform = "none";
    }

    function move(e: MouseEvent | TouchEvent): void {
        if (isDragging) {
            e.preventDefault();

            const parentRect = toolbarWrapper.getBoundingClientRect();

            const x =
                e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
            const y =
                e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;

            toolbar.style.left = `${x - parentRect.left - toolbar.offsetWidth / 2}px`;
            toolbar.style.top = `${y - parentRect.top - toolbar.offsetHeight / 2}px`;
            toolbar.style.transform = "none";

            // determine closest edge
            const toolbarRect = toolbar.getBoundingClientRect();
            let centerX = toolbarRect.left + toolbarRect.width / 2;
            let centerY = toolbarRect.top + toolbarRect.height / 2;

            // make centerX and centerY relative to the toolbarWrapper
            centerX -= parentRect.left;
            centerY -= parentRect.top;

            isVertical.set(
                Math.abs(centerX - parentRect.width / 2) >
                    Math.abs(centerY - parentRect.height / 2),
            );
        }
    }

    function end(e: MouseEvent | TouchEvent): void {
        if (isDragging) {
            isDragging = false;

            const parentRect = toolbarWrapper.getBoundingClientRect();

            // snap to edge
            const toolbarRect = toolbar.getBoundingClientRect();
            let centerX = toolbarRect.left + toolbarRect.width / 2;
            let centerY = toolbarRect.top + toolbarRect.height / 2;

            // make centerX and centerY relative to the toolbarWrapper
            centerX -= parentRect.left;
            centerY -= parentRect.top;

            // if the toolbar is closer to the top or bottom edge
            if (
                Math.abs(centerX - parentRect.width / 2) <
                Math.abs(centerY - parentRect.height / 2)
            ) {
                let side =
                    centerY > parentRect.height / 2
                        ? AnchorSide.Bottom
                        : AnchorSide.Top;
                toolbarSide = side;

                isVertical.set(false);
            } else if (
                // if the toolbar is closer to the left or right edge
                Math.abs(centerX - parentRect.width / 2) >
                Math.abs(centerY - parentRect.height / 2)
            ) {
                let side =
                    centerX > parentRect.width / 2
                        ? AnchorSide.Right
                        : AnchorSide.Left;

                toolbarSide = side;

                isVertical.set(true);
            }

            // clear toolbar styles
            toolbar.style.left = "";
            toolbar.style.top = "";
            toolbar.style.transform = "";
        }
    }

    $: if (toolbarWrapper) {
        // touch events
        handle.addEventListener("touchstart", start);
        window.addEventListener("touchmove", move);
        window.addEventListener("touchend", end);

        // mouse events
        handle.addEventListener("mousedown", start);
        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", end);
    }

    onMount(() => {
        function updateWidth() {
            // set css variable for toolbar width
            toolbar.style.setProperty(
                "--toolbar-width",
                `${toolbar.offsetWidth}px`,
            );
        }

        // listen for toolbar resize and update width
        let resizeObserver = new ResizeObserver(() => {
            updateWidth();
        });

        resizeObserver.observe(toolbar);

        // initial width
        updateWidth();

        return () => {
            handle.removeEventListener("touchstart", start);
            window.removeEventListener("touchmove", move);
            window.removeEventListener("touchend", end);

            handle.removeEventListener("mousedown", start);
            window.removeEventListener("mousemove", move);
            window.removeEventListener("mouseup", end);

            resizeObserver.disconnect();
        };
    });

    boldMode.subscribe((value) => {
        if (editor) {
            if (value) {
                editor.chain().focus().setBold().run();
            } else {
                editor.chain().focus().unsetBold().run();
            }
        }
    });

    italicMode.subscribe((value) => {
        if (editor) {
            if (value) {
                editor.chain().focus().setItalic().run();
            } else {
                editor.chain().focus().unsetItalic().run();
            }
        }
    });

    underlineMode.subscribe((value) => {
        if (editor) {
            if (value) {
                editor.chain().focus().setUnderline().run();
            } else {
                editor.chain().focus().unsetUnderline().run();
            }
        }
    });

    strikeMode.subscribe((value) => {
        if (editor) {
            if (value) {
                editor.chain().focus().setStrike().run();
            } else {
                editor.chain().focus().unsetStrike().run();
            }
        }
    });

    highlightMode.subscribe((value) => {
        if (editor) {
            if (value) {
                editor.chain().focus().setHighlight().run();
            } else {
                editor.chain().focus().unsetHighlight().run();
            }
        }
    });

    codeMode.subscribe((value) => {
        if (editor) {
            if (value) {
                editor.chain().focus().setCode().run();
            } else {
                editor.chain().focus().unsetCode().run();
            }
        }
    });
</script>

<dialog class="modal color-picker-wrapper" bind:this={colorPickerWrapper}>
    <div class="modal-box">
        <form method="dialog">
            <button
                class="btn btn-sm btn-circle btn-ghost absolute right-1 top-1"
                ><X /></button
            >
        </form>
        <ColorPicker
            label=""
            isDialog={false}
            bind:hex={drawColor}
            on:input={(event) => {
                if (event.detail.color)
                    currentDrawColor.set(event.detail.color.toHex());
            }}
        />
    </div>
    <form method="dialog" class="modal-backdrop">
        <button>close</button>
    </form>
</dialog>
<div
    class="toolbar"
    bind:this={toolbar}
    class:vertical
    class:horizontal={!vertical}
    class:top={toolbarSide === AnchorSide.Top}
    class:bottom={toolbarSide === AnchorSide.Bottom}
    class:left={toolbarSide === AnchorSide.Left}
    class:right={toolbarSide === AnchorSide.Right}
    class:transition={!isDragging}
>
    <div class="handle" bind:this={handle}>
        <DotsSixVertical size={size * 1.25} />
    </div>

    <Toggle store={drawMode}>
        <div class:negative-vertical={vertical}>
            <ScribbleLoop {size} />
        </div>
    </Toggle>

    <!-- vertical rule  -->
    <div
        style="height: 1rem; width: 1px; background-color: var(--muted-foreground);"
    ></div>

    {#if !isDrawing}
        <Toggle store={boldMode}>
            <div class:negative-vertical={vertical}>
                <TextB {size} />
            </div>
        </Toggle>

        <Toggle store={italicMode}>
            <div class:negative-vertical={vertical}>
                <TextItalic {size} />
            </div>
        </Toggle>

        <Toggle store={underlineMode}>
            <div class:negative-vertical={vertical}>
                <TextUnderline {size} />
            </div>
        </Toggle>

        <Toggle store={strikeMode}>
            <div class:negative-vertical={vertical}>
                <TextStrikethrough {size} />
            </div>
        </Toggle>

        <Toggle store={highlightMode}>
            <div class:negative-vertical={vertical}>
                <Highlighter {size} />
            </div>
        </Toggle>

        <Toggle store={codeMode}>
            <div class:negative-vertical={vertical}>
                <CodeBlock {size} />
            </div>
        </Toggle>
    {:else}
        <SetterToggle
            store={drawingTool}
            value={new PenTool()}
            typeOnlyCheck={true}
        >
            <div class:negative-vertical={vertical}>
                <Pen {size} />
            </div>
        </SetterToggle>
        <SetterToggle
            store={drawingTool}
            value={new EraserTool()}
            typeOnlyCheck={true}
        >
            <div class:negative-vertical={vertical}>
                <Eraser {size} />
            </div>
        </SetterToggle>
        <SetterToggle
            store={drawingTool}
            value={new SelectTool()}
            typeOnlyCheck={true}
        >
            <div class:negative-vertical={vertical}>
                <Selection {size} />
            </div>
        </SetterToggle>
    {/if}

    <!-- vertical rule  -->
    <div
        style="height: 1rem; width: 1px; background-color: var(--muted-foreground);"
    ></div>

    <ToolbarButton
        pressedCallback={() => {
            if (!isDrawing) {
                if (editor) {
                    editor.chain().focus().undo().run();
                }
            } else {
                drawingUndo.update((func) => {
                    if (func) {
                        func();
                    }
                    return func;
                });
            }
        }}
    >
        <div class:negative-vertical={vertical}>
            <ArrowCounterClockwise {size} />
        </div>
    </ToolbarButton>

    <ToolbarButton
        pressedCallback={() => {
            if (!isDrawing) {
                if (editor) {
                    editor.chain().focus().redo().run();
                }
            } else {
                drawingRedo.update((func) => {
                    if (func) {
                        func();
                    }
                    return func;
                });
            }
        }}
    >
        <div class:negative-vertical={vertical}>
            <ArrowClockwise {size} />
        </div>
    </ToolbarButton>

    <ToolbarButton
        pressedCallback={() => {
            colorPickerWrapper.showModal();
        }}
        buttonType="btn btn-sm btn-square"
        noBaseClasses={true}
    >
        <div
            class="circle"
            style={`background-color: ${$currentDrawColor};`}
        ></div></ToolbarButton
    >
</div>

<style>
    .toolbar {
        --bottomDistance: calc(
            env(keyboard-inset-height, 0px) + env(keyboard-inset-bottom, 0px) +
                var(--safe-area-inset-bottom) * 2 + 10px
        );
        --leftDistance: calc(10px - var(--toolbar-width) / 2);
        --rightDistance: calc(10px + var(--toolbar-width) / 2);
        --topDistance: calc(
            env(keyboard-inset-height, 0px) + env(keyboard-inset-top, 0px) +
                var(--safe-area-inset-top) * 2 + 10px
        );

        position: absolute;

        z-index: 1000;

        background-color: var(--muted);
        padding: 5px;
        border-radius: 10px;
        box-shadow: var(--shadow);

        border: 1px solid var(--border);

        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 10px;

        transition: rotate 0.2s ease-out;

        user-select: none;
        pointer-events: all;

        overflow-x: auto;
    }

    .vertical {
        rotate: 90deg;
    }

    .negative-vertical {
        rotate: -90deg;
    }

    .handle {
        cursor: move;
        user-select: none;
        padding: 0 0.5rem;
    }

    :global(.toolbar .container) {
        padding: 0 !important;
    }

    .bottom {
        top: calc(100% - var(--bottomDistance));

        left: 50%;

        /* translate x and y */
        transform: translate(-50%, -100%);
    }

    .top {
        top: var(--topDistance);

        left: 50%;

        /* translate x and y */
        transform: translate(-50%, 0);
    }

    .left {
        top: 50%;

        left: var(--leftDistance);

        /* translate x and y */
        transform: translate(0, -50%);
    }

    .right {
        top: 50%;

        left: calc(100% - var(--rightDistance));

        /* translate x and y */
        transform: translate(0, 50%);
    }

    .transition {
        transition: 0.2s ease-out;
    }

    .modal-box {
        width: auto !important;
    }

    .color-picker-wrapper {
        --cp-bg-color: var(--muted);
        --cp-border-color: var(--border);
        --cp-text-color: var(--foreground);
        --cp-input-color: var(--double-muted);
        --cp-button-hover-color: var(--muted-foreground);
    }

    .hidden {
        display: none !important;
    }

    .circle {
        width: 100%;
        height: 100%;
        border-radius: 50%;
    }
</style>
