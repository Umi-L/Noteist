<script lang="ts">
    import {
        ArrowClockwise,
        ArrowCounterClockwise,
        CodeBlock, DotsSix, DotsSixVertical, Eraser,
        Highlighter,
        NotePencil,
        Pen,
        Pencil,
        TextB,
        TextItalic,
        TextStrikethrough,
        TextUnderline
    } from "phosphor-svelte";
    import {
        boldMode,
        codeMode, currentDrawColor,
        currentEditor, drawingRedo, drawingTool, drawingUndo,
        drawMode,
        highlightMode,
        italicMode,
        strikeMode,
        underlineMode
    } from "../globals";
    import Toggle from "./Toggle.svelte";
    import {onMount, setContext} from "svelte";
    import type {Editor} from "@tiptap/core";
    import ColorPicker from 'svelte-awesome-color-picker';
    import ColorPickerWrapper from "./ColorPickerWrapper.svelte";
    import {type Writable, writable} from "svelte/store";
    import {AnchorSide} from "../AnchorSide";
    import ToolbarButton from "./ToolbarButton.svelte";
    import SetterToggle from "./SetterToggle.svelte";
    import {EraserTool} from "../Tools/EraserTool";
    import {PenTool} from "../Tools/PenTool";

    const size = 12;

    let handle: HTMLDivElement;
    let toolbar: HTMLDivElement;

    let isDragging = false;
    let isVertical = writable(false);

    let vertical = false;
    isVertical.subscribe(value => {
        vertical = value;
    });

    let isDrawing = false;
    drawMode.subscribe(value => {
        isDrawing = value;
    });

    setContext("vertical", isVertical);

    let colorPickerAnchorSide: Writable<AnchorSide> = writable(AnchorSide.Bottom);
    setContext("colorPickerAnchorSide", colorPickerAnchorSide);

    let editor: Editor | null = null;
    currentEditor.subscribe(value => {
        editor = value;
    });

    let drawColor = "black";
    currentDrawColor.subscribe(value => {
        drawColor = value;
    });

    onMount(() => {
        new ResizeObserver((entries) => {

            const rect = toolbar.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            if (Math.abs(centerX - window.innerWidth / 2) > Math.abs(centerY - window.innerHeight / 2)) {
                let halfWidth = toolbar.offsetWidth / 2 - 25;

                let translatePercent = centerX > window.innerWidth / 2 ? `translateY(-${halfWidth}px)` : `translateY(${halfWidth}px)`;

                toolbar.style.transform = translatePercent;

                console.log("horizontal");
            }
        }).observe(toolbar);

        handle.addEventListener("pointerdown", (e) => {
            e.preventDefault();
            isDragging = true;

            toolbar.style.transition = "";
        });

        window.addEventListener("pointermove", (e) => {
            if (isDragging) {
                e.preventDefault();

                let parentRect = toolbar.parentElement!.getBoundingClientRect();

                const x = e.clientX - parentRect.left;
                const y = e.clientY - parentRect.top;

                toolbar.style.left = `${x - toolbar.offsetWidth / 2}px`;
                toolbar.style.top = `${y - toolbar.offsetHeight / 2}px`;
                toolbar.style.right = "auto";
                toolbar.style.bottom = "auto";

                toolbar.style.transform = "none";

                // determine closest edge
                const rect = toolbar.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                isVertical.set(Math.abs(centerX - window.innerWidth / 2) > Math.abs(centerY - window.innerHeight / 2));

                colorPickerAnchorSide.set(centerX > window.innerWidth / 2 ? AnchorSide.Right : AnchorSide.Left);
                colorPickerAnchorSide.set(centerY > window.innerHeight / 2 ? AnchorSide.Bottom : AnchorSide.Top);

            }
        });

        window.addEventListener("pointerup", () => {
            if (isDragging) {
                isDragging = false;

                // snap to edge
                const rect = toolbar.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                // top, bottom, left, right
                if (Math.abs(centerX - window.innerWidth / 2) < Math.abs(centerY - window.innerHeight / 2)) {
                    toolbar.style.top = centerY > window.innerHeight / 2 ? "auto" : "10px";
                    toolbar.style.bottom = centerY > window.innerHeight / 2 ? "calc(env(keyboard-inset-height, 0px) + 10px)" : "auto";
                    toolbar.style.left = "50%";
                    toolbar.style.transform = "translateX(-50%)";

                    colorPickerAnchorSide.set(centerY > window.innerHeight / 2 ? AnchorSide.Bottom : AnchorSide.Top);

                    isVertical.set(false);
                } else if (Math.abs(centerX - window.innerWidth / 2) > Math.abs(centerY - window.innerHeight / 2)) {
                    toolbar.style.left = centerX > window.innerWidth / 2 ? "auto" : "10px";
                    toolbar.style.right = centerX > window.innerWidth / 2 ? "10px" : "auto";
                    toolbar.style.top = "50%";

                    colorPickerAnchorSide.set(centerX > window.innerWidth / 2 ? AnchorSide.Right : AnchorSide.Left);

                    let halfWidth = toolbar.offsetWidth / 2 - 25;

                    let translatePercent = centerX > window.innerWidth / 2 ? `translateY(-${halfWidth}px)` : `translateY(${halfWidth}px)`;

                    toolbar.style.transform = translatePercent;

                    isVertical.set(true);
                }


                // play easing animation
                toolbar.style.transition = "top 0.2s, bottom 0.2s, left 0.2s, right 0.2s, transform 0.2s";
            }
        });
    });

    boldMode.subscribe(value => {
        if (editor) {
            if (value) {
                editor.chain().focus().setBold().run();
            } else {
                editor.chain().focus().unsetBold().run();
            }
        }
    });

    italicMode.subscribe(value => {
        if (editor) {
            if (value) {
                editor.chain().focus().setItalic().run();
            } else {
                editor.chain().focus().unsetItalic().run();
            }
        }
    });

    underlineMode.subscribe(value => {
        if (editor) {
            if (value) {
                editor.chain().focus().setUnderline().run();
            } else {
                editor.chain().focus().unsetUnderline().run();
            }
        }
    });

    strikeMode.subscribe(value => {
        if (editor) {
            if (value) {
                editor.chain().focus().setStrike().run();
            } else {
                editor.chain().focus().unsetStrike().run();
            }
        }
    });

    highlightMode.subscribe(value => {
        if (editor) {
            if (value) {
                editor.chain().focus().setHighlight().run();
            } else {
                editor.chain().focus().unsetHighlight().run();
            }
        }
    });

    codeMode.subscribe(value => {
        if (editor) {
            if (value) {
                editor.chain().focus().setCode().run();
            } else {
                editor.chain().focus().unsetCode().run();
            }
        }
    });

