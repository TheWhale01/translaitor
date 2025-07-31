<script lang="ts">
  import { Progress } from "@skeletonlabs/skeleton-svelte";
  import { LoaderCircle, RefreshCw } from "@lucide/svelte";
  import LanguageSelector from '$lib/components/LanguageSelector.svelte';
  import { enhance } from '$app/forms';
  import { io } from "socket.io-client";
  import { PUBLIC_WEBSOCKET_URL } from "$env/static/public";

  import type { PageProps } from "./$types";

  // Available languages for translation
  const socket = io(PUBLIC_WEBSOCKET_URL);
  const languages = [
    'English',
    'Spanish',
    'French',
    'Italian',
    'German',
    'Portuguese',
  ];

  let { data }: PageProps = $props();
  let srcLang: string = $state('');
  let destLang: string = $state('');

  socket.on('translation', (translation: any): void => {
    data = translation;
  });
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
            selected_value={destLang}
            bind:value={srcLang}
        />
        <button
            type="button"
            class="btn btn-sm preset-filled-secondary-500"
            onclick={(): void => {
            let temp: string = srcLang;

            if (!srcLang || !destLang)
              return ;
            srcLang = destLang;
            destLang = temp;
            }}>
                <RefreshCw />
        </button>
        <LanguageSelector
            name="target_lang"
            title="Target Language"
            languages={languages}
            selected_value={srcLang}
            bind:value={destLang}
        />
    </div>
    {#if !data.active}
        <button
            disabled={((srcLang === '' || destLang === '') || (srcLang === destLang)) && !data.active}
            type="submit"
            class="btn btn-lg preset-filled-secondary-500"
        >
            Translate
        </button>
    {:else}
        <div class="card p-4">
            <Progress meterBg="bg-secondary-500" value={data.progress} max={100}>{data.progress}%</Progress>
            <p class="text-sm mt-2">This may take several minutes depending on the size of your book. <LoaderCircle class="w-6 h-6 animate-spin inline" /></p>
            <p class="text-center pt-4">Translating: { data.title }</p>
        </div>
    {/if}
</form>
