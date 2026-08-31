<script lang="ts">
  import { asset } from '$app/paths';
  import type { EventConfig } from '$lib/config/events';
  import PrivacyNote from './PrivacyNote.svelte';

  let { event, onstart }: { event: EventConfig; onstart: () => void } = $props();
</script>

<div class="screen">
  <div class="card">
    <img class="logo" src={asset(event.logo)} alt={event.eventName} />

    <div class="heading">
      <h1>{event.welcomeTitle}</h1>
      {#if event.welcomeSubtitle}
        <p class="subtitle">{event.welcomeSubtitle}</p>
      {/if}
    </div>

    <button class="btn btn-primary btn-cta" onclick={onstart}>
      {event.ctaLabel}
    </button>

    <PrivacyNote />
  </div>
</div>

<style>
  .logo {
    max-width: 12rem;
    max-height: 6rem;
    width: auto;
    height: auto;
  }

  .heading {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  h1 {
    font-size: 1.75rem;
    font-weight: 800;
    line-height: 1.25;
  }

  .subtitle {
    color: var(--text-dim);
    font-size: 1rem;
  }

  .btn-cta {
    width: 100%;
    padding: 1.15rem 1.5rem;
    font-size: 1.1rem;
  }
</style>
