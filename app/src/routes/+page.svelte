<script lang="ts">
  import type { PageProps } from "./$types";
  import { FileUpload, Progress } from "@skeletonlabs/skeleton-svelte";
  import IconDropzone from '@lucide/svelte/icons/file-up';
  import IconFile from '@lucide/svelte/icons/paperclip';
  import IconRemove from '@lucide/svelte/icons/circle-x';
  import IconLoader from '@lucide/svelte/icons/loader-2';
  import LanguageSelector from '$lib/components/LanguageSelector.svelte';
  import { enhance } from '$app/forms';

  // In this I would get the state of the translation (if one occurs)
  let { data }: PageProps = $props();

  // Available languages for translation
  const languages = [
    'English',
    'Spanish',
    'French',
    'Italian',
    'German',
    'Portuguese',
    'Russian',
    'Chinese',
    'Japanese',
    'Korean'
  ];

  function handleFileEvent(files: any): void {
    if (!files || !files.acceptedFiles || files.acceptedFiles.length === 0) {
      console.error("No valid files selected");
      return;
    }
    const file = files.acceptedFiles[0];
    console.log(file);
  }

  let srcLang: string = $state('');
  let destLang: string = $state('');
  let translating: boolean = $state(false);
  let translationProgress: number = $state(0);
  let book: any = null;
</script>

<header class="p-8">
    <h1 class="mb-6 text-4xl font-extrabold">Translaitor</h1>
</header>

<form method="post" enctype="multipart/form-data" use:enhance  class="w-full flex flex-col justify-between items-center p-8 h-full">
    <div>
        <label for="file">Upload a book</label>
        <input
            type="file"
            id="file"
            name="fileToUpload"
            accept=".epub"
            required
        />
    </div>
    <div class="flex flex-row justify-around w-full">
        <LanguageSelector
            name="src_lang"
            title="Source Language"
            languages={languages}
            bind:value={srcLang}
        />
        <p>-></p>
        <LanguageSelector
            name="target_lang"
            title="Target Language"
            languages={languages}
            bind:value={destLang}
        />
    </div>
    {#if !translating}
        <!-- <button
            disabled={(srcLang === '' || destLang === '') || (srcLang === destLang)}
            type="submit"
            class="btn btn-lg preset-filled-primary-500"
        > -->
        <button
            type="submit"
            class="btn btn-lg preset-filled-primary-500"
        >
            Translate
        </button>
    {:else}
        <div class="card p-4">
            <Progress meterBg="bg-primary-500" value={translationProgress} max={100}>{translationProgress}%</Progress>
            <p class="text-sm mt-2">This may take several minutes depending on the size of your book. <IconLoader class="w-6 h-6 animate-spin inline" /></p>
            <p class="text-center pt-4">Translating: "book name"</p>
        </div>
    {/if}
</form>
