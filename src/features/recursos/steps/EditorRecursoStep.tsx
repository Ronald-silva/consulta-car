import React, { useState, useEffect } from 'react';
import { User, FileText, CheckSquare, Edit3 } from 'lucide-react';
import { useRecursoStore } from '../../../stores/recursoStore';
import { generateRecursoText } from '../../../services/iaService';
import type { RecorrenteData } from '../../../types';

export function EditorRecursoStep() {
  const { currentRecurso, updateRecurso } = useRecursoStore();
  
  const [recorrenteData, setRecorrenteData] = useState<RecorrenteData>({
    nome: '',
    cpf: '',
    cnh: '',
    endereco: {
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: '',
      cep: '',
    },
    telefone: '',
    email: '',
  });

  const [tipoRecurso, setTipoRecurso] = useState<'defesa_previa' | 'recurso_jari'>('defesa_previa');
  const [argumentosSelecionados, setArgumentosSelecionados] = useState<string[]>([]);
  const [textoPersonalizado, setTextoPersonalizado] = useState('');
  const [textoGerado, setTextoGerado] = useState('');

  useEffect(() => {
    if (currentRecurso?.recorrente) {
      setRecorrenteData(currentRecurso.recorrente);
    }
    if (currentRecurso?.tipoRecurso) {
      setTipoRecurso(currentRecurso.tipoRecurso);
    }
    if (currentRecurso?.argumentosSelecionados) {
      setArgumentosSelecionados(currentRecurso.argumentosSelecionados);
    }
    if (currentRecurso?.textoPersonalizado) {
      setTextoPersonalizado(currentRecurso.textoPersonalizado);
    }
  }, [currentRecurso]);

  const handleSaveData = () => {
    updateRecurso({
      recorrente: recorrenteData,
      tipoRecurso,
      argumentosSelecionados,
      textoPersonalizado,
    });
  };

  const handleArgumentoToggle = (argumento: string) => {
    const updated = argumentosSelecionados.includes(argumento)
      ? argumentosSelecionados.filter(a => a !== argumento)
      : [...argumentosSelecionados, argumento];
    
    setArgumentosSelecionados(updated);
  };

  const handleGenerateText = async () => {
    if (!currentRecurso?.iaAnalysis || !currentRecurso?.ocrData) return;

    try {
      const texto = await generateRecursoText(
        currentRecurso.iaAnalysis,
        recorrenteData.nome,
        currentRecurso.ocrData.numeroAuto,
        argumentosSelecionados
      );
      setTextoGerado(texto);
    } catch (error) {
      console.error('Erro ao gerar texto:', error);
    }
  };

  const documentosNecessarios = [
    'Cópia da CNH do condutor',
    'Cópia do CRLV do veículo',
    'Cópia do RG e CPF do recorrente',
    'Comprovante de residência',
    'Fotos do local da infração (se aplicável)',
    'Laudo técnico do equipamento (se disponível)',
  ];

  return (
    <div className="space-y-8">
      {/* Título */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-ink mb-3">Editor do Recurso</h3>
        <p className="text-muted max-w-2xl mx-auto leading-relaxed">
          Complete seus dados pessoais, selecione os argumentos e personalize seu recurso.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coluna 1: Dados e Configurações */}
        <div className="space-y-6">
          {/* Dados do Recorrente */}
          <div className="p-6 bg-surface border border-ink/8 rounded-xl">
            <h4 className="font-semibold text-ink mb-4 flex items-center gap-2">
              <User size={18} className="text-brand" />
              Dados do Recorrente
            </h4>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nome completo *"
                  value={recorrenteData.nome}
                  onChange={(e) => setRecorrenteData(prev => ({ ...prev, nome: e.target.value }))}
                  className="w-full px-3 py-2 border border-ink/20 rounded-lg focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none"
                />
                <input
                  type="text"
                  placeholder="CPF *"
                  value={recorrenteData.cpf}
                  onChange={(e) => setRecorrenteData(prev => ({ ...prev, cpf: e.target.value }))}
                  className="w-full px-3 py-2 border border-ink/20 rounded-lg focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none"
                />
              </div>
              
              <input
                type="text"
                placeholder="Número da CNH *"
                value={recorrenteData.cnh}
                onChange={(e) => setRecorrenteData(prev => ({ ...prev, cnh: e.target.value }))}
                className="w-full px-3 py-2 border border-ink/20 rounded-lg focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none"
              />

              <div className="grid grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Logradouro *"
                  value={recorrenteData.endereco.logradouro}
                  onChange={(e) => setRecorrenteData(prev => ({ 
                    ...prev, 
                    endereco: { ...prev.endereco, logradouro: e.target.value }
                  }))}
                  className="col-span-2 px-3 py-2 border border-ink/20 rounded-lg focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none"
                />
                <input
                  type="text"
                  placeholder="Número *"
                  value={recorrenteData.endereco.numero}
                  onChange={(e) => setRecorrenteData(prev => ({ 
                    ...prev, 
                    endereco: { ...prev.endereco, numero: e.target.value }
                  }))}
                  className="px-3 py-2 border border-ink/20 rounded-lg focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Bairro *"
                  value={recorrenteData.endereco.bairro}
                  onChange={(e) => setRecorrenteData(prev => ({ 
                    ...prev, 
                    endereco: { ...prev.endereco, bairro: e.target.value }
                  }))}
                  className="px-3 py-2 border border-ink/20 rounded-lg focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none"
                />
                <input
                  type="text"
                  placeholder="CEP *"
                  value={recorrenteData.endereco.cep}
                  onChange={(e) => setRecorrenteData(prev => ({ 
                    ...prev, 
                    endereco: { ...prev.endereco, cep: e.target.value }
                  }))}
                  className="px-3 py-2 border border-ink/20 rounded-lg focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Cidade *"
                  value={recorrenteData.endereco.cidade}
                  onChange={(e) => setRecorrenteData(prev => ({ 
                    ...prev, 
                    endereco: { ...prev.endereco, cidade: e.target.value }
                  }))}
                  className="col-span-2 px-3 py-2 border border-ink/20 rounded-lg focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none"
                />
                <select
                  value={recorrenteData.endereco.uf}
                  onChange={(e) => setRecorrenteData(prev => ({ 
                    ...prev, 
                    endereco: { ...prev.endereco, uf: e.target.value }
                  }))}
                  className="px-3 py-2 border border-ink/20 rounded-lg focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none"
                >
                  <option value="">UF *</option>
                  <option value="CE">CE</option>
                  <option value="SP">SP</option>
                  <option value="RJ">RJ</option>
                  {/* Adicionar outros estados */}
                </select>
              </div>
            </div>
          </div>

          {/* Tipo de Recurso */}
          <div className="p-6 bg-surface border border-ink/8 rounded-xl">
            <h4 className="font-semibold text-ink mb-4">Tipo de Recurso</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="tipoRecurso"
                  value="defesa_previa"
                  checked={tipoRecurso === 'defesa_previa'}
                  onChange={(e) => setTipoRecurso(e.target.value as any)}
                  className="text-brand"
                />
                <div>
                  <p className="font-semibold">Defesa Prévia</p>
                  <p className="text-sm text-muted">Primeira oportunidade de defesa</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="tipoRecurso"
                  value="recurso_jari"
                  checked={tipoRecurso === 'recurso_jari'}
                  onChange={(e) => setTipoRecurso(e.target.value as any)}
                  className="text-brand"
                />
                <div>
                  <p className="font-semibold">Recurso à JARI</p>
                  <p className="text-sm text-muted">Após indeferimento da defesa prévia</p>
                </div>
              </label>
            </div>
          </div>

          {/* Checklist de Documentos */}
          <div className="p-6 bg-surface border border-ink/8 rounded-xl">
            <h4 className="font-semibold text-ink mb-4 flex items-center gap-2">
              <CheckSquare size={18} className="text-green-600" />
              Documentos Necessários
            </h4>
            <div className="space-y-2">
              {documentosNecessarios.map((doc, index) => (
                <label key={index} className="flex items-center gap-3 cursor-pointer text-sm">
                  <input type="checkbox" className="text-brand" />
                  {doc}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna 2: Argumentos e Texto */}
        <div className="space-y-6">
          {/* Argumentos Selecionados */}
          {currentRecurso?.iaAnalysis && (
            <div className="p-6 bg-surface border border-ink/8 rounded-xl">
              <h4 className="font-semibold text-ink mb-4">Argumentos para o Recurso</h4>
              <div className="space-y-3">
                {currentRecurso.iaAnalysis.argumentos.map((argumento, index) => (
                  <label key={index} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={argumentosSelecionados.includes(argumento.tipo)}
                      onChange={() => handleArgumentoToggle(argumento.tipo)}
                      className="mt-1 text-brand"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{argumento.tipo}</p>
                      <p className="text-xs text-muted">{argumento.descricao}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Texto Personalizado */}
          <div className="p-6 bg-surface border border-ink/8 rounded-xl">
            <h4 className="font-semibold text-ink mb-4 flex items-center gap-2">
              <Edit3 size={18} className="text-blue-600" />
              Texto Personalizado
            </h4>
            <textarea
              value={textoPersonalizado}
              onChange={(e) => setTextoPersonalizado(e.target.value)}
              placeholder="Adicione observações ou argumentos adicionais..."
              rows={6}
              className="w-full px-3 py-2 border border-ink/20 rounded-lg focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none resize-none"
            />
            
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleGenerateText}
                disabled={argumentosSelecionados.length === 0}
                className="px-4 py-2 text-sm font-semibold text-white bg-brand rounded-lg hover:bg-brand-emphasis disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Gerar Texto com IA
              </button>
              <button
                onClick={handleSaveData}
                className="px-4 py-2 text-sm font-semibold text-brand border border-brand rounded-lg hover:bg-brand-soft/30 transition"
              >
                Salvar Alterações
              </button>
            </div>
          </div>

          {/* Preview do Texto Gerado */}
          {textoGerado && (
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl">
              <h4 className="font-semibold text-gray-800 mb-3">Preview do Recurso</h4>
              <div className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-4 rounded border max-h-60 overflow-y-auto">
                {textoGerado}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}