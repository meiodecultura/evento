<script lang="ts">
  let {
    text = 'Sua foto nunca sai do seu navegador. Guardamos só a resposta desta pergunta, de forma anônima — sem nome, e-mail ou qualquer dado que identifique você.'
  }: { text?: string } = $props();
</script>

<p class="privacy-note">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="4" y="10" width="16" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
  <span>{text}</span>
</p>
