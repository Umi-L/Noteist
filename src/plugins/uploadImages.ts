// import { BlobResult } from "@vercel/blob";
// import { toast } from "sonner";
import { EditorState, Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet, EditorView } from '@tiptap/pm/view';
import { addToast } from '../globals';

const uploadKey = new PluginKey('upload-image');

const UploadImagesPlugin = () =>
    new Plugin({
        key: uploadKey,
        state: {
            init() {
                return DecorationSet.empty;
            },
            apply(tr, set) {
                set = set.map(tr.mapping, tr.doc);
                // See if the transaction adds or removes any placeholders
                const action = tr.getMeta(this as any);
                if (action && action.add) {
                    const { id, pos, src } = action.add;

                    const placeholder = document.createElement('div');
                    placeholder.setAttribute('class', 'img-placeholder');
                    const image = document.createElement('img');
                    image.setAttribute('class', 'opacity-40 rounded-lg border border-stone-200');
                    image.src = src;
                    placeholder.appendChild(image);
                    const deco = Decoration.widget(pos + 1, placeholder, {
                        id
                    });
                    set = set.add(tr.doc, [deco]);
                } else if (action && action.remove) {
                    set = set.remove(
                        set.find(null as any, null as any, (spec) => spec.id == action.remove.id)
                    );
                }
                return set;
            }
        },
        props: {
            decorations(state) {
                return this.getState(state);
            }
        }
    });

export default UploadImagesPlugin;

function findPlaceholder(state: EditorState, id: any) {
    const decos = uploadKey.getState(state);
    const found = decos.find(null, null, (spec: any) => spec.id == id);
    return found.length ? found[0].from : null;
}

export function startImageUpload(file: File, view: EditorView, pos: number) {
    // check if the file is an image
    if (!file.type.includes('image/')) {
        addToast({
            data: {
                text: 'File type not supported.',
                type: 'error'
            }
        });
        return;

        // check if the file size is less than 20MB
    } else if (file.size / 1024 / 1024 > 20) {
        addToast({
            data: {
                text: 'File size too big (max 20MB).',
                type: 'error'
            }
        });

        return;
    }

    // A fresh object to act as the ID for this upload
    const id = {};

    // Replace the selection with a placeholder
    const tr = view.state.tr;
    if (!tr.selection.empty) tr.deleteSelection();

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        tr.setMeta(uploadKey, {
            add: {
                id,
                pos,
                src: reader.result
            }
        });
        view.dispatch(tr);
    };

    handleImageUpload(file).then((src) => {
        const { schema } = view.state;

        const pos = findPlaceholder(view.state, id);
        // If the content around the placeholder has been deleted, drop
        // the image
        if (pos == null) return;

        // Otherwise, insert it at the placeholder's position, and remove
        // the placeholder

        // When BLOB_READ_WRITE_TOKEN is not valid or unavailable, read
        // the image locally
        const imageSrc = typeof src === 'object' ? reader.result : src;

        const node = schema.nodes.image.create({ src: imageSrc });
        const transaction = view.state.tr
            .replaceWith(pos, pos, node)
            .setMeta(uploadKey, { remove: { id } });
        view.dispatch(transaction);
    });
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const handleImageUpload = async (file: File) => {
    await sleep(1000);
    return file;
    // upload to Vercel Blob
    // return new Promise((resolve) => {
    // 	// toast.promise(
    // 	//   fetch("/api/upload", {
    // 	//     method: "POST",
    // 	//     headers: {
    // 	//       "content-type": file?.type || "application/octet-stream",
    // 	//       "x-vercel-filename": file?.name || "image.png",
    // 	//     },
    // 	//     body: file,
    // 	//   }).then(async (res) => {
    // 	//     // Successfully uploaded image
    // 	//     if (res.status === 200) {
    // 	//       const { url } = (await res.json()) as BlobResult;
    // 	//       // preload the image
    // 	//       let image = new Image();
    // 	//       image.src = url;
    // 	//       image.onload = () => {
    // 	//         resolve(url);
    // 	//       };
    // 	//       // No blob store configured
    // 	//     } else if (res.status === 401) {
    // 	//       resolve(file);

    // 	//       throw new Error(
    // 	//         "`BLOB_READ_WRITE_TOKEN` environment variable not found, reading image locally instead."
    // 	//       );
    // 	//       // Unknown error
    // 	//     } else {
    // 	//       throw new Error(`Error uploading image. Please try again.`);
    // 	//     }
    // 	//   }),
    // 	//   {
    // 	//     loading: "Uploading image...",
    // 	//     success: "Image uploaded successfully.",
    // 	//     error: (e) => e.message,
    // 	//   }
    // 	// );
    // 	resolve(file);
    // });
};