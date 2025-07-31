<script lang="ts">
  interface PropsType {
    name: string;
    title: string;
    languages: string[];
    selected_value: string;
    value?: string;
  };

  let { name, title, languages, selected_value, value = $bindable() }: PropsType = $props();
</script>
<div>
    <select name={name} class="form-select" bind:value>
        <option disabled selected value="">{title}</option>
        {#each languages as language}
            <option value="{language}" disabled={language === selected_value}>{language}</option>
        {/each}
    </select>
</div>
