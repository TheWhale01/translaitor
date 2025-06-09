import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GoogleGenAI } from '@google/genai';
import EPub from 'epub';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { promisify } from 'util';
import archiver from 'archiver';
import { GEMINI_API_KEY } from '$env/static/private';

// Constants
const GEMINI_MODEL = 'gemini-2.5-flash-preview-05-20';
const MAX_CHUNK_SIZE = 30000; // Characters per API request

// Promisify fs functions
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const readFile = promisify(fs.readFile);

// Create temp directory for processing
const createTempDir = async () => {
  const tempDir = path.join(os.tmpdir(), 'translaitor-' + Date.now());
  await mkdir(tempDir, { recursive: true });
  return tempDir;
};

// Extract content from EPUB
const extractEpubContent = (filePath: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const epub = new EPub(filePath);

    epub.on('end', function() {
      // Get the book content
      const chapters: any[] = [];

      epub.flow.forEach((chapter) => {
        epub.getChapter(chapter.id, (err: Error, text: string) => {
          if (err) {
            reject(err);
            return;
          }

          chapters.push({
            id: chapter.id,
            title: chapter.title,
            content: text
          });

          if (chapters.length === epub.flow.length) {
            resolve({
              metadata: {
                title: epub.metadata.title,
                creator: epub.metadata.creator,
                language: epub.metadata.language,
                publisher: epub.metadata.publisher
              },
              chapters: chapters,
              spine: epub.spine,
              flow: epub.flow,
              toc: epub.toc
            });
          }
        });
      });
    });

    epub.parse();
  });
};

// Helper function to create a delay
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Translate text using Gemini API
const translateText = async (model: any, text: string, targetLanguage: string): Promise<string> => {
  const prompt = `Translate the following text to ${targetLanguage}. Preserve all HTML tags and formatting. Only return the translated text without any explanations.

Original text:
${text}`;
  const response = await model.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt
  });

  // Wait for 5 seconds before proceeding to the next API call
  console.log(`Waiting 5 seconds before next translation...`);
  await sleep(5000);

  return response.text;
};

// Split text into manageable chunks for API
const splitTextIntoChunks = (text: string): string[] => {
  const chunks: string[] = [];
  let currentIndex = 0;

  while (currentIndex < text.length) {
    // Try to find a natural break point (paragraph or sentence)
    let endIndex = currentIndex + MAX_CHUNK_SIZE;

    if (endIndex >= text.length) {
      endIndex = text.length;
    } else {
      // Look for paragraph break
      const paragraphBreak = text.lastIndexOf('</p>', endIndex);
      if (paragraphBreak !== -1 && paragraphBreak > currentIndex + MAX_CHUNK_SIZE / 2) {
        endIndex = paragraphBreak + 4; // Include the </p> tag
      } else {
        // Look for a sentence break
        const sentenceBreak = text.lastIndexOf('.', endIndex);
        if (sentenceBreak !== -1 && sentenceBreak > currentIndex + MAX_CHUNK_SIZE / 2) {
          endIndex = sentenceBreak + 1;
        }
      }
    }

    chunks.push(text.substring(currentIndex, endIndex));
    currentIndex = endIndex;
  }

  return chunks;
};

