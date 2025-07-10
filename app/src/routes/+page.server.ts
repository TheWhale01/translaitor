// Get the state of the translation

import type { PageServerLoad } from "./$types";
import { fail } from '@sveltejs/kit';
import { writeFileSync } from 'fs';
import { extractEpub } from "$lib/translaitor";

export const load: PageServerLoad = async ({ params }) => {};

export const actions = {
    default: async ({ request }) => {
        const formData = Object.fromEntries(await request.formData());
        const book: File = formData.fileToUpload;
        const src_lang: string = formData.src_lang;
        const target_lang: string = formData.target_lang;
        if (!book.name || book.name === 'undefined') {
            return fail(400, {
                error: true,
                message: 'You must provide a book to upload'
            });
        }
        writeFileSync(`./static/${book.name}`, Buffer.from(await book.arrayBuffer()));
        extractEpub(`./static/${book.name}`);
        return {
            success: true
        };
    }
}
