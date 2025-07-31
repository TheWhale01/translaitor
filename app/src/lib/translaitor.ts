import JSZip from "jszip";
import * as fs from 'fs';
import * as cheerio from 'cheerio';
import path from 'path';
import { GenerateContentResponse, GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY, OUTPUT_PATH } from "$env/static/private";
import { PUBLIC_WEBSOCKET_URL } from "$env/static/public";
import { setTimeout } from "timers/promises";
import { io } from 'socket.io-client';
import TranslationProgress from "./translation_progress";
import type { Socket } from "socket.io-client";

const makedir = (name: string, options: any = {}): void => {
  if (!fs.existsSync(name)) fs.mkdirSync(name, options);
}

const addFilesToZip = (dir:any, folder:any): void => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      const subfolder = folder.folder(file);
      addFilesToZip(fullPath, subfolder);
    }
    else {
      const content = fs.readFileSync(fullPath);
      folder.file(file, content);
    }
  }
}

const compressFolder = async (foldername: string, output_path: string): Promise<void> => {
  const zip = new JSZip();
  addFilesToZip(foldername, zip);
  const content = await zip.generateAsync({ type: "nodebuffer" });
  fs.writeFileSync(output_path, content);
  console.log(`Zip file created at ${output_path}`);
}

const translateText = async (content: string, srcLang: string, destLang: string): Promise<string> => {
  if (srcLang === 'auto')
    srcLang = 'the language of the provided text'
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

const translateFile = async (socket: Socket, filename: string, src_lang: string, dest_lang: string): Promise<string> => {
  const content: string = await fs.promises.readFile(filename, 'utf-8');
  const parser = cheerio.load(content);
  let replace_buffer: any[] = [];

  parser('p').each((index, element) => {
    const text = parser(element).text().trim();

    replace_buffer.push([element, text]);
  });
  for (let item of replace_buffer) {
    const translated_text = await translateText(item[1], src_lang, dest_lang);
    // const translated_text = "Some translated text...";
    console.log(translated_text);
    TranslationProgress.nb_paragraph_done++;
    TranslationProgress.progress = Number((TranslationProgress.nb_paragraph_done * 100 / TranslationProgress.nb_paragraph_total).toFixed(2));
    parser(item[0]).text(translated_text);
    // emit the translation progress
    socket.emit('translation', TranslationProgress.toJson());
  }
  return parser.html();
}

export const getNbParagraph = (content: string): number => {
  let nb = 0;
  const parser = cheerio.load(content);

  parser('p').each(() => {
    nb++;
  });
  return nb;
}

export const extractEpub = async (filepath: string, new_path: string): Promise<string[]> => {
  let files_to_translate: string[] = [];
  makedir(new_path);
  TranslationProgress.title = path.basename(filepath);
  TranslationProgress.active = true;
  try {
    const zip_data = await fs.promises.readFile(filepath);
    const zip = await JSZip.loadAsync(zip_data);
    for (const filename in zip.files) {
      if (Object.prototype.hasOwnProperty.call(zip.files, filename)) {
        const file = zip.files[filename];
        makedir(path.dirname(new_path + '/' + filename), { recursive: true });
        const content: string = await file.async('string');
        if (filename.endsWith('.html')) {
          files_to_translate.push(new_path + '/' + filename);
          TranslationProgress.nb_paragraph_total += getNbParagraph(content);
        }
        if (!file.dir)
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
  console.log("DEBUG: " + filepath);
  const socket = io(PUBLIC_WEBSOCKET_URL);
  const new_path = filepath.replace('.epub', '') + ' - Translaitor';
  const archive_name: string = new_path + '.epub';
  const files: string[] = await extractEpub(filepath, new_path);

  fs.unlinkSync(filepath);
  socket.emit('translation', TranslationProgress.toJson());
  for (const file of files) {
    const translated_content: string = await translateFile(socket, file, src_lang, dest_lang);
    fs.writeFileSync(file, translated_content);
  }
  await compressFolder(new_path, archive_name);
  fs.rmSync(new_path, { recursive: true });
  if (OUTPUT_PATH !== "") {
    makedir(OUTPUT_PATH);
    fs.renameSync(archive_name, path.join(OUTPUT_PATH, path.basename(archive_name)));
  }
  TranslationProgress.reset();
  socket.emit('translation', TranslationProgress.toJson());
  // return new filename to download
}
