<script lang="ts">
    import {
        CodeBlock, DotsSix, DotsSixVertical,
        Highlighter,
        NotePencil,
        Pen,
        Pencil,
        TextB,
        TextItalic,
        TextStrikethrough,
        TextUnderline
    } from "phosphor-svelte";
    import {writable} from "svelte/store";
    import {boldMode, codeMode, drawMode, highlightMode, italicMode, strikeMode, underlineMode} from "./globals";
    import Toggle from "./Toggle.svelte";
    import {onMount} from "svelte";

    const size = 12;

    let handle: HTMLDivElement;
    let toolbar: HTMLDivElement;

    let isDragging = false;
    let isVertical = false;

    onMount(() => {
        handle.addEventListener("pointerdown", (e) => {
            e.preventDefault();
            isDragging = true;

            toolbar.style.transition = "";
        });

        window.addEventListener("pointermove", (e) => {
            if (isDragging) {
                e.preventDefault();

                const x = e.clientX;
                const y = e.clientY;

                toolbar.style.left = `${x - toolbar.offsetWidth / 2}px`;
                toolbar.style.top = `${y - toolbar.offsetHeight / 2}px`;
                toolbar.style.right = "auto";
                toolbar.style.bottom = "auto";

                toolbar.style.transform = "none";

                // determine closest edge
                const rect = toolbar.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                isVertical = Math.abs(centerX - window.innerWidth / 2) > Math.abs(centerY - window.innerHeight / 2);
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
                    toolbar.style.bottom = centerY > window.innerHeight / 2 ? "10px" : "auto";
                    toolbar.style.left = "50%";
                    toolbar.style.transform = "translateX(-50%)";

                    isVertical = false;

                    console.log("vertical snap to top");
                } else if (Math.abs(centerX - window.innerWidth / 2) > Math.abs(centerY - window.innerHeight / 2)) {
                    toolbar.style.left = centerX > window.innerWidth / 2 ? "auto" : "10px";
                    toolbar.style.right = centerX > window.innerWidth / 2 ? "10px" : "auto";
                    toolbar.style.top = "50%";

                    let translatePercent = centerX > window.innerWidth / 2 ? "translateY(-300%)" : "translateY(300%)";

                    toolbar.style.transform = translatePercent;

                    isVertical = true;
                }

                // play easing animation
                toolbar.style.transition = "top 0.2s, bottom 0.2s, left 0.2s, right 0.2s, transform 0.2s";
            }
        });
    });

</script>

<div class="toolbar" bind:this={toolbar} class:vertical={isVertical} class:horizontal={!isVertical}>

    <div class="handle" bind:this={handle}>
        <DotsSixVertical size={size*1.25}/>
    </div>

    <Toggle store={drawMode}>
        <div class:negative-vertical={isVertical}>
            <Pen size={size}/>
        </div>
    </Toggle>

    <!-- vertical rule  -->
    <div style="height: 1rem; width: 1px; background-color: var(--muted-foreground);"></div>


    <Toggle store={boldMode}>
        <div class:negative-vertical={isVertical}>
            <TextB size={size}/>
        </div>
    </Toggle>

    <Toggle store={italicMode}>
        <div class:negative-vertical={isVertical}>
            <TextItalic size={size}/>
        </div>
    </Toggle>

    <Toggle store={underlineMode}>
        <div class:negative-vertical={isVertical}>
            <TextUnderline size={size}/>
        </div>
    </Toggle>

    <Toggle store={strikeMode}>
        <div class:negative-vertical={isVertical}>
            <TextStrikethrough size={size}/>
        </div>
    </Toggle>

    <Toggle store={highlightMode}>
        <div class:negative-vertical={isVertical}>
            <Highlighter size={size}/>
        </div>
    </Toggle>

    <Toggle store={codeMode}>
        <div class:negative-vertical={isVertical}>
            <CodeBlock size={size}/>
        </div>
    </Toggle>
</div>

<style>
    .button-area {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 10px;
    }

    .non-interactable {
        pointer-events: none;
        touch-action: none;
    }

    .toolbar {
        position: absolute;
        bottom: 10px;
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