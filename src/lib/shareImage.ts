import { toBlob } from 'html-to-image';

export async function captureElementAsPng(el: HTMLElement): Promise<Blob> {
  const blob = await toBlob(el, { pixelRatio: 2, backgroundColor: '#ffffff' });
  if (!blob) throw new Error('Failed to generate image');
  return blob;
}

export async function shareOrDownloadImage(
  blob: Blob,
  filename: string,
  shareTitle: string,
): Promise<'shared' | 'downloaded'> {
  const file = new File([blob], filename, { type: 'image/png' });

  const nav = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean;
    share?: (data: ShareData) => Promise<void>;
  };

  if (nav.canShare?.({ files: [file] }) && nav.share) {
    await nav.share({ files: [file], title: shareTitle });
    return 'shared';
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return 'downloaded';
}
