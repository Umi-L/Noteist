<script lang="ts">
    import "../../Posemirror.css";

    import { onMount, onDestroy } from "svelte";
    import { Editor } from "@tiptap/core";
    import Document from "@tiptap/extension-document";
    import Heading from "@tiptap/extension-heading";
    import Paragraph from "@tiptap/extension-paragraph";
    import Text from "@tiptap/extension-text";
    import Blockquote from "@tiptap/extension-blockquote";
    import BulletList from "@tiptap/extension-bullet-list";
    import ListItem from "@tiptap/extension-list-item";
    import CodeBlock from "@tiptap/extension-code-block";
    import OrderedList from "@tiptap/extension-ordered-list";
    import Typography from "@tiptap/extension-typography";
    import Table from "@tiptap/extension-table";
    import TableCell from "@tiptap/extension-table-cell";
    import TableHeader from "@tiptap/extension-table-header";
    import TableRow from "@tiptap/extension-table-row";
    import TaskItem from "@tiptap/extension-task-item";
    import TaskList from "@tiptap/extension-task-list";
    import Gapcursor from "@tiptap/extension-gapcursor";
    import Bold from "@tiptap/extension-bold";
    import Code from "@tiptap/extension-code";
    import Highlight from "@tiptap/extension-highlight";
    import Italic from "@tiptap/extension-italic";
    import Link from "@tiptap/extension-link";
    import Strike from "@tiptap/extension-strike";
    import Subscript from "@tiptap/extension-subscript";
    import Superscript from "@tiptap/extension-superscript";
    import Underline from "@tiptap/extension-underline";
    import {
        boldMode,
        codeMode,
        currentEditor,
        currentNote,
        drawMode,
        editorChangeListeners,
        highlightMode,
        italicMode,
        strikeMode,
        underlineMode,
    } from "../../globals";
    import { History } from "@tiptap/extension-history";
    import { HorizontalRule } from "@tiptap/extension-horizontal-rule";
    import SlashCommand from "../../extensions/SlashCommand/slash-command";
    import Placeholder from "@tiptap/extension-placeholder";
    import { Callout } from "../../extensions/Callout/callout";
    import type { Note } from "../../noteUtils";
    import Image from "@tiptap/extension-image";
    import UploadImagesPlugin, {
        startImageUpload,
    } from "../../plugins/uploadImages";
    import ImageResizer from "../../extensions/ImageResizer/ImageResizer.svelte";
    import { Settings } from "../../settings";
    import { isPenEvent } from "../../utils";

    export let onLoadedData: (editor: Editor) => void;

    let element: HTMLDivElement;
    let editor: Editor;
    let note: Note | null = null;

    let hasFetchedContent = false;

    let detectDrawingMode: boolean;
    Settings.general.detectDrawingMode.subscribe((value) => {
        detectDrawingMode = value;
    });

    currentNote.subscribe(async (_note) => {
        if (editor && _note) {
            hasFetchedContent = false;
            let content = await _note.getHTMLContent();

            console.log("content", content);
            editor.commands.setContent(content as string);

            hasFetchedContent = true;

            onLoadedData(editor);
        }

        note = _note;
    });

    onMount(() => {
        // TODO ideal solution but can't get it to work :(
        // element.addEventListener("pointerdown", (event) => {
        //     if (detectDrawingMode && isPenEvent(event)) {
        //         drawMode.set(true);

        //         event.preventDefault();
        //         event.stopImmediatePropagation();

        //         requestAnimationFrame(() => {
        //             editor.commands.blur();
        //         });
        //         editor.commands.blur();

        //         return;
        //     }
        // });

        element.addEventListener("click", (event) => {
            let editorPos = editor.view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
            });

            if (!editorPos) return;

            while (editorPos!.inside === -1) {
                const endPos = editor.state.doc.content.size;

                // add new line to the end of the document
                editor
                    .chain()
                    .focus()
                    .insertContentAt(endPos, {
                        type: "paragraph",
                        content: [],
                    })
                    .run();
                editorPos = editor.view.posAtCoords({
                    left: event.clientX,
                    top: event.clientY,
                });
            }
        });

        editor = new Editor({
            element: element,
            extensions: [
                Document,
                Paragraph,
                Text,
                Blockquote.configure({
                    HTMLAttributes: {
                        class: "quote-block",
                    },
                }),
                Heading.configure({
                    levels: [1, 2, 3],
                }),
                BulletList.configure({
                    HTMLAttributes: {
                        class: "pl-5 list-disc",
                    },
                }),
                ListItem.configure({
                    HTMLAttributes: {
                        class: "leading-normal mb-1 mt-1",
                    },
                }),
                CodeBlock,
                OrderedList.configure({
                    HTMLAttributes: {
                        class: "pl-5 list-decimal",
                    },
                }),
                Typography,
                Table.configure({
                    resizable: true,
                }),
                TableRow,
                TableHeader.configure({
                    HTMLAttributes: {
                        class: "p-2 border border-s-2 no-placeholder",
                    },
                }),
                TableCell.configure({
                    HTMLAttributes: {
                        class: "p-2 border border-s-2 no-placeholder",
                    },
                }),
                Image.extend({
                    addProseMirrorPlugins() {
                        return [UploadImagesPlugin()];
                    },

                    addAttributes() {
                        return {
                            ...this.parent?.(),
                            width: {
                                default: null,
                            },
                            height: {
                                default: null,
                            },
                        };
                    },
                }).configure({
                    allowBase64: true,
                    HTMLAttributes: {
                        class: "rounded-lg",
                    },
                }),
                Placeholder.configure({
                    placeholder: ({ node }: any) => {
                        if (node.type.name === "heading") {
                            return `Heading ${node.attrs.level}`;
                        }
                        return "Type or press / for commands";
                    },

                    includeChildren: true,
                }),
                TaskList.configure({
                    HTMLAttributes: {
                        class: "not-prose pl-2",
                    },
                }),
                TaskItem.configure({
                    HTMLAttributes: {
                        class: "flex items-start my-1 checkbox-node",
                    },
                    nested: true,
                }),
                Gapcursor,
                Bold,
                Code,
                Highlight.configure({
                    multicolor: true,
                    HTMLAttributes: {
                        class: "rounded-sm opacity-80",
                    },
                }),
                Italic,
                Link,
                Strike,
                Subscript,
                Superscript,
                Underline.configure({
                    HTMLAttributes: {
                        class: "underline-text pl-0.5",
                    },
                }),
                History,
                HorizontalRule,
                Callout.configure({
                    HTMLAttributes: {
                        class: "callout-block",
                    },
                }),
                SlashCommand,
                CodeBlock.configure({
                    HTMLAttributes: {
                        class: "rounded-sm p-5 font-mono font-medium code-block my-2",
                    },
                }),
            ],
            content: " ",
            onTransaction: () => {
                // force re-render so `editor.isActive` works as expected
                editor = editor;

                boldMode.set(editor.isActive("bold"));
                italicMode.set(editor.isActive("italic"));
                strikeMode.set(editor.isActive("strike"));
                underlineMode.set(editor.isActive("underline"));
                highlightMode.set(editor.isActive("highlight"));
                codeMode.set(editor.isActive("code"));

                editorChangeListeners.forEach((listener) => listener(editor));

                if (note !== null && hasFetchedContent) {
                    note.setHTMLContent(editor.getHTML());
                }
            },
            editorProps: {
                handlePaste: (view, event) => {
                    if (
                        event.clipboardData &&
                        event.clipboardData.files &&
                        event.clipboardData.files[0]
                    ) {
                        event.preventDefault();
                        const file = event.clipboardData.files[0];
                        const pos = view.state.selection.from;

                        startImageUpload(file, view, pos);
                        return true;
                    }
                    return false;
                },
                handleDrop: (view, event, _slice, moved) => {
                    if (
                        !moved &&
                        event.dataTransfer &&
                        event.dataTransfer.files &&
                        event.dataTransfer.files[0]
                    ) {
                        event.preventDefault();
                        const file = event.dataTransfer.files[0];
                        const coordinates = view.posAtCoords({
                            left: event.clientX,
                            top: event.clientY,
                        });

                        const cursorPos = view.state.selection.from;

                        let posToDrop = coordinates?.pos || cursorPos;

                        // here we deduct 1 from the pos or else the image will create an extra node
                        posToDrop -= 1;

                        console.log("dragged coordinates", coordinates);
                        console.log("cursorPos", cursorPos);
                        console.log("dropping at", posToDrop);

                        startImageUpload(file, view, posToDrop);
                        return true;
                    }
                    return false;
                },
                handleDOMEvents: {
                    keydown: (_view, event) => {
                        // prevent default event listeners from firing when slash command is active
                        if (
                            ["ArrowUp", "ArrowDown", "Enter"].includes(
                                event.key
                            )
                        ) {
                            const slashCommand =
                                document.querySelector("#slash-command");
                            if (slashCommand) {
                                return true;
                            }
                        }
                    },
                },
            },
        });

        if (note && !hasFetchedContent) {
            note.getHTMLContent().then((content) => {
                editor.commands.setContent(content as string);

                onLoadedData(editor);
            });
        }

        currentEditor.set(editor);
    });

    onDestroy(() => {
        if (editor) {
            editor.destroy();
        }
    });
</script>

<div bind:this={element} class="editor">
    {#if editor?.isActive("image")}
        <ImageResizer {editor} />
    {/if}
</div>

<style>
    button.active {
        background: black;
        color: white;
    }

    .editor {
        width: 100%;
        height: 100%;

        padding: 1rem;
    }

    :global(.ProseMirror) {
        width: 100%;
        height: 100%;

        border: none;
        outline: none;
    }

    :global(.code-block) {
        background-color: var(--muted);
    }

    :global(.checkbox-node input) {
        @apply checkbox-sm;
    }

    :global(.quote-block) {
        border-color: var(--foreground);
        @apply p-2 my-2 border-s-2;
    }

    :global(.no-placeholder) {
        content: "";
        position: relative;
    }

    :global(.no-placeholder .is-empty:first-child::before) {
        content: "";
        position: relative;
    }

    :global(.column-resize-handle) {
        background-color: var(--primary);
        bottom: -2px;
        pointer-events: none;
        position: absolute;
        right: -2px;
        top: 0;
        width: 4px;
    }

    :global(.callout-block) {
        background-color: var(--muted);
        border: 1px solid var(--muted-foreground);
        border-radius: 5px;
        @apply p-4 my-2;
    }
</style>