</script>

<div class="toolbar" bind:this={toolbar} class:vertical={vertical} class:horizontal={!vertical}>

    <div class="handle" bind:this={handle}>
        <DotsSixVertical size={size*1.25}/>
    </div>

    <Toggle store={drawMode}>
        <div class:negative-vertical={vertical}>
            <Pen size={size}/>
        </div>
    </Toggle>

    <!-- vertical rule  -->
    <div style="height: 1rem; width: 1px; background-color: var(--muted-foreground);"></div>

    {#if !isDrawing}
        <Toggle store={boldMode}>
            <div class:negative-vertical={vertical}>
                <TextB size={size}/>
            </div>
        </Toggle>

        <Toggle store={italicMode}>
            <div class:negative-vertical={vertical}>
                <TextItalic size={size}/>
            </div>
        </Toggle>

        <Toggle store={underlineMode}>
            <div class:negative-vertical={vertical}>
                <TextUnderline size={size}/>
            </div>
        </Toggle>

        <Toggle store={strikeMode}>
            <div class:negative-vertical={vertical}>
                <TextStrikethrough size={size}/>
            </div>
        </Toggle>

        <Toggle store={highlightMode}>
            <div class:negative-vertical={vertical}>
                <Highlighter size={size}/>
            </div>
        </Toggle>

        <Toggle store={codeMode}>
            <div class:negative-vertical={vertical}>
                <CodeBlock size={size}/>
            </div>
        </Toggle>
    {:else}
        <SetterToggle store={drawingTool} value={new PenTool()} typeOnlyCheck={true}>
            <div class:negative-vertical={vertical}>
                <Pen size={size}/>
            </div>
        </SetterToggle>
        <SetterToggle store={drawingTool} value={new EraserTool()} typeOnlyCheck={true}>
            <div class:negative-vertical={vertical}>
                <Eraser size={size}/>
            </div>
        </SetterToggle>
    {/if}

    <!-- vertical rule  -->
    <div style="height: 1rem; width: 1px; background-color: var(--muted-foreground);"></div>

    <ToolbarButton pressedCallback={() => {
        if (!isDrawing) {
            if (editor) {
                editor.chain().focus().undo().run();
            }
        } else {
            drawingUndo.update((func)=>{
                if (func) {
                    func();
                }
                return func;
            });
        }
    }}>
        <div class:negative-vertical={vertical}>

            <ArrowCounterClockwise size={size}/>
        </div>
    </ToolbarButton>

    <ToolbarButton pressedCallback={() => {
        if (!isDrawing) {
            if (editor) {
                editor.chain().focus().redo().run();
            }
        } else {
            drawingRedo.update((func)=>{
                if (func) {
                    func();
                }
                return func;
            });
        }
    }}>
        <div class:negative-vertical={vertical}>

            <ArrowClockwise size={size}/>
        </div>
    </ToolbarButton>


    <ColorPicker components={{wrapper: ColorPickerWrapper}} label="" bind:hex={drawColor} on:input={(event)=>{
        if (event.detail.color)
            currentDrawColor.set(event.detail.color.toHex());
    }}/>
</div>

<style>
    .toolbar {
        position: absolute;
        bottom: calc(calc(env(keyboard-inset-height, 0px) + env(keyboard-inset-bottom, 0px)) + 10px);
        right: 50%;
        transform: translateX(50%);

        z-index: 1000;

        background-color: var(--muted);
        padding: 5px;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

        border: 1px solid var(--border);

        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 10px;

        transition: rotate 0.2s ease-out;

        user-select: none;
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

</style>