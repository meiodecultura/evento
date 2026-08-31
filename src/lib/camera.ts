export type FacingMode = 'user' | 'environment';

export type CaptureResult = {
  blob: Blob;
  url: string;
};

export async function startStream(facingMode: FacingMode): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    video: { facingMode, width: { ideal: 1280 }, height: { ideal: 1280 } },
    audio: false
  });
}

export function stopStream(stream: MediaStream | null | undefined): void {
  stream?.getTracks().forEach((track) => track.stop());
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Não foi possível carregar a logo do evento.'));
    img.src = src;
  });
}

/**
 * Desenha o frame atual do vídeo num canvas e sobrepõe a logo no canto
 * inferior direito. Espelha o quadro quando a câmera é frontal, para o
 * resultado final combinar com a pré-visualização (efeito espelho).
 */
export async function captureFrameWithLogo(
  video: HTMLVideoElement,
  logo: HTMLImageElement,
  facingMode: FacingMode
): Promise<CaptureResult> {
  const width = video.videoWidth;
  const height = video.videoHeight;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Este navegador não suporta captura de imagem.');

  ctx.save();
  if (facingMode === 'user') {
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, 0, 0, width, height);
  ctx.restore();

  const margin = width * 0.045;
  const logoWidth = width * 0.34;
  const logoHeight = logoWidth * (logo.naturalHeight / logo.naturalWidth);
  ctx.drawImage(logo, width - logoWidth - margin, height - logoHeight - margin, logoWidth, logoHeight);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('Falha ao gerar a imagem.'))),
      'image/jpeg',
      0.92
    );
  });

  return { blob, url: URL.createObjectURL(blob) };
}

export function describeCameraError(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      return 'Precisamos da sua permissão para usar a câmera. Verifique as configurações do navegador e tente de novo.';
    }
    if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      return 'Não encontramos nenhuma câmera neste dispositivo.';
    }
    if (error.name === 'NotReadableError') {
      return 'A câmera está sendo usada por outro aplicativo. Feche-o e tente novamente.';
    }
  }
  return 'Não foi possível acessar a câmera. Tente novamente.';
}
