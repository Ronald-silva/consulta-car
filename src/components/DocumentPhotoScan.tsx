import React, { useId, useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { recognizeTextFromImageFile } from '../utils/ocrTesseract';
import { parseCnhFromOcr, parseCrlvFromOcr, type CnhOcrFill, type VehicleOcrFill } from '../utils/ocrExtract';

type VehicleProps = {
  mode: 'vehicle';
  onFill: (data: VehicleOcrFill) => void;
};

type CnhProps = {
  mode: 'cnh';
  onFill: (data: CnhOcrFill) => void;
};

type Props = VehicleProps | CnhProps;

export function DocumentPhotoScan(props: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hint, setHint] = useState<string | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setHint('Use uma imagem (JPG, PNG, WEBP…).');
      return;
    }
    setBusy(true);
    setHint(null);
    setProgress(0);
    try {
      const text = await recognizeTextFromImageFile(file, setProgress);
      if (props.mode === 'vehicle') {
        const data = parseCrlvFromOcr(text);
        props.onFill(data);
        const n = [data.plate, data.renavam, data.chassis, data.brandModel, data.year].filter(Boolean).length;
        setHint(
          n > 0
            ? `Encontramos ${n} campo(s). Confira tudo antes de salvar — o OCR pode errar.`
            : 'Não achamos placa/RENAVAM/chassi nítidos. Tente foto reta, com luz e sem reflexo.',
        );
      } else {
        const data = parseCnhFromOcr(text);
        props.onFill(data);
        const n = [data.name, data.number, data.cpf].filter(Boolean).length;
        setHint(
          n > 0
            ? `Encontramos ${n} campo(s). Confira nome, registro e CPF antes de salvar.`
            : 'Não achamos CPF ou registro nítidos. Melhore o foco e a iluminação.',
        );
      }
    } catch {
      setHint('Falha ao ler a imagem. Verifique sua conexão (primeira vez baixa o idioma do OCR).');
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };

  const title = props.mode === 'vehicle' ? 'CRLV ou documento do veículo' : 'CNH (frente ou verso com dados)';

  return (
    <div className="rounded-2xl border border-dashed border-ink/15 bg-canvas/80 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-xl bg-brand-soft p-2 text-brand-emphasis">
          <Camera size={20} strokeWidth={2} aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-semibold text-ink">Preencher pela foto</p>
          <p className="text-xs text-muted leading-relaxed">
            {title}: o texto é extraído <strong className="text-ink font-semibold">só neste aparelho</strong>. A imagem
            não é enviada aos nossos servidores (na 1ª vez o navegador baixa o pacote de idioma do Tesseract).
          </p>
        </div>
      </div>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        disabled={busy}
        onChange={handleChange}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-brand/35 bg-surface px-4 py-3 text-sm font-bold text-brand-emphasis transition hover:border-brand hover:bg-brand-soft/50 disabled:opacity-60"
      >
        {busy ? (
          <>
            <Loader2 className="animate-spin shrink-0" size={18} aria-hidden />
            Lendo imagem… {progress > 0 ? `${Math.round(progress * 100)}%` : ''}
          </>
        ) : (
          <>
            <Camera size={18} aria-hidden />
            Escolher foto
          </>
        )}
      </button>
      {hint && <p className="text-xs text-muted leading-relaxed">{hint}</p>}
    </div>
  );
}
