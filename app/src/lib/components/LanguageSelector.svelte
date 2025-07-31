<script lang="ts">
  interface PropsType {
    name: string;
    title: string;
    languages: string[];
    selected_value: string;
    value?: string;
    show_auto?: boolean;
  };

  let { name, title, languages, selected_value, value = $bindable(), show_auto = false }: PropsType = $props();
</script>
<div>
    <select name={name} class="form-select" bind:value>
        <option disabled selected value="">{title}</option>
        {#if show_auto}
            <option value="auto">Auto Detect</option>
        {/if}
        {#each languages as language}
            <option value="{language}" disabled={language === selected_value}>{language}</option>
        {/each}
    </select>
</div>
