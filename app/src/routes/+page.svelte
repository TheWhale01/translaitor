<script lang="ts">
  import { FileUpload, Progress } from "@skeletonlabs/skeleton-svelte";
  import IconDropzone from '@lucide/svelte/icons/file-up';
  import IconFile from '@lucide/svelte/icons/paperclip';
  import IconRemove from '@lucide/svelte/icons/circle-x';
  import IconLoader from '@lucide/svelte/icons/loader-2';
  import IconDownload from '@lucide/svelte/icons/download';
  import LanguageSelector from '$lib/components/LanguageSelector.svelte';

  // Available languages for translation
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'it', name: 'Italian' },
    { code: 'de', name: 'German' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' }
  ];

  // State variables
  let selectedFile: File | null = null;
  let originalLanguage = languages[0];
  let targetLanguage = languages[1];
  let isTranslating = false;
  let translationProgress = 0;
  let translationError: string | null = null;
  let translatedFileUrl: string | null = null;

  // Handle file upload events (both accepted and rejected files)
  function handleFileEvent(file: any) {
    // Reset previous state
    translationError = null;
    translatedFileUrl = null;

    // Handle accepted files
    if (file.acceptedFiles && file.acceptedFiles.length > 0) {
      selectedFile = file.acceptedFiles[0];
      console.log(`File accepted: ${selectedFile.name}, size: ${selectedFile.size} bytes, type: ${selectedFile.type}`);
    }

    // Handle rejected files
    else if (file.rejectedFiles && file.rejectedFiles.length > 0) {
      const rejectedFile = file.rejectedFiles[0];
      translationError = `File "${rejectedFile.name}" was rejected: ${rejectedFile.reason || 'Invalid file type. Only .epub files are allowed.'}`;
      selectedFile = null;
    }
  }

  // Handle language selection
  function handleLanguageChange(event: any) {
    originalLanguage = event.detail.origin;
    targetLanguage = event.detail.target;
  }

  // Start translation process
  async function startTranslation() {
    if (!selectedFile) {
      translationError = "Please select an EPUB file first";
      return;
    }

    if (originalLanguage.code === targetLanguage.code) {
      translationError = "Source and target languages must be different";
      return;
    }

    isTranslating = true;
    translationProgress = 0;
    translationError = null;
    translatedFileUrl = null;

    try {
      const formData = new FormData();
      // Create a File object from the selectedFile if needed
      const fileToUpload = selectedFile instanceof File
        ? selectedFile
        : new File(
            [selectedFile],
            selectedFile.name,
            { type: 'application/epub+zip', lastModified: selectedFile.lastModified }
          );

      formData.append('file', fileToUpload);
      formData.append('originalLanguage', originalLanguage.code);
      formData.append('targetLanguage', targetLanguage.code);

      console.log(`Uploading file: ${fileToUpload.name}, size: ${fileToUpload.size} bytes`);

      // Simulate progress updates since the API doesn't provide real-time progress
      const progressInterval = setInterval(() => {
        if (translationProgress < 90) {
          translationProgress += 5;
        }
      }, 2000);

      const response = await fetch('/api/translate', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Translation failed');
      }

      translationProgress = 100;

      // Create a blob URL for the translated file
      const blob = await response.blob();
      translatedFileUrl = URL.createObjectURL(blob);
    } catch (error) {
      console.error('Translation error:', error);
      translationError = error instanceof Error ? error.message : 'An unknown error occurred';
    } finally {
      isTranslating = false;
    }
  }

  // Download the translated file
  function downloadTranslatedFile() {
    if (translatedFileUrl && selectedFile) {
      const a = document.createElement('a');
      a.href = translatedFileUrl;
      // Handle file name, ensuring we replace only the .epub at the end
      const baseName = selectedFile.name.endsWith('.epub')
        ? selectedFile.name.slice(0, -5)
        : selectedFile.name;
      const fileName = `${baseName}-${targetLanguage.code}.epub`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }
</script>

<header class="p-6">
  <h1 class="mb-6 text-4xl font-extrabold">Translaitor</h1>
</header>

<div class="w-full flex flex-col justify-between items-center p-8 h-full">
  <!-- File Upload Component -->
  <div class="w-full max-w-md">
    <FileUpload
      classes="w-full"
      name="importer"
      accept=".epub"
      onFileChange={handleFileEvent}
      onFileReject={handleFileEvent}
      subtext="Drag and drop or select an EPUB file"
      maxFiles={1}
    >
      {#snippet iconInterface()}<IconDropzone />{/snippet}
      {#snippet iconFile()}<IconFile />{/snippet}
      {#snippet iconRemove()}<IconRemove />{/snippet}
    </FileUpload>
  </div>

  <!-- Language Selection -->
  <div class="w-full max-w-md">
    <LanguageSelector
      languages={languages}
      originLanguage={originalLanguage}
      targetLanguage={targetLanguage}
      disabled={isTranslating}
      on:change={handleLanguageChange}
    />
  </div>

  <!-- Translation Progress and Controls -->
  <div class="flex flex-col items-center w-full max-w-md">
    {#if translationError}
      <div class="alert variant-filled-error">
        <span>{translationError}</span>
      </div>
    {/if}

    {#if isTranslating}
      <div class="card p-4">
        <Progress meterBg="bg-primary-500" value={translationProgress} max={100}>{translationProgress}%</Progress>
        <p class="text-sm mt-2">This may take several minutes depending on the size of your book. <IconLoader class="w-6 h-6 animate-spin inline" /></p>
      </div>
    {:else if translatedFileUrl}
      <div class="card p-4 variant-filled-success">
        <p class="mb-2">Translation complete!</p>
        <button
          type="button"
          class="btn variant-filled-primary w-full"
          on:click={downloadTranslatedFile}
        >
          <IconDownload class="w-5 h-5 mr-2" />
          Download Translated Book
        </button>
      </div>
    {:else}
      <button
        type="button"
        class="btn btn-lg preset-filled-primary-500"
        on:click={startTranslation}
        disabled={!selectedFile}
      >
        Translate!
      </button>
    {/if}
  </div>
</div>
