import { toBlob, toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export async function captureElementAsPng(el: HTMLElement): Promise<Blob> {
  const blob = await toBlob(el, { pixelRatio: 2, backgroundColor: '#ffffff' });
  if (!blob) throw new Error('Failed to generate image');
  return blob;
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load captured image'));
    img.src = dataUrl;
  });
}

export async function captureElementAsPdf(el: HTMLElement): Promise<Blob> {
  const dataUrl = await toPng(el, { pixelRatio: 2, backgroundColor: '#ffffff' });
  const img = await loadImage(dataUrl);
  const { naturalWidth: width, naturalHeight: height } = img;
  const pdf = new jsPDF({
    orientation: width >= height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [width, height],
  });
  pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
  return pdf.output('blob');
}

export async function shareOrDownloadImage(
  blob: Blob,
  filename: string,
  shareTitle: string,
  mimeType: string = 'image/png',
): Promise<'shared' | 'downloaded'> {
  const file = new File([blob], filename, { type: mimeType });

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
