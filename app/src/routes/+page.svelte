<script lang="ts">
  import { Progress } from "@skeletonlabs/skeleton-svelte";
  import IconLoader from '@lucide/svelte/icons/loader-2';
  import LanguageSelector from '$lib/components/LanguageSelector.svelte';
  import { enhance } from '$app/forms';
  import { socket } from "$lib/socketio_connection";
  import { onMount } from "svelte";

  import type { PageProps } from "./$types";

  // Available languages for translation
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

  onMount(() => {
    socket.on('connection', () => { console.log("You are connected"); });
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
    {#if !data.active}
        <button
            disabled={((srcLang === '' || destLang === '') || (srcLang === destLang)) && !data.active}
            type="submit"
            class="btn btn-lg preset-filled-primary-500"
        >
            Translate
        </button>
    {:else}
        <div class="card p-4">
            <Progress meterBg="bg-primary-500" value={data.progress} max={100}>{data.progress}%</Progress>
            <p class="text-sm mt-2">This may take several minutes depending on the size of your book. <IconLoader class="w-6 h-6 animate-spin inline" /></p>
            <p class="text-center pt-4">Translating: { data.title }</p>
        </div>
    {/if}
</form>
