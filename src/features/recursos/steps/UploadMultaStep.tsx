import React, { useCallback, useState } from 'react';
import { Upload, Camera, FileText, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRecursoStore } from '../../../stores/recursoStore';
import type { FileUpload } from '../../../types';

export function UploadMultaStep() {
  const { uploadedFile, setUploadedFile, setWizardError } = useRecursoStore();
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setWizardError('Tipo de arquivo não suportado. Use JPG, PNG ou PDF.');
      return;
    }

    // Validar tamanho (máx 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setWizardError('Arquivo muito grande. Máximo 10MB.');
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      const fileUpload: FileUpload = {
        file,
        preview,
        type: file.type.startsWith('image/') ? 'image' : 'pdf',
        size: file.size,
      };
      
      setUploadedFile(fileUpload);
      setWizardError(undefined);
    };
    
    reader.readAsDataURL(file);
  }, [setUploadedFile, setWizardError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleCameraCapture = useCallback(() => {
    // Implementar captura de câmera (futuro)
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Câmera traseira
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    };
    input.click();
  }, [handleFileSelect]);

  const removeFile = () => {
    setUploadedFile(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Título e Descrição */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-ink mb-3">Upload da Multa</h3>
        <p className="text-muted max-w-2xl mx-auto leading-relaxed">
          Envie uma foto clara da multa ou o arquivo PDF. Nosso sistema irá extrair automaticamente 
          os dados necessários para gerar seu recurso.
        </p>
      </div>

      {!uploadedFile ? (
        <>
          {/* Área de Upload */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition ${
              dragActive
                ? 'border-brand bg-brand-soft/30'
                : 'border-ink/20 hover:border-brand/50 hover:bg-brand-soft/10'
            }`}
          >
            <div className="flex flex-col items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-soft text-brand-emphasis">
                <Upload size={32} strokeWidth={2} />
              </div>

              <div>
                <h4 className="text-lg font-semibold text-ink mb-2">
                  Arraste e solte sua multa aqui
                </h4>
                <p className="text-muted mb-4">
                  ou clique para selecionar arquivo
                </p>
                <p className="text-xs text-muted">
                  Formatos aceitos: JPG, PNG, PDF • Máximo 10MB
                </p>
              </div>

              <div className="flex gap-3">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-lg hover:bg-brand-emphasis transition font-semibold">
                    <FileText size={18} />
                    Selecionar Arquivo
                  </div>
                </label>

                <button
                  onClick={handleCameraCapture}
                  className="flex items-center gap-2 px-6 py-3 border border-brand text-brand rounded-lg hover:bg-brand-soft/30 transition font-semibold"
                >
                  <Camera size={18} />
                  Usar Câmera
                </button>
              </div>
            </div>
          </div>

          {/* Dicas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TipCard
              icon={<Camera size={20} className="text-blue-600" />}
              title="Foto Clara"
              description="Certifique-se de que o texto está legível e bem iluminado"
            />
            <TipCard
              icon={<FileText size={20} className="text-green-600" />}
              title="Documento Completo"
              description="Inclua todas as informações da multa na foto ou PDF"
            />
            <TipCard
              icon={<CheckCircle2 size={20} className="text-purple-600" />}
              title="Qualidade Alta"
              description="Use a maior resolução possível para melhor extração"
            />
          </div>
        </>
      ) : (
        /* Preview do Arquivo */
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className="text-green-600" />
              <div>
                <p className="font-semibold text-green-800">Arquivo carregado com sucesso!</p>
                <p className="text-sm text-green-600">
                  {uploadedFile.file.name} • {formatFileSize(uploadedFile.size)}
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Preview */}
          <div className="border border-ink/20 rounded-2xl overflow-hidden">
            {uploadedFile.type === 'image' ? (
              <img
                src={uploadedFile.preview}
                alt="Preview da multa"
                className="w-full max-h-96 object-contain bg-gray-50"
              />
            ) : (
              <div className="flex items-center justify-center h-48 bg-gray-50">
                <div className="text-center">
                  <FileText size={48} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600 font-semibold">Arquivo PDF</p>
                  <p className="text-sm text-gray-500">{uploadedFile.file.name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="flex justify-center">
            <button
              onClick={removeFile}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
            >
              <X size={16} />
              Remover e Enviar Outro
            </button>
          </div>
        </div>
      )}

      {/* Informações Importantes */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold text-amber-800 mb-1">Informações Importantes</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Certifique-se de que todos os dados da multa estão visíveis</li>
              <li>• Evite reflexos, sombras ou texto cortado</li>
              <li>• Para PDFs, use o arquivo original quando possível</li>
              <li>• Seus dados são processados localmente e não são enviados para servidores</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function TipCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
}) {
  return (
    <div className="p-4 bg-surface border border-ink/8 rounded-xl">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <h4 className="font-semibold text-ink">{title}</h4>
      </div>
      <p className="text-sm text-muted leading-relaxed">{description}</p>
    </div>
  );
}