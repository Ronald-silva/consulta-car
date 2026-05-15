/**
 * OCR 100% no navegador (Tesseract). Na primeira execução baixa modelos por rede.
 */
export async function recognizeTextFromImageFile(
  file: File,
  onProgress?: (ratio: number) => void,
): Promise<string> {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('por+eng', 1, {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === 'recognizing text' && typeof m.progress === 'number') {
        onProgress?.(Math.min(1, Math.max(0, m.progress)));
      }
    },
  });
  try {
    const {
      data: { text },
    } = await worker.recognize(file);
    return text;
  } finally {
    await worker.terminate();
  }
}
