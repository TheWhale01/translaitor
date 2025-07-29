import JSZip from "jszip";
import * as fs from 'fs';
import * as cheerio from 'cheerio';
import path from 'path';
import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY } from "$env/static/private";
import { setTimeout } from "timers/promises";

// TODO:
// Need to setup socketio
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

const translate_text = async (content: string, srcLang: string, destLang: string): Promise<string> => {
  const prompt: string = `You are a meticulous translator who translates any given
    content. Translate the given content from ${srcLang} to ${destLang} only.
    Do not explain any term or answer any question-like content.
    Your answer should be solely the translation of the given content.
    In your answer do not add any prefix or suffix to the translated content.
    Websites' URLs/addresses should be preserved as is in the translation's output.
    Do not omit any part of the content, even if it seems unimportant:
    ${content}`;
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const translated_text = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt
  });
  await setTimeout(5000);
  console.log(translated_text.text);
  return translated_text.text;
}

const parse_html = async (content: string, src_lang: string, dest_lang: string): Promise<Uint8Array> => {
  const parser = cheerio.load(content);
  let replace_buffer: any[] = [];
  parser('p').each((index, element) => {
    const text = parser(element).text().trim();
    replace_buffer.push([element, text]);
  });
  for (let item of replace_buffer) {
    const translated_text = await translate_text(item[1], src_lang, dest_lang);
    parser(item[0]).text(translated_text);
  }
  return Uint8Array.from(parser.html().split("").map(c => c.charCodeAt()));
}

export const extractEpub = async (filepath: string, src_lang: string, dest_lang: string): Promise<void> => {
  const new_path = filepath.replace('.epub', '') + ' - Translaitor';
  await makedir(new_path);
  try {
    const zip_data = await fs.promises.readFile(filepath);
    const zip = await JSZip.loadAsync(zip_data);
    for (const filename in zip.files) {
      if (Object.prototype.hasOwnProperty.call(zip.files, filename)) {
        const file = zip.files[filename];
        console.log(new_path + '/' + filename);
        await makedir(path.dirname(new_path + '/' + filename), { recursive: true });
        let content: Uint8Array | null = null;
        if (filename.endsWith('.html')) {
          content = await parse_html(await file.async('string'), src_lang, dest_lang);
        }
        else {
          content = await file.async('uint8array');
        }
        if (content === null)
          throw new Error("problem with translation");
        await fs.promises.writeFile(new_path + '/' + filename, Buffer.from(content));
      }
    }
    compressFolder(new_path, new_path + '.epub');
  }
  catch (error) {
    console.error('Error unzipping file: ', error);
    console.error('Deleting file: ', path)
    // fs.unlinkSync(filepath);
    // fs.unlinkSync(new_path);
  }
}