// Create a new EPUB with translated content
const createTranslatedEpub = async (
  originalEpub: any,
  translatedChapters: any[],
  outputPath: string,
  targetLanguage: string
): Promise<string> => {
  const tempDir = await createTempDir();
  const epubDir = path.join(tempDir, 'epub');
  const metaInfDir = path.join(epubDir, 'META-INF');
  const oebpsDir = path.join(epubDir, 'OEBPS');

  // Create directory structure
  await mkdir(epubDir, { recursive: true });
  await mkdir(metaInfDir, { recursive: true });
  await mkdir(oebpsDir, { recursive: true });

  // Create mimetype file
  await writeFile(path.join(epubDir, 'mimetype'), 'application/epub+zip');

  // Create container.xml
  const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
  await writeFile(path.join(metaInfDir, 'container.xml'), containerXml);

 // Create content.opf
  const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="2.0" unique-identifier="BookId">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:title>${originalEpub.metadata.title} (${targetLanguage})</dc:title>
    <dc:creator>${originalEpub.metadata.creator}</dc:creator>
    <dc:language>${targetLanguage.toLowerCase()}</dc:language>
    <dc:publisher>Translaitor</dc:publisher>
    <dc:identifier id="BookId">urn:uuid:${Date.now()}</dc:identifier>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    ${translatedChapters.map((chapter, index) =>
      `<item id="chapter${index}" href="chapter${index}.html" media-type="application/xhtml+xml"/>`
    ).join('\n    ')}
  </manifest>
  <spine toc="ncx">
    ${translatedChapters.map((chapter, index) =>
      `<itemref idref="chapter${index}"/>`
    ).join('\n    ')}
  </spine>
</package>`;
  await writeFile(path.join(oebpsDir, 'content.opf'), contentOpf);

  // Create toc.ncx
  const tocNcx = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:${Date.now()}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle>
    <text>${originalEpub.metadata.title} (${targetLanguage})</text>
  </docTitle>
  <navMap>
    ${translatedChapters.map((chapter, index) =>
      `<navPoint id="navPoint-${index}" playOrder="${index + 1}">
      <navLabel>
        <text>${chapter.title || `Chapter ${index + 1}`}</text>
      </navLabel>
      <content src="chapter${index}.html"/>
    </navPoint>`
    ).join('\n    ')}
  </navMap>
</ncx>`;
  await writeFile(path.join(oebpsDir, 'toc.ncx'), tocNcx);

  // Create chapter files
  for (let i = 0; i < translatedChapters.length; i++) {
    const chapter = translatedChapters[i];
    await writeFile(path.join(oebpsDir, `chapter${i}.html`), chapter.content);
  }

  // Create the EPUB file (zip the directory)
  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  // Set up archive events
  archive.pipe(output);

  // Add mimetype first without compression
  archive.file(path.join(epubDir, 'mimetype'), { name: 'mimetype', store: true });

  // Add the rest of the files
  archive.directory(path.join(epubDir, 'META-INF'), 'META-INF');
  archive.directory(path.join(epubDir, 'OEBPS'), 'OEBPS');

  await archive.finalize();

  return outputPath;
};

export const POST: RequestHandler = async ({ request }) => {
  // try {
    // Get form data from request
    const formData = await request.formData();
    const epubFile = formData.get('file') as File;
    const targetLanguage = formData.get('targetLanguage') as string;
    const originalLanguage = formData.get('originalLanguage') as string;
    const apiKey = GEMINI_API_KEY;

    if (!epubFile || !targetLanguage || !originalLanguage) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!apiKey) {
      return json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    // Initialize Gemini API
    const model = new GoogleGenAI({ apiKey: apiKey });

    // Create temp directory
    const tempDir = await createTempDir();
    const inputPath = path.join(tempDir, 'input.epub');
    const outputPath = path.join(tempDir, 'translated.epub');

    // Save uploaded file
    const arrayBuffer = await epubFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(inputPath, buffer);

    // Extract EPUB content
    const epubContent = await extractEpubContent(inputPath);

    // Translate each chapter
    const translatedChapters = [];

    for (const chapter of epubContent.chapters) {
      // Split chapter content into manageable chunks
      const contentChunks = splitTextIntoChunks(chapter.content);
      let translatedContent = '';

      // Translate each chunk
      for (const chunk of contentChunks) {
        console.log(`Translating chunk (${chunk.length} characters)...`);
        const translatedChunk = await translateText(model, chunk, targetLanguage);
        translatedContent += translatedChunk;
        console.log(`Chunk translated successfully.`);
      }

      translatedChapters.push({
        ...chapter,
        content: translatedContent
      });
    }

    // Create translated EPUB
    await createTranslatedEpub(epubContent, translatedChapters, outputPath, targetLanguage);

    // Read the translated EPUB file
    const translatedEpub = await readFile(outputPath);

    // Return the translated EPUB file
    return new Response(translatedEpub, {
      headers: {
        'Content-Type': 'application/epub+zip',
        'Content-Disposition': `attachment; filename="translated_${epubFile.name}"`
      }
    });

  // }
  // catch (error) {
  //   console.error('Translation error:', error);
  //   return json({ error: 'Failed to translate the file' }, { status: 500 });
  // }
};
