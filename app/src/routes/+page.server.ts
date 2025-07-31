// Get the state of the translation

import { fail } from '@sveltejs/kit';
import { writeFileSync } from 'fs';
import { translateBook } from '$lib/translaitor';
import type { Actions, PageServerLoad } from './$types';
import { translation } from '$lib/translation_progress';

export const load: PageServerLoad = () => {
  return translation.toJson();
}

export const actions = {
  default: async ({ request }) => {
    const formData = Object.fromEntries(await request.formData());
    const book: File = formData.fileToUpload as File;
    const src_lang: string = formData.src_lang as string;
    const target_lang: string = formData.target_lang as string;
    if (!book.name || book.name === 'undefined') {
      return fail(400, {
        error: true,
        message: 'You must provide a book to upload'
      });
    }
    writeFileSync(`./static/${book.name}`, Buffer.from(await book.arrayBuffer()));
    translateBook(`./static/${book.name}`, src_lang, target_lang);
    return {
      success: true
    };
  }
} satisfies Actions
