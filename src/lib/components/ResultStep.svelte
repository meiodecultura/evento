<script lang="ts">
  import PrivacyNote from './PrivacyNote.svelte';

  let {
    photoUrl,
    photoBlob,
    eventName,
    onretake,
    onfinish
  }: {
    photoUrl: string;
    photoBlob: Blob;
    eventName: string;
    onretake: () => void;
    onfinish: () => void;
  } = $props();

  let shareState = $state<'idle' | 'sharing' | 'unsupported'>('idle');
  let canShareFiles = $derived(checkCanShareFiles(photoBlob));

  function checkCanShareFiles(blob: Blob): boolean {
    if (typeof navigator === 'undefined' || !navigator.canShare) return false;
    try {
      return navigator.canShare({ files: [new File([blob], 'foto.jpg', { type: blob.type })] });
    } catch {
      return false;
    }
  }

  async function share() {
    shareState = 'sharing';
    try {
      const file = new File([photoBlob], `${eventName.replace(/\s+/g, '-').toLowerCase()}.jpg`, {
        type: photoBlob.type
      });
      await navigator.share({ files: [file], title: eventName });
    } catch {
      // usuário cancelou o compartilhamento ou o navegador recusou — sem problema
    } finally {
      shareState = 'idle';
    }
  }

  function download() {
    const a = document.createElement('a');
    a.href = photoUrl;
    a.download = `${eventName.replace(/\s+/g, '-').toLowerCase()}.jpg`;
    a.click();
  }
</script>

<div class="screen">
  <div class="card">
    <h2>Ficou assim!</h2>

    <img class="photo" src={photoUrl} alt="Sua foto personalizada" />

    <div class="actions">
      {#if canShareFiles}
        <button class="btn btn-primary" onclick={share} disabled={shareState === 'sharing'}>
          {shareState === 'sharing' ? 'Abrindo…' : '↗ Compartilhar'}
        </button>
      {/if}
      <button class="btn {canShareFiles ? 'btn-ghost' : 'btn-primary'}" onclick={download}>
        ⬇ Baixar foto
      </button>
    </div>

    <button class="btn btn-text" onclick={onretake}>Tirar outra foto</button>

    <PrivacyNote text="Assim que você sair desta página, a foto desaparece — não guardamos nenhuma cópia." />

    <button class="btn btn-ghost finish" onclick={onfinish}>Finalizar e voltar ao início</button>
  </div>
</div>

<style>
  h2 {
    font-size: 1.5rem;
    font-weight: 800;
  }

  .photo {
    width: 100%;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border);
  }

  .actions {
    width: 100%;
    display: flex;
    gap: 0.75rem;
  }

  .actions .btn {
    flex: 1;
  }

  .finish {
    width: 100%;
    margin-top: 0.5rem;
  }
</style>
