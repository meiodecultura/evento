<script lang="ts">
  import {
    startStream,
    stopStream,
    loadImage,
    captureFrameWithLogo,
    describeCameraError,
    type FacingMode,
    type CaptureResult
  } from '$lib/camera';
  import PrivacyNote from './PrivacyNote.svelte';

  let {
    logo,
    onback,
    oncapture
  }: {
    logo: string;
    onback: () => void;
    oncapture: (result: CaptureResult) => void;
  } = $props();

  let status = $state<'loading' | 'ready' | 'counting' | 'error'>('loading');
  let errorMessage = $state('');
  let facingMode = $state<FacingMode>('user');
  let retryToken = $state(0);
  let countdown = $state(0);
  let videoEl: HTMLVideoElement | undefined = $state();
  let stream: MediaStream | null = null;
  let logoImg: HTMLImageElement | null = null;

  $effect(() => {
    const mode = facingMode;
    retryToken;
    let cancelled = false;

    status = 'loading';
    errorMessage = '';

    (async () => {
      try {
        const [newStream, img] = await Promise.all([startStream(mode), logoImg ? Promise.resolve(logoImg) : loadImage(logo)]);
        if (cancelled) {
          stopStream(newStream);
          return;
        }
        logoImg = img;
        stream = newStream;
        if (videoEl) videoEl.srcObject = newStream;
        status = 'ready';
      } catch (err) {
        if (!cancelled) {
          errorMessage = describeCameraError(err);
          status = 'error';
        }
      }
    })();

    return () => {
      cancelled = true;
      stopStream(stream);
      stream = null;
    };
  });

  function flipCamera() {
    facingMode = facingMode === 'user' ? 'environment' : 'user';
  }

  async function takePhoto() {
    if (status !== 'ready' || !videoEl || !logoImg) return;

    for (const n of [3, 2, 1]) {
      countdown = n;
      status = 'counting';
      await new Promise((resolve) => setTimeout(resolve, 700));
    }

    try {
      const result = await captureFrameWithLogo(videoEl, logoImg, facingMode);
      stopStream(stream);
      stream = null;
      oncapture(result);
    } catch (err) {
      errorMessage = describeCameraError(err);
      status = 'error';
    }
  }
</script>

<div class="screen">
  <div class="card">
    <button class="btn btn-text back" onclick={onback} aria-label="Voltar">← Voltar</button>

    <div class="viewport">
      <video bind:this={videoEl} autoplay playsinline muted class:mirrored={facingMode === 'user'}></video>

      {#if status === 'loading'}
        <div class="overlay">
          <p>Ligando a câmera…</p>
        </div>
      {:else if status === 'error'}
        <div class="overlay">
          <p>{errorMessage}</p>
          <button class="btn btn-primary" onclick={() => (retryToken += 1)}>Tentar de novo</button>
        </div>
      {:else if status === 'counting'}
        <div class="overlay countdown">
          <span>{countdown}</span>
        </div>
      {/if}
    </div>

    <div class="controls">
      <button class="btn btn-ghost" onclick={flipCamera} disabled={status !== 'ready'} aria-label="Trocar câmera">
        ⟲ Trocar câmera
      </button>
      <button class="btn btn-primary shutter" onclick={takePhoto} disabled={status !== 'ready'} aria-label="Tirar foto">
        📸 Tirar foto
      </button>
    </div>

    <PrivacyNote text="A imagem é processada aqui mesmo, no seu navegador. Nada é enviado a nenhum servidor." />
  </div>
</div>

<style>
  .back {
    align-self: flex-start;
  }

  .viewport {
    position: relative;
    width: 100%;
    aspect-ratio: 3 / 4;
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: #000;
    border: 1px solid var(--border);
  }

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  video.mirrored {
    transform: scaleX(-1);
  }

  .overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    background: rgba(10, 6, 20, 0.65);
    text-align: center;
    padding: 1.5rem;
  }

  .countdown span {
    font-size: 5rem;
    font-weight: 800;
  }

  .controls {
    width: 100%;
    display: flex;
    gap: 0.75rem;
  }

  .shutter {
    flex: 1;
  }
</style>
