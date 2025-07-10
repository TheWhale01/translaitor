<script lang="ts">
  interface PropsType {
    name: string;
    title: string;
    languages: string[];
    value?: string;
  };

  let { name, title, languages, value = $bindable() }: PropsType = $props();
</script>
<div>
    <select name={name} class="form-select" bind:value>
        <option disabled selected value="">{title}</option>
        {#each languages as language}
            <option value="{language}">{language}</option>
        {/each}
    </select>
</div>
