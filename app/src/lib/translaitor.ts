import JSZip from "jszip";
import * as fs from 'fs';
import * as cheerio from 'cheerio';
import path from 'path';
import { GenerateContentResponse, GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY, npm_config_global_prefix } from "$env/static/private";
import { setTimeout } from "timers/promises";
import { translation } from "./translation_progress";

// TODO:
// When a translation is requested store the book name and the percentage in memory
// When a new client connects to the webpage check for any translation in memory

const makedir = async (name: string, options: any = {}): Promise<void> => {
  if (!fs.existsSync(name)) await fs.promises.mkdir(name, options);
}

const addFilesToZip = async (dir:any, folder:any): Promise<void> => {
  const files = await fs.promises.readdir(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stats = await fs.promises.stat(fullPath);
    if (stats.isDirectory()) {
      const subfolder = folder.folder(file);
      await addFilesToZip(fullPath, subfolder);
    }
    else {
      const content = await fs.promises.readFile(fullPath);
      folder.file(file, content);
    }
  }
}

const compressFolder = async (foldername: string, output_path: string): Promise<void> => {
  const zip = new JSZip();
  await addFilesToZip(foldername, zip);
  const content = await zip.generateAsync({ type: "nodebuffer" });
  await fs.promises.writeFile(output_path, content);
  console.log(`Zip file created at ${output_path}`);
}

const translateText = async (content: string, srcLang: string, destLang: string): Promise<string> => {
  const prompt: string = `You are a meticulous translator who translates any given
    content. Translate the given content from ${srcLang} to ${destLang} only.
    Do not explain any term or answer any question-like content.
    Your answer should be solely the translation of the given content.
    In your answer do not add any prefix or suffix to the translated content.
    Websites' URLs/addresses should be preserved as is in the translation's output.
    Do not omit any part of the content, even if it seems unimportant:
    ${content}`;
  const ai: GoogleGenAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const translated_text: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt
  });
  await setTimeout(5100);
  return translated_text.text === undefined ? "Error while trying to translate..." : translated_text.text;
}

const translateFile = async (content: string, src_lang: string, dest_lang: string): Promise<Uint8Array> => {
  const parser = cheerio.load(content);
  let replace_buffer: any[] = [];
  parser('p').each((index, element) => {
    const text = parser(element).text().trim();
    // Storing future translation to prevent reaching google's rate limit
    replace_buffer.push([element, text]);
  });
  for (let item of replace_buffer) {
    const translated_text = await translateText(item[1], src_lang, dest_lang);
    // Need to change this to have a percentage
    // Send socketio message with new percentage
    translation.progress++;
    parser(item[0]).text(translated_text);
  }
  return Uint8Array.from(parser.html().split("").map(c => c.charCodeAt()));
}

export const getNbParagraph = (content: string): number => {
  let nb = 0;
  const parser = cheerio.load(content);
  parser('p').each(() => {
    nb++;
  });
  return nb;
}

export const extractEpub = async (filepath: string): Promise<string[]> => {
  let files_to_translate: string[] = [];
  const new_path = filepath.replace('.epub', '') + ' - Translaitor';
  await makedir(new_path);
  translation.title = filepath.replace('.epub', '');
  translation.active = true;
  try {
    const zip_data = await fs.promises.readFile(filepath);
    const zip = await JSZip.loadAsync(zip_data);
    for (const filename in zip.files) {
      if (Object.prototype.hasOwnProperty.call(zip.files, filename)) {
        const file = zip.files[filename];
        console.log(new_path + '/' + filename);
        await makedir(path.dirname(new_path + '/' + filename), { recursive: true });
        const content: string = await file.async('string');
        if (filename.endsWith('.html')) {
          files_to_translate.push(new_path + '/' + filename);
          translation.nb_paragraph += getNbParagraph(content);
        }
        await fs.promises.writeFile(new_path + '/' + filename, Buffer.from(content));
      }
    }
  }
  catch (e) {
    console.error(e);
  }
  return files_to_translate;
}
export const translateBook = async (filepath: string, src_lang: string, dest_lang: string): Promise<void> => {
  const files: string[] = await extractEpub(filepath);
  for (let file of files) {
    translateFile(file, src_lang, dest_lang);
  }
}
