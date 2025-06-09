<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import IconChevronDown from '@lucide/svelte/icons/chevron-down';
  import IconArrowRight from '@lucide/svelte/icons/arrow-right';
  import IconRefreshCw from '@lucide/svelte/icons/refresh-cw';

  // Define type for language objects
  type Language = {
    code: string;
    name: string;
  };

  // Component props
  export let languages: Language[] = [];
  export let originLanguage: Language = languages[0];
  export let targetLanguage: Language = languages[1];
  export let disabled: boolean = false;

  // State variables
  let originDropdownOpen = false;
  let targetDropdownOpen = false;

  // Create event dispatcher
  const dispatch = createEventDispatcher<{
    change: { origin: Language; target: Language };
  }>();

  // Select origin language
  function selectOrigin(language: Language): void {
    if (language.code === targetLanguage.code) {
      // If the same as target, swap them
      swapLanguages();
    } else {
      originLanguage = language;
      dispatch('change', { origin: originLanguage, target: targetLanguage });
    }
    originDropdownOpen = false;
  }

  // Select target language
  function selectTarget(language: Language): void {
    if (language.code === originLanguage.code) {
      // If the same as origin, swap them
      swapLanguages();
    } else {
      targetLanguage = language;
      dispatch('change', { origin: originLanguage, target: targetLanguage });
    }
    targetDropdownOpen = false;
  }

  // Swap origin and target languages
  function swapLanguages(): void {
    const temp = originLanguage;
    originLanguage = targetLanguage;
    targetLanguage = temp;
    dispatch('change', { origin: originLanguage, target: targetLanguage });
  }

  // Close dropdowns when clicking outside
  function handleClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.origin-dropdown')) {
      originDropdownOpen = false;
    }
    if (!target.closest('.target-dropdown')) {
      targetDropdownOpen = false;
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="language-selector">
  <div class="flex flex-col md:flex-row items-center gap-2 md:gap-4">
    <!-- Origin Language Dropdown -->
    <div class="w-full md:w-40 relative origin-dropdown">
      <label class="label mb-1">Original Language</label>
      <button
        class="btn variant-filled w-full flex justify-between items-center"
        on:click={() => originDropdownOpen = !originDropdownOpen}
        disabled={disabled}
      >
        <span>{originLanguage.name}</span>
        <IconChevronDown class="h-4 w-4" />
      </button>

      {#if originDropdownOpen}
        <div class="bg-primary-500 w-full mt-1 shadow-lg z-20 absolute">
          <ul class="list-nav">
            {#each languages as language}
              <li>
                <button
                  class="option w-full text-left p-2 rounded hover:bg-primary-800 {originLanguage.code === language.code ? 'bg-primary-800' : ''}"
                  on:click={() => selectOrigin(language)}
                >
                  {language.name}
                </button>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>

    <!-- Swap Button and Arrow -->
    <div class="flex items-center justify-center gap-2 my-2 md:my-8">
      <button
        class="btn-icon variant-soft"
        on:click={swapLanguages}
        disabled={disabled}
        title="Swap languages"
      >
        <IconRefreshCw class="h-5 w-5" />
      </button>
      <IconArrowRight class="h-8 w-8 hidden md:block" />
    </div>

    <!-- Target Language Dropdown -->
    <div class="w-full md:w-40 relative target-dropdown">
      <label class="label mb-1">Target Language</label>
      <button
        class="btn variant-filled w-full flex justify-between items-center"
        on:click={() => targetDropdownOpen = !targetDropdownOpen}
        disabled={disabled}
      >
        <span>{targetLanguage.name}</span>
        <IconChevronDown class="h-4 w-4" />
      </button>

      {#if targetDropdownOpen}
        <div class="card p-2 w-full mt-1 shadow-lg z-20 absolute">
          <ul class="list-nav">
            {#each languages as language}
              <li>
                <button
                  class="option w-full text-left p-2 rounded hover:variant-soft-primary {targetLanguage.code === language.code ? 'variant-filled-primary' : ''}"
                  on:click={() => selectTarget(language)}
                >
                  {language.name}
                </button>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .language-selector {
    width: 100%;
  }
</style>
