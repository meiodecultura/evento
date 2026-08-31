<script lang="ts">
  import type { EventQuestion } from '$lib/config/events';
  import PrivacyNote from './PrivacyNote.svelte';

  let {
    questions,
    onback,
    oncomplete
  }: {
    questions: EventQuestion[];
    onback: () => void;
    oncomplete: (answers: Record<string, string>) => void;
  } = $props();

  let index = $state(0);
  let answers = $state<Record<string, string>>({});

  let current = $derived(questions[index]);
  let isFirst = $derived(index === 0);

  function choose(option: EventQuestion['options'][number]) {
    answers = { ...answers, [current.id]: option.label };
    if (index < questions.length - 1) {
      index += 1;
    } else {
      oncomplete(answers);
    }
  }

  function goBack() {
    if (isFirst) {
      onback();
    } else {
      index -= 1;
    }
  }
</script>

<div class="screen">
  <div class="card">
    <div class="top-row">
      <button class="btn btn-text" onclick={goBack} aria-label="Voltar">← Voltar</button>
      {#if questions.length > 1}
        <div class="dots" role="progressbar" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={questions.length}>
          {#each questions as _, i (i)}
            <span class="dot" class:active={i === index}></span>
          {/each}
        </div>
      {/if}
    </div>

    <h2>{current.prompt}</h2>

    <div class="options">
      {#each current.options as option (option.id)}
        <button class="option" onclick={() => choose(option)}>
          {#if option.emoji}
            <span class="emoji" aria-hidden="true">{option.emoji}</span>
          {/if}
          <span>{option.label}</span>
        </button>
      {/each}
    </div>

    <PrivacyNote />
  </div>
</div>

<style>
  .top-row {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .dots {
    display: flex;
    gap: 0.4rem;
  }

  .dot {
    width: 0.45rem;
    height: 0.45rem;
    border-radius: 50%;
    background: var(--border);
  }

  .dot.active {
    background: var(--accent);
  }

  h2 {
    font-size: 1.4rem;
    font-weight: 700;
    line-height: 1.35;
  }

  .options {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.1rem 0.75rem;
    border-radius: var(--radius-md);
    background: var(--surface);
    border: 1px solid var(--border);
    cursor: pointer;
    font-weight: 600;
    transition:
      transform 0.15s ease,
      background 0.15s ease;
  }

  .option:hover {
    background: var(--surface-strong);
  }

  .option:active {
    transform: scale(0.96);
  }

  .emoji {
    font-size: 2rem;
  }
</style>
