import JSZip from "jszip";
import * as fs from 'fs';
import path from 'path';

const makedir = async (name: string, options: any = {}): Promise<void> => {
  if (!fs.existsSync(name)) await fs.promises.mkdir(name, options);
}

const addFilesToZip = async (dir:any, folder:any): Promise<void> => {
  const files = await fs.promises.readdir(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stats = await fs.promises.stat(fullPath);

    if (stats.isDirectory()) {
      // Create a subfolder and recurse
      const subfolder = folder.folder(file);
      await addFilesToZip(fullPath, subfolder);
    }
    else {
      // Add file to zip
      const content = await fs.promises.readFile(fullPath);
      folder.file(file, content);
    }
  }
}

const compressFolder = async (foldername: string, output_path: string): Promise<void> => {
  const zip = new JSZip();

    // Read all files in the directory recursively
    await addFilesToZip(foldername, zip);

    // Generate the zip file
    const content = await zip.generateAsync({ type: "nodebuffer" });

    // Write to disk
    await fs.promises.writeFile(output_path, content);
    console.log(`Zip file created at ${output_path}`);
}

export const extractEpub = async (filepath: string): Promise<boolean> => {
  const new_path = filepath.replace('.epub', '') + ' - Translaitor';
  await makedir(new_path);
  try {
    const zip_data = await fs.promises.readFile(filepath);
    const zip = await JSZip.loadAsync(zip_data);
    for (const filename in zip.files) {
      if (Object.prototype.hasOwnProperty.call(zip.files, filename)) {
        const file = zip.files[filename];
        console.log(new_path + '/' + filename);
        makedir(path.dirname(new_path + '/' + filename), { recursive: true });
        let content = null;
        if (filename.endsWith('.html')) {
          content = "";
          // 1. Parse html file
          // 2. Create a the same html files
          // 3. For each paragraphs in these files
          // 4. Request gemini to translate the content
          // 5. Read the file as uint8array
        }
        else {
          content = await file.async('uint8array');
        }
        await fs.promises.writeFile(new_path + '/' + filename, Buffer.from(content));
      }
    }
    compressFolder(new_path, new_path + '.epub');
    return true;
  }
  catch (error) {
    console.error('Error unzipping file: ', error);
    console.error('Deleting file: ', path)
    fs.unlinkSync(filepath);
    fs.unlinkSync(new_path);
    return false;
  }
}
