import { mergeAttributes, Node, wrappingInputRule } from '@tiptap/core'

export interface CalloutOptions {
    /**
     * HTML attributes to add to the Callout element
     * @default {}
     * @example { class: 'foo' }
     */
    HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        Callout: {
            /**
             * Set a Callout node
             */
            setCallout: () => ReturnType,
            /**
             * Toggle a Callout node
             */
            toggleCallout: () => ReturnType,
            /**
             * Unset a Callout node
             */
            unsetCallout: () => ReturnType,
        }
    }
}

/**
 * Matches a Callout to a `>` as input.
 */
export const inputRegex = /^\s*>\s$/

/**
 * This extension allows you to create Callouts.
 * @see https://tiptap.dev/api/nodes/Callout
 */
export const Callout = Node.create<CalloutOptions>({

    name: 'Callout',

    addOptions() {
        return {
            HTMLAttributes: {},
        }
    },

    content: 'block+',

    group: 'block',

    defining: true,

    parseHTML() {
        return [
            { tag: 'aside' },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['aside', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
    },

    addCommands() {
        return {
            setCallout: () => ({ commands }) => {
                return commands.wrapIn(this.name)
            },
            toggleCallout: () => ({ commands }) => {
                return commands.toggleWrap(this.name)
            },
            unsetCallout: () => ({ commands }) => {
                return commands.lift(this.name)
            },
        }
    },

    addKeyboardShortcuts() {
        return {
        }
    },

    addInputRules() {
        return [
            wrappingInputRule({
                find: inputRegex,
                type: this.type,
            }),
        ]
    },
})