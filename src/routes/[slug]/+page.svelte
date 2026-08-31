<script lang="ts">
  import { asset } from '$app/paths';
  import WelcomeStep from '$lib/components/WelcomeStep.svelte';
  import QuestionStep from '$lib/components/QuestionStep.svelte';
  import CameraStep from '$lib/components/CameraStep.svelte';
  import ResultStep from '$lib/components/ResultStep.svelte';
  import type { CaptureResult } from '$lib/camera';
  import { saveResponse } from '$lib/responses';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  let event = $derived(data.event);

  type Step = 'welcome' | 'question' | 'camera' | 'result';
  let step = $state<Step>('welcome');
  let photo = $state<CaptureResult | null>(null);

  function revokePhoto() {
    if (photo) URL.revokeObjectURL(photo.url);
    photo = null;
  }

  function handleCapture(result: CaptureResult) {
    revokePhoto();
    photo = result;
    step = 'result';
  }

  function handleQuestionsComplete(answers: Record<string, string>) {
    saveResponse(event.slug, answers);
    step = 'camera';
  }

  function retake() {
    revokePhoto();
    step = 'camera';
  }

  function restart() {
    revokePhoto();
    step = 'welcome';
  }

  $effect(() => {
    return () => revokePhoto();
  });
</script>

<svelte:head>
  <title>{event.eventName} — Foto personalizada</title>
</svelte:head>

{#if step === 'welcome'}
  <WelcomeStep {event} onstart={() => (step = 'question')} />
{:else if step === 'question'}
  <QuestionStep
    questions={event.questions}
    onback={() => (step = 'welcome')}
    oncomplete={handleQuestionsComplete}
  />
{:else if step === 'camera'}
  <CameraStep
    logo={asset(event.logo)}
    onback={() => (step = 'question')}
    oncapture={handleCapture}
  />
{:else if step === 'result' && photo}
  <ResultStep
    photoUrl={photo.url}
    photoBlob={photo.blob}
    eventName={event.eventName}
    onretake={retake}
    onfinish={restart}
  />
{/if}
