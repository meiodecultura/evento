<script lang="ts">
  import { resolve } from '$app/paths';
</script>

<svelte:head>
  <title>Meio de Cultura — Foto personalizada</title>
</svelte:head>

<div class="screen">
  <div class="card">
    <h1>Meio de Cultura</h1>
    <p class="subtitle">
      Este app roda por evento. Acesse pelo link específico do seu evento, algo como
      <code>/nome-do-evento/</code>.
    </p>
    <a class="btn btn-primary" href={resolve('/[slug]', { slug: 'demo' })}>Ver demonstração</a>
  </div>
</div>

<style>
  h1 {
    font-size: 1.75rem;
    font-weight: 800;
  }

  .subtitle {
    color: var(--text-dim);
  }

  code {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 0.1rem 0.4rem;
  }
</style>
