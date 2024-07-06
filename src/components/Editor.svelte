<script lang="ts">
    import "../Posemirror.css"

    import {onMount, onDestroy} from 'svelte'
    import {Editor} from '@tiptap/core'
    import Document from '@tiptap/extension-document'
    import Heading from '@tiptap/extension-heading'
    import Paragraph from '@tiptap/extension-paragraph'
    import Text from '@tiptap/extension-text'
    import Blockquote from '@tiptap/extension-blockquote'
    import BulletList from '@tiptap/extension-bullet-list'
    import ListItem from '@tiptap/extension-list-item'
    import CodeBlock from '@tiptap/extension-code-block'
    import OrderedList from '@tiptap/extension-ordered-list'
    import Typography from '@tiptap/extension-typography'
    import Table from '@tiptap/extension-table'
    import TableCell from '@tiptap/extension-table-cell'
    import TableHeader from '@tiptap/extension-table-header'
    import TableRow from '@tiptap/extension-table-row'
    import TaskItem from '@tiptap/extension-task-item'
    import TaskList from '@tiptap/extension-task-list'
    import Gapcursor from '@tiptap/extension-gapcursor'
    import Bold from '@tiptap/extension-bold'
    import Code from '@tiptap/extension-code'
    import Highlight from '@tiptap/extension-highlight'
    import Italic from '@tiptap/extension-italic'
    import Link from '@tiptap/extension-link'
    import Strike from '@tiptap/extension-strike'
    import Subscript from '@tiptap/extension-subscript'
    import Superscript from '@tiptap/extension-superscript'
    import Underline from '@tiptap/extension-underline'
    import {boldMode, codeMode, currentEditor, highlightMode, italicMode, strikeMode, underlineMode} from "../globals";
    import {History} from "@tiptap/extension-history";
    import {HorizontalRule} from "@tiptap/extension-horizontal-rule";

    let element: HTMLDivElement;
    let editor: Editor;

    onMount(() => {
        editor = new Editor({
            element: element,
            extensions: [
                Document,
                Paragraph,
                Text,
                Blockquote,
                Heading.configure({
                    levels: [1, 2, 3],
                }),
                BulletList.configure({
                    HTMLAttributes: {
                        class: 'pl-5 list-disc',
                    },
                }),
                ListItem,
                CodeBlock,
                OrderedList.configure({
                    HTMLAttributes: {
                        class: 'pl-5 list-decimal',
                    },
                }),
                Typography,
                Table.configure({
                    resizable: true,
                }),
                TableRow,
                TableHeader,
                TableCell,
                TaskList,
                TaskItem.configure({
                    nested: true,
                }),
                Gapcursor,
                Bold,
                Code,
                Highlight,
                Italic,
                Link,
                Strike,
                Subscript,
                Superscript,
                Underline.configure({
                    HTMLAttributes: {
                        class: 'underline-text',
                    },
                }),
                History,
                HorizontalRule,
            ],
            content: '<p>Hello World! 🌍️ </p>',
            onTransaction: () => {
                // force re-render so `editor.isActive` works as expected
                editor = editor;

                boldMode.set(editor.isActive('bold'));
                italicMode.set(editor.isActive('italic'));
                strikeMode.set(editor.isActive('strike'));
                underlineMode.set(editor.isActive('underline'))
                highlightMode.set(editor.isActive('highlight'));
                codeMode.set(editor.isActive('code'));


            },
        })

        currentEditor.set(editor);
    })

    onDestroy(() => {
        if (editor) {
            editor.destroy()
        }
    })
</script>

<div bind:this="{element}" class="editor"/>

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
</style>
