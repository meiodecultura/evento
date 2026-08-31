<script lang="ts">
  import '$lib/styles/app.css';

  let { children }: { children: import('svelte').Snippet } = $props();
</script>

{@render children()}
