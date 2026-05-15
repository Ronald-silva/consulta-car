/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  Car,
  User,
  Settings,
  Search,
  CheckCircle2,
  X,
  Pin,
  Pencil,
  GripVertical,
  Share2,
  CalendarPlus,
  FileDown,
  Calculator,
  Gavel,
  TrendingUp,
  FileText,
  Shield,
  Smartphone,
  Zap,
  MoreHorizontal,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Vehicle, CNH, ServiceLinks } from './types';
import type { LucideIcon } from 'lucide-react';
import { PinOverlay } from './components/PinOverlay';
import { ExtrasModal } from './components/ExtrasModal';
import { VehicleFormModal } from './components/VehicleFormModal';
import { CnhFormModal } from './components/CnhFormModal';
import { CalculatorModal } from './components/CalculatorModal';
import { RecursoWizard } from './features/recursos/RecursoWizard';
import { LaudoVeicular } from './features/laudo/LaudoVeicular';
import { CDTSNEHub } from './features/cdt-sne/CDTSNEHub';
import { CalculadoraEconomia } from './features/calculadora/CalculadoraEconomia';
import { InmetroConsulta } from './features/inmetro/InmetroConsulta';
import { OFFICIAL_SERVICE_LINKS } from './constants/serviceLinks';
import { digitsOnly, formatPlateDisplay, formatCpfDisplay } from './utils/format';
import { isPinConfigured, isSessionUnlocked } from './utils/pin';
import { nextSortOrder, sortCnhs, sortVehicles } from './utils/sort';
import { copyTextThenOpenUrl } from './utils/openExternal';
import { buildVehicleReminderIcs, downloadIcsFile, googleCalendarTemplateUrl } from './utils/calendar';
import { shareCnhSummary, shareVehicleSummary } from './utils/webShare';

const getStored = <T,>(key: string, fallback: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : fallback;
};

function migrateVehicle(v: Vehicle, index = 0): Vehicle {
  return {
    ...v,
    sortOrder: v.sortOrder ?? index * 10,
    pinned: v.pinned ?? false,
  };
}

function migrateCnh(c: CNH, index = 0): CNH {
  return {
    ...c,
    cpf: digitsOnly(c.cpf),
    sortOrder: c.sortOrder ?? index * 10,
    pinned: c.pinned ?? false,
  };
}

type TabId = 'vehicles' | 'cnh' | 'calculator' | 'laudo' | 'cdt-sne' | 'inmetro';

const TABS: { id: TabId; label: string; shortLabel: string; icon: LucideIcon }[] = [
  { id: 'vehicles', label: 'Veículos', shortLabel: 'Veículos', icon: Car },
  { id: 'cnh', label: 'Minha CNH', shortLabel: 'CNH', icon: User },
  { id: 'calculator', label: 'Calculadora', shortLabel: 'Calc', icon: Calculator },
  { id: 'laudo', label: 'Laudo Veicular', shortLabel: 'Laudo', icon: FileText },
];

const TABS_MAIS: { id: TabId; label: string; shortLabel: string; icon: LucideIcon }[] = [
  { id: 'cdt-sne', label: 'CDT + SNE', shortLabel: 'CDT', icon: Smartphone },
  { id: 'inmetro', label: 'Inmetro', shortLabel: 'Inmetro', icon: ShieldAlert },
];

export default function App() {
  const [unlocked, setUnlocked] = useState(() => !isPinConfigured() || isSessionUnlocked());

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const raw = getStored<Vehicle[]>('vehicles', []);
    return raw.map(migrateVehicle);
  });
  const [cnhs, setCnhs] = useState<CNH[]>(() => {
    const raw = getStored<CNH[]>('cnhs', []);
    return raw.map(migrateCnh);
  });
  const [activeTab, setActiveTab] = useState<TabId>('vehicles');
  const [extrasOpen, setExtrasOpen] = useState(false);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [vehicleModalInitial, setVehicleModalInitial] = useState<Vehicle | null>(null);
  const [cnhModalOpen, setCnhModalOpen] = useState(false);
  const [cnhModalInitial, setCnhModalInitial] = useState<CNH | null>(null);
  const [calculatorModalOpen, setCalculatorModalOpen] = useState(false);
  const [recursoWizardOpen, setRecursoWizardOpen] = useState(false);
  const [laudoVeicularOpen, setLaudoVeicularOpen] = useState(false);
  const [cdtSneHubOpen, setCdtSneHubOpen] = useState(false);
  const [inmetroConsultaOpen, setInmetroConsultaOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toast = useCallback((t: string) => {
    setToastMsg(t);
    setTimeout(() => setToastMsg(null), 2800);
  }, []);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'vehicles' || tab === 'cnh' || tab === 'calculator' || tab === 'laudo' || tab === 'cdt-sne' || tab === 'inmetro') {
      setActiveTab(tab);
      params.delete('tab');
      const qs = params.toString();
      window.history.replaceState({}, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`);
    }
  }, []);

  React.useEffect(() => localStorage.setItem('vehicles', JSON.stringify(vehicles)), [vehicles]);
  React.useEffect(() => localStorage.setItem('cnhs', JSON.stringify(cnhs)), [cnhs]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const deleteItem = (id: string, type: 'vehicle' | 'cnh') => {
    if (type === 'vehicle') setVehicles(vehicles.filter((v) => v.id !== id));
    else setCnhs(cnhs.filter((c) => c.id !== id));
  };

  const reorderVehicles = (fromId: string, toId: string) => {
    setVehicles((prev) => {
      const ordered = sortVehicles(prev);
      const fi = ordered.findIndex((x) => x.id === fromId);
      const ti = ordered.findIndex((x) => x.id === toId);
      if (fi < 0 || ti < 0 || fi === ti) return prev;
      const arr = [...ordered];
      const [m] = arr.splice(fi, 1);
      arr.splice(ti, 0, m);
      return arr.map((x, i) => ({ ...x, sortOrder: i * 10 }));
    });
  };

  const reorderCnhs = (fromId: string, toId: string) => {
    setCnhs((prev) => {
      const ordered = sortCnhs(prev);
      const fi = ordered.findIndex((x) => x.id === fromId);
      const ti = ordered.findIndex((x) => x.id === toId);
      if (fi < 0 || ti < 0 || fi === ti) return prev;
      const arr = [...ordered];
      const [m] = arr.splice(fi, 1);
      arr.splice(ti, 0, m);
      return arr.map((x, i) => ({ ...x, sortOrder: i * 10 }));
    });
  };

  const togglePinVehicle = (id: string) => {
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, pinned: !v.pinned } : v)));
  };

  const togglePinCnh = (id: string) => {
    setCnhs((prev) => prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)));
  };

  const filteredVehicles = useMemo(() => {
    const sorted = sortVehicles(vehicles);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(
      (v) =>
        v.nickname.toLowerCase().includes(q) ||
        v.plate.toLowerCase().includes(q) ||
        v.brandModel.toLowerCase().includes(q) ||
        v.renavam.includes(q) ||
        v.chassis.toLowerCase().includes(q) ||
        (v.notes?.toLowerCase().includes(q) ?? false),
    );
  }, [vehicles, searchQuery]);

  const sortedCnhs = useMemo(() => sortCnhs(cnhs), [cnhs]);

  const notice = copyFeedback ? `${copyFeedback} copiado` : toastMsg;

  const title =
    activeTab === 'vehicles'
      ? 'Meus Veículos'
      : activeTab === 'cnh'
      ? 'Minha CNH'
      : activeTab === 'calculator'
      ? 'Calculadora de Economia'
      : activeTab === 'laudo'
      ? 'Laudo Veicular'
      : activeTab === 'cdt-sne'
      ? 'Carteira Digital + SNE'
      : 'Consulta INMETRO';

  const subtitle =
    activeTab === 'vehicles'
      ? 'Gerencie seus veículos e faça consultas rápidas nos portais oficiais.'
      : activeTab === 'cnh'
      ? 'Dados da CNH para consulta de pontuação e serviços.'
      : activeTab === 'calculator'
      ? 'Calcule economia com SNE, simule recursos e analise multas.'
      : activeTab === 'laudo'
      ? 'Consulta completa do veículo com laudo profissional para compra/venda.'
      : activeTab === 'cdt-sne'
      ? 'Ative a Carteira Digital e ganhe até 40% de desconto em multas.'
      : 'Verifique a situação de radares e equipamentos de medição de velocidade.';

  if (!unlocked) {
    return <PinOverlay onUnlocked={() => setUnlocked(true)} />;
  }

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row selection:bg-brand/25 selection:text-ink">
      <aside className="hidden md:flex md:w-64 md:shrink-0 md:flex-col md:min-h-screen md:border-r md:border-ink/8 md:bg-surface/90 md:backdrop-blur-sm md:shadow-[4px_0_24px_-12px_rgba(15,23,42,0.12)] md:p-6">
        <AppBrand className="mb-10" />
        <nav className="space-y-1 flex-1" aria-label="Navegação principal">
          {TABS.map((tab) => (
            <React.Fragment key={tab.id}>
              <SidebarNavItem
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                icon={<tab.icon size={18} strokeWidth={2} aria-hidden />}
                label={tab.label}
              />
            </React.Fragment>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => setExtrasOpen(true)}
          className="mt-6 w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-muted border border-ink/8 bg-canvas/50 hover:bg-canvas hover:text-ink transition-colors"
        >
          <Settings size={18} aria-hidden />
          Privacidade e backup
        </button>
        <p className="mt-6 pt-6 text-center text-xs text-muted border-t border-ink/8">
          by RonalDigital
        </p>
      </aside>

      <header className="md:hidden sticky top-0 z-40 flex items-center gap-3 px-4 py-3.5 bg-surface/85 backdrop-blur-md border-b border-ink/6 shadow-sm shadow-ink/5">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-emphasis text-white shadow-lg shadow-brand/30"
          aria-hidden
        >
          <Car size={22} strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
            Consulta Car
          </p>
          <h1 className="text-lg font-bold tracking-tight text-ink truncate">Meus Veículos</h1>
        </div>
        <button
          type="button"
          onClick={() => setExtrasOpen(true)}
          className="shrink-0 rounded-xl p-2.5 text-muted hover:bg-canvas hover:text-ink transition-colors"
          aria-label="Privacidade e backup"
        >
          <Settings size={22} strokeWidth={2} />
        </button>
      </header>

      <main className="flex-1 min-h-0 min-w-0 overflow-y-auto pb-safe-nav px-4 py-6 md:px-10 md:py-12 md:pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6 md:mb-10">
            <div className="space-y-1.5 min-w-0 flex-1">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-ink">{title}</h2>
              <p className="text-sm md:text-base text-muted leading-relaxed max-w-xl">{subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'vehicles') {
                  setVehicleModalInitial(null);
                  setVehicleModalOpen(true);
                } else if (activeTab === 'cnh') {
                  setCnhModalInitial(null);
                  setCnhModalOpen(true);
                } else if (activeTab === 'calculator') {
                  setCalculatorModalOpen(true);
                } else if (activeTab === 'laudo') {
                  setLaudoVeicularOpen(true);
                } else if (activeTab === 'cdt-sne') {
                  setCdtSneHubOpen(true);
                } else if (activeTab === 'inmetro') {
                  setInmetroConsultaOpen(true);
                }
              }}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/25 transition hover:bg-brand-emphasis hover:shadow-lg hover:shadow-brand/30 active:bg-brand-emphasis active:text-white active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <Plus size={18} strokeWidth={2.5} aria-hidden />
              {activeTab === 'vehicles' ? 'Adicionar veículo' : activeTab === 'cnh' ? 'Cadastrar CNH' : activeTab === 'calculator' ? 'Nova Simulação' : activeTab === 'laudo' ? 'Consultar Veículo' : activeTab === 'cdt-sne' ? 'Configurar CDT + SNE' : 'Consultar Radar'}
            </button>
          </div>

          {activeTab === 'vehicles' && (
            <div className="mb-6">
              <label className="sr-only" htmlFor="search-list">
                Buscar veículos
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle pointer-events-none"
                  size={18}
                  aria-hidden
                />
                <input
                  id="search-list"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por apelido, placa, modelo…"
                  className="w-full rounded-2xl border border-ink/8 bg-surface py-3 pl-11 pr-4 text-sm outline-none transition focus:border-brand focus:ring-1 focus:ring-brand/20"
                />
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {activeTab === 'vehicles' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                  {filteredVehicles.length === 0 ? (
                    <EmptyState
                      icon={<Car size={44} strokeWidth={1.25} className="text-brand" />}
                      message={
                        vehicles.length === 0
                          ? 'Nenhum veículo cadastrado.'
                          : 'Nenhum resultado na busca.'
                      }
                      hint={
                        vehicles.length === 0
                          ? 'Toque em “Adicionar veículo” para guardar placa, RENAVAM e dados do veículo.'
                          : 'Tente outro termo ou limpe a busca.'
                      }
                    />
                  ) : (
                    filteredVehicles.map((vehicle) => (
                      <React.Fragment key={vehicle.id}>
                        <VehicleCard
                          vehicle={vehicle}
                          links={OFFICIAL_SERVICE_LINKS}
                          toast={toast}
                          onCopy={copyToClipboard}
                          onDelete={() => deleteItem(vehicle.id, 'vehicle')}
                          onEdit={() => {
                            setVehicleModalInitial(vehicle);
                            setVehicleModalOpen(true);
                          }}
                          onTogglePin={() => togglePinVehicle(vehicle.id)}
                          onReorder={reorderVehicles}
                        />
                      </React.Fragment>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'cnh' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                  {sortedCnhs.length === 0 ? (
                    <EmptyState
                      icon={<User size={44} strokeWidth={1.25} className="text-brand" />}
                      message="Nenhuma CNH cadastrada."
                      hint="Cadastre nome, número do registro e CPF para copiar com um toque nas consultas."
                    />
                  ) : (
                    sortedCnhs.map((cnh) => (
                      <React.Fragment key={cnh.id}>
                        <CnhCard
                          cnh={cnh}
                          links={OFFICIAL_SERVICE_LINKS}
                          toast={toast}
                          onCopy={copyToClipboard}
                          onDelete={() => deleteItem(cnh.id, 'cnh')}
                          onEdit={() => {
                            setCnhModalInitial(cnh);
                            setCnhModalOpen(true);
                          }}
                          onTogglePin={() => togglePinCnh(cnh.id)}
                          onReorder={reorderCnhs}
                        />
                      </React.Fragment>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'calculator' && (
                <CalculatorFeatureContent 
                  onOpenModal={() => setCalculatorModalOpen(true)}
                  onOpenRecurso={() => setRecursoWizardOpen(true)}
                />
              )}

              {activeTab === 'laudo' && (
                <LaudoFeatureContent 
                  onOpenLaudo={() => setLaudoVeicularOpen(true)}
                />
              )}

              {activeTab === 'cdt-sne' && (
                <CDTSNEFeatureContent 
                  onOpenHub={() => setCdtSneHubOpen(true)}
                />
              )}

              {activeTab === 'inmetro' && (
                <InmetroFeatureContent 
                  onOpenConsulta={() => setInmetroConsultaOpen(true)}
                />
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-ink/8 bg-surface/95 backdrop-blur-lg shadow-[0_-8px_30px_-8px_rgba(15,23,42,0.08)] pb-[env(safe-area-inset-bottom,0)]"
        aria-label="Navegação principal"
      >
        <div className="grid grid-cols-5 gap-1 px-2 pt-2 max-w-2xl mx-auto">
          {TABS.map((tab) => (
            <React.Fragment key={tab.id}>
              <MobileTabButton
                active={activeTab === tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMoreMenuOpen(false);
                }}
                icon={tab.icon}
                label={tab.shortLabel}
              />
            </React.Fragment>
          ))}
          {/* Botão Mais */}
          <button
            type="button"
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            className={`flex flex-col items-center gap-1 py-2 px-2 rounded-xl text-[11px] font-semibold transition-colors min-h-[3.25rem] justify-center ${
              TABS_MAIS.some(tab => tab.id === activeTab)
                ? 'text-brand-emphasis'
                : 'text-muted hover:text-ink'
            }`}
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-colors ${
                TABS_MAIS.some(tab => tab.id === activeTab)
                  ? 'bg-brand-soft text-brand-emphasis shadow-inner'
                  : 'bg-canvas text-subtle'
              }`}
            >
              <MoreHorizontal size={20} strokeWidth={2} aria-hidden className="shrink-0" />
            </span>
            Mais
          </button>
        </div>
        <p className="text-center text-[10px] text-muted/90 py-1.5 tracking-wide leading-tight">
          By RonalDigital
        </p>

        {/* Menu Mais */}
        <AnimatePresence>
          {moreMenuOpen && (
            <>
              {/* Overlay para fechar o menu ao clicar fora */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMoreMenuOpen(false)}
                className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0))] top-0 z-40"
              />
              
              {/* Menu */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed left-4 right-4 bottom-[calc(5rem+env(safe-area-inset-bottom,0))] z-50 bg-surface border border-ink/8 rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="p-2">
                  {TABS_MAIS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMoreMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                        activeTab === tab.id
                          ? 'bg-brand-soft text-brand-emphasis'
                          : 'text-ink hover:bg-canvas'
                      }`}
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        activeTab === tab.id ? 'bg-brand text-white' : 'bg-canvas text-subtle'
                      }`}>
                        <tab.icon size={20} strokeWidth={2} aria-hidden />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-sm">{tab.label}</p>
                        <p className="text-xs text-muted">{tab.shortLabel}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 8 }}
            role="status"
            aria-live="polite"
            className="fixed left-1/2 z-[60] -translate-x-1/2 flex items-center gap-3 rounded-full border border-white/10 bg-ink px-5 py-3 text-white shadow-2xl shadow-ink/40 pointer-events-none md:max-w-none max-w-[min(90vw,20rem)] bottom-[calc(var(--app-mobile-nav-spacer)+0.75rem)] md:bottom-8"
          >
            <CheckCircle2 size={18} className="text-brand-soft shrink-0" aria-hidden />
            <span className="font-medium text-sm truncate">{notice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <ExtrasModal
        open={extrasOpen}
        onClose={() => setExtrasOpen(false)}
        vehicles={vehicles}
        cnhs={cnhs}
        toast={toast}
        onImport={(v, c) => {
          setVehicles(v.map((x, i) => migrateVehicle(x, i)));
          setCnhs(c.map((x, i) => migrateCnh(x, i)));
        }}
      />

      <VehicleFormModal
        open={vehicleModalOpen}
        initial={vehicleModalInitial}
        onClose={() => setVehicleModalOpen(false)}
        onSave={(v) => {
          setVehicles((prev) => {
            if (vehicleModalInitial) {
              return prev.map((x) => (x.id === v.id ? v : x));
            }
            return [...prev, { ...v, sortOrder: nextSortOrder(prev) }];
          });
          toast(vehicleModalInitial ? 'Veículo atualizado.' : 'Veículo cadastrado.');
        }}
      />

      <CnhFormModal
        open={cnhModalOpen}
        initial={cnhModalInitial}
        onClose={() => setCnhModalOpen(false)}
        onSave={(c) => {
          setCnhs((prev) => {
            if (cnhModalInitial) {
              return prev.map((x) => (x.id === c.id ? c : x));
            }
            return [...prev, { ...c, sortOrder: nextSortOrder(prev) }];
          });
          toast(cnhModalInitial ? 'CNH atualizada.' : 'CNH cadastrada.');
        }}
      />

      <CalculatorModal
        open={calculatorModalOpen}
        onClose={() => setCalculatorModalOpen(false)}
        onGenerateRecurso={(multa) => {
          setCalculatorModalOpen(false);
          setRecursoWizardOpen(true);
        }}
      />

      <RecursoWizard
        open={recursoWizardOpen}
        onClose={() => setRecursoWizardOpen(false)}
      />

      <LaudoVeicular
        open={laudoVeicularOpen}
        onClose={() => setLaudoVeicularOpen(false)}
      />

      <CDTSNEHub
        open={cdtSneHubOpen}
        onClose={() => setCdtSneHubOpen(false)}
      />

      <InmetroConsulta
        open={inmetroConsultaOpen}
        onClose={() => setInmetroConsultaOpen(false)}
      />
    </div>
  );
}

function AppBrand({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-emphasis text-white shadow-md shadow-brand/25">
          <Car size={20} strokeWidth={2} aria-hidden />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            Consulta Car
          </p>
          <p className="text-base font-bold text-ink leading-tight">Meus Veículos</p>
        </div>
      </div>
    </div>
  );
}

function SidebarNavItem({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors duration-200 ${
        active
          ? 'bg-brand text-white shadow-md shadow-brand/25 active:bg-brand-emphasis active:text-white'
          : 'text-muted hover:bg-canvas hover:text-ink active:bg-canvas active:text-ink'
      }`}
    >
      <span className={active ? 'text-white [&_svg]:text-white' : 'text-subtle [&_svg]:text-subtle'}>{icon}</span>
      <span className={active ? 'text-white' : undefined}>{label}</span>
    </button>
  );
}

function MobileTabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex flex-col items-center gap-1 py-2 px-2 rounded-xl text-[11px] font-semibold transition-colors min-h-[3.25rem] justify-center ${
        active
          ? 'text-brand-emphasis active:text-brand-emphasis'
          : 'text-muted hover:text-ink active:text-ink active:bg-transparent'
      }`}
    >
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-colors ${
          active
            ? 'bg-brand-soft text-brand-emphasis shadow-inner active:bg-brand-soft active:text-brand-emphasis [&_svg]:text-brand-emphasis'
            : 'bg-canvas text-subtle active:bg-canvas active:text-muted [&_svg]:text-subtle'
        }`}
      >
        <Icon size={20} strokeWidth={active ? 2.25 : 2} aria-hidden className="shrink-0" />
      </span>
      {label}
    </button>
  );
}

function ReminderChip({
  vehicle,
  toast,
}: {
  vehicle: Vehicle;
  toast: (msg: string) => void;
}) {
  const due = vehicle.reminderDue;
  if (!due) return null;
  const label = vehicle.reminderLabel?.trim() || 'Lembrete';
  const d = new Date(due + 'T12:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000);
  let tone =
    'bg-canvas text-muted border-ink/10 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-600';
  let text = `${label}: ${d.toLocaleDateString('pt-BR')}`;
  if (diff < 0) {
    tone = 'bg-danger-soft text-danger border-danger/20 dark:bg-red-950/40 dark:text-red-200 dark:border-red-900/50';
    text = `${label}: atrasado ${Math.abs(diff)}d`;
  } else if (diff <= 45) {
    tone =
      'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/50 dark:text-amber-100 dark:border-amber-800';
    text = `${label}: em ${diff} dia${diff === 1 ? '' : 's'}`;
  }

  const icsBody = buildVehicleReminderIcs(vehicle);
  const gCal = googleCalendarTemplateUrl(vehicle);
  const safePlate = vehicle.plate.replace(/\s/g, '');

  const saveIcs = () => {
    if (!icsBody) return;
    downloadIcsFile(icsBody, `consulta-car-${safePlate}-${due}.ics`);
    toast('Arquivo .ics baixado — importe no calendário ou no Google Agenda.');
  };

  return (
    <div className="mt-3 space-y-2">
      <div className={`rounded-xl border px-3 py-2 text-xs font-semibold ${tone}`}>{text}</div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={saveIcs}
          className="inline-flex items-center gap-1.5 rounded-lg border border-ink/10 bg-canvas px-2.5 py-1.5 text-[11px] font-semibold text-ink hover:border-brand/35 hover:bg-brand-soft/50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-brand-soft/20"
        >
          <FileDown size={14} aria-hidden />
          Calendário (.ics)
        </button>
        {gCal ? (
          <a
            href={gCal}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-ink/10 bg-canvas px-2.5 py-1.5 text-[11px] font-semibold text-ink hover:border-brand/35 hover:bg-brand-soft/50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-brand-soft/20"
          >
            <CalendarPlus size={14} aria-hidden />
            Google Agenda
          </a>
        ) : null}
      </div>
    </div>
  );
}

function VehicleCard({
  vehicle,
  links,
  toast,
  onCopy,
  onDelete,
  onEdit,
  onTogglePin,
  onReorder,
}: {
  vehicle: Vehicle;
  links: ServiceLinks;
  toast: (msg: string) => void;
  onCopy: (v: string, l: string) => void;
  onDelete: () => void;
  onEdit: () => void;
  onTogglePin: () => void;
  onReorder: (fromId: string, toId: string) => void;
}) {
  const plateDisp = formatPlateDisplay(vehicle.plate);

  const openVehiclePortal = async (url: string, clipboardValue: string, okMsg: string) => {
    const ok = await copyTextThenOpenUrl(url, clipboardValue);
    toast(
      ok
        ? okMsg
        : 'Portal aberto. Copie placa, RENAVAM ou outros dados tocando nos campos acima.',
    );
  };

  return (
    <article
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/x-cc-vehicle', vehicle.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }}
      onDrop={(e) => {
        e.preventDefault();
        const from = e.dataTransfer.getData('application/x-cc-vehicle');
        if (from && from !== vehicle.id) onReorder(from, vehicle.id);
      }}
      className="group flex flex-col h-full rounded-2xl border border-ink/8 bg-surface p-6 shadow-[0_4px_24px_-8px_rgba(15,23,42,0.1)] transition hover:border-brand/25 hover:shadow-[0_12px_32px_-12px_rgba(15,23,42,0.15)]"
    >
      <div className="flex justify-between items-start mb-4 gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-subtle cursor-grab active:cursor-grabbing touch-none p-1 -ml-1" title="Arrastar para ordenar">
            <GripVertical size={18} aria-hidden />
          </span>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-emphasis">
            <Car size={20} strokeWidth={2} aria-hidden />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-lg leading-tight text-ink truncate">{vehicle.nickname}</h4>
            <p className="text-muted font-mono text-xs uppercase tracking-wide">{plateDisp}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={onTogglePin}
            className={`rounded-lg p-2 transition hover:bg-canvas ${vehicle.pinned ? 'text-brand' : 'text-subtle'}`}
            title={vehicle.pinned ? 'Desafixar' : 'Fixar no topo'}
            aria-label={vehicle.pinned ? 'Desafixar' : 'Fixar no topo'}
          >
            <Pin size={18} strokeWidth={vehicle.pinned ? 2.5 : 2} className={vehicle.pinned ? 'text-brand' : ''} />
          </button>
          <button
            type="button"
            onClick={() =>
              void (async () => {
                const o = await shareVehicleSummary(vehicle, links);
                if (o === 'shared') toast('Resumo enviado ao app de compartilhamento.');
                else if (o === 'unsupported') toast('Compartilhar não disponível aqui.');
                else if (o === 'failed') toast('Não foi possível compartilhar.');
              })()
            }
            className="rounded-lg p-2 text-subtle hover:bg-canvas hover:text-ink"
            aria-label="Compartilhar resumo do veículo"
          >
            <Share2 size={18} />
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg p-2 text-subtle hover:bg-canvas hover:text-ink"
            aria-label="Editar veículo"
          >
            <Pencil size={18} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg p-2 text-subtle opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-danger-soft hover:text-danger"
            aria-label={`Remover ${vehicle.nickname}`}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <ReminderChip vehicle={vehicle} toast={toast} />

      {vehicle.notes?.trim() ? (
        <p className="mt-3 rounded-xl border border-ink/8 bg-canvas/50 px-3 py-2 text-xs text-muted leading-relaxed whitespace-pre-wrap dark:bg-slate-800/60 dark:border-slate-600">
          <span className="font-semibold text-ink dark:text-slate-100">Obs.: </span>
          {vehicle.notes.trim()}
        </p>
      ) : null}

      <div className="space-y-4 mb-6 flex-1 mt-4">
        <CopyField label="Marca / modelo" value={vehicle.brandModel} onCopy={() => onCopy(vehicle.brandModel, 'Modelo')} />
        <div className="grid grid-cols-2 gap-3">
          <CopyField label="Placa" value={plateDisp} onCopy={() => onCopy(vehicle.plate, 'Placa')} />
          <CopyField label="Ano" value={vehicle.year} onCopy={() => onCopy(vehicle.year, 'Ano')} isMono />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <CopyField label="RENAVAM" value={vehicle.renavam} onCopy={() => onCopy(vehicle.renavam, 'RENAVAM')} isMono />
          <CopyField label="Chassi" value={vehicle.chassis} onCopy={() => onCopy(vehicle.chassis, 'Chassi')} isMono />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-auto">
        <ServiceButton
          label="IPVA"
          icon={<Search size={14} />}
          onClick={() =>
            void openVehiclePortal(
              links.ipva,
              vehicle.plate,
              'Placa copiada — cole no IPVA quando o site pedir.',
            )
          }
        />
        <ServiceButton
          label="Licenc."
          icon={<Search size={14} />}
          onClick={() =>
            void openVehiclePortal(
              links.licenciamento,
              vehicle.renavam,
              'RENAVAM copiado — cole na Central do DETRAN (licenciamento).',
            )
          }
        />
        <ServiceButton
          label="Multas"
          icon={<Search size={14} />}
          onClick={() =>
            void openVehiclePortal(
              links.multas,
              vehicle.plate,
              'Placa copiada — cole na consulta de multas.',
            )
          }
        />
      </div>
    </article>
  );
}

function CnhCard({
  cnh,
  links,
  toast,
  onCopy,
  onDelete,
  onEdit,
  onTogglePin,
  onReorder,
}: {
  cnh: CNH;
  links: ServiceLinks;
  toast: (msg: string) => void;
  onCopy: (v: string, l: string) => void;
  onDelete: () => void;
  onEdit: () => void;
  onTogglePin: () => void;
  onReorder: (fromId: string, toId: string) => void;
}) {
  const cpfDisp = formatCpfDisplay(cnh.cpf);

  const openDetranService = async (url: string) => {
    const ok = await copyTextThenOpenUrl(url, cnh.cpf);
    toast(
      ok
        ? 'CPF copiado — cole no portal do DETRAN. Depois toque em "Nº registro" acima para copiar a CNH.'
        : 'Portal aberto. Copie CPF e número da CNH tocando nos campos acima.',
    );
  };

  return (
    <article
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/x-cc-cnh', cnh.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }}
      onDrop={(e) => {
        e.preventDefault();
        const from = e.dataTransfer.getData('application/x-cc-cnh');
        if (from && from !== cnh.id) onReorder(from, cnh.id);
      }}
      className="group rounded-2xl border border-ink/8 bg-surface p-6 shadow-[0_4px_24px_-8px_rgba(15,23,42,0.1)] transition hover:border-brand/25 hover:shadow-[0_12px_32px_-12px_rgba(15,23,42,0.15)]"
    >
      <div className="flex justify-between items-start mb-5 gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-subtle cursor-grab touch-none p-1 -ml-1">
            <GripVertical size={18} aria-hidden />
          </span>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-emphasis">
            <User size={20} strokeWidth={2} aria-hidden />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-lg leading-tight text-ink truncate">{cnh.name}</h4>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={onTogglePin}
            className={`rounded-lg p-2 transition hover:bg-canvas ${cnh.pinned ? 'text-brand' : 'text-subtle'}`}
            aria-label={cnh.pinned ? 'Desafixar' : 'Fixar no topo'}
          >
            <Pin size={18} strokeWidth={cnh.pinned ? 2.5 : 2} className={cnh.pinned ? 'text-brand' : ''} />
          </button>
          <button
            type="button"
            onClick={() =>
              void (async () => {
                const o = await shareCnhSummary(cnh, links);
                if (o === 'shared') toast('Resumo enviado ao app de compartilhamento.');
                else if (o === 'unsupported') toast('Compartilhar não disponível aqui.');
                else if (o === 'failed') toast('Não foi possível compartilhar.');
              })()
            }
            className="rounded-lg p-2 text-subtle hover:bg-canvas hover:text-ink"
            aria-label="Compartilhar resumo da CNH"
          >
            <Share2 size={18} />
          </button>
          <button type="button" onClick={onEdit} className="rounded-lg p-2 text-subtle hover:bg-canvas" aria-label="Editar CNH">
            <Pencil size={18} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg p-2 text-subtle opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-danger-soft hover:text-danger"
            aria-label={`Remover CNH de ${cnh.name}`}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {cnh.notes?.trim() ? (
        <p className="mb-4 rounded-xl border border-ink/8 bg-canvas/50 px-3 py-2 text-xs text-muted leading-relaxed whitespace-pre-wrap dark:bg-slate-800/60 dark:border-slate-600">
          <span className="font-semibold text-ink dark:text-slate-100">Obs.: </span>
          {cnh.notes.trim()}
        </p>
      ) : null}

      <div className="space-y-4 mb-6">
        <CopyField label="Nº registro" value={cnh.number} onCopy={() => onCopy(cnh.number, 'Registro')} isMono />
        <CopyField label="CPF" value={cpfDisp} onCopy={() => onCopy(cnh.cpf, 'CPF')} isMono />
      </div>

      <div className="grid grid-cols-1 gap-2">
        <ServiceButton
          label="Consultar pontos"
          icon={<Search size={14} />}
          onClick={() => void openDetranService(links.cnhPoints)}
          full
        />
        <div className="grid grid-cols-2 gap-2">
          <ServiceButton
            label="Nada consta"
            icon={<CheckCircle2 size={14} />}
            onClick={() => void openDetranService(links.cnhClearance)}
          />
          <ServiceButton
            label="Renovação"
            icon={<ExternalLink size={14} />}
            onClick={() => void openDetranService(links.cnhRenewal)}
          />
        </div>
      </div>
    </article>
  );
}

function CopyField({
  label,
  value,
  onCopy,
  isMono = false,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  isMono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase font-semibold text-muted tracking-wider">{label}</span>
      <button
        type="button"
        onClick={onCopy}
        className="group/field flex items-center justify-between gap-2 text-left bg-canvas/80 p-2.5 px-3 rounded-xl border border-transparent hover:border-brand/30 hover:bg-brand-soft/40 cursor-pointer transition active:scale-[0.99] active:bg-brand-soft/70 active:text-ink"
      >
        <span className={`text-sm ${isMono ? 'font-mono' : 'font-semibold'} text-ink truncate`}>{value}</span>
        <Copy size={14} className="text-subtle shrink-0 group-hover/field:text-brand" aria-hidden />
      </button>
    </div>
  );
}

function ServiceButton({
  label,
  icon,
  onClick,
  full = false,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  full?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${full ? 'w-full' : ''} inline-flex items-center justify-center gap-2 rounded-xl border border-ink/8 bg-canvas py-3 px-2 text-xs font-semibold text-ink transition hover:border-brand/35 hover:bg-brand-soft hover:text-brand-emphasis active:scale-[0.98] active:bg-brand-soft active:text-brand-emphasis active:border-brand/35`}
    >
      {icon}
      {label}
    </button>
  );
}

function EmptyState({ icon, message, hint }: { icon: React.ReactNode; message: string; hint: string }) {
  return (
    <div className="col-span-full">
      <div className="relative overflow-hidden rounded-3xl border border-dashed border-brand/25 bg-gradient-to-b from-brand-soft/50 to-surface px-6 py-16 md:py-20 text-center shadow-inner">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface shadow-md shadow-ink/5 ring-1 ring-brand/15">
          {icon}
        </div>
        <p className="text-base font-semibold text-ink">{message}</p>
        <p className="mt-2 max-w-md mx-auto text-sm text-muted leading-relaxed">{hint}</p>
      </div>
    </div>
  );
}

function CalculatorFeatureContent({ 
  onOpenModal, 
  onOpenRecurso 
}: { 
  onOpenModal: () => void;
  onOpenRecurso: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center py-8">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-soft text-brand-emphasis shadow-lg">
          <Calculator size={32} strokeWidth={2} />
        </div>
        <h3 className="text-2xl font-bold text-ink mb-3">Calculadora de Economia</h3>
        <p className="text-muted max-w-2xl mx-auto leading-relaxed">
          Simule custos, descontos SNE, probabilidade de recurso e tome a melhor decisão para suas multas.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard
          icon={<TrendingUp size={24} className="text-green-600" />}
          title="Desconto SNE"
          description="Calcule automaticamente o desconto de 40% do Sistema de Notificação Eletrônica"
          highlight="Economia instantânea"
        />
        
        <FeatureCard
          icon={<Gavel size={24} className="text-blue-600" />}
          title="Probabilidade de Recurso"
          description="Análise baseada em jurisprudência e fatores técnicos da sua multa"
          highlight="Decisão inteligente"
        />
        
        <FeatureCard
          icon={<FileText size={24} className="text-purple-600" />}
          title="Simulação Completa"
          description="Compare todas as opções: pagar, recorrer, SNE ou deixar vencer"
          highlight="Visão completa"
        />
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
        <button
          onClick={onOpenModal}
          className="inline-flex items-center gap-3 px-8 py-4 bg-brand text-white rounded-2xl font-semibold text-lg hover:bg-brand-emphasis transition shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/30"
        >
          <Calculator size={24} />
          Calcular Economia
        </button>
        
        <button
          onClick={onOpenRecurso}
          className="inline-flex items-center gap-3 px-8 py-4 border-2 border-brand text-brand rounded-2xl font-semibold text-lg hover:bg-brand-soft/30 transition"
        >
          <Gavel size={24} />
          Gerar Recurso com IA
        </button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <InfoCard
          title="Como Funciona"
          items={[
            'Insira os dados da sua multa',
            'Veja cálculos automáticos de economia',
            'Analise probabilidade de sucesso no recurso',
            'Tome a decisão mais econômica'
          ]}
        />
        
        <InfoCard
          title="Benefícios"
          items={[
            'Economia de até 40% com SNE',
            'Evite juros e multas adicionais',
            'Decisão baseada em dados reais',
            'Geração de recurso com IA (em breve)'
          ]}
        />
      </div>

      {/* Legal Disclaimer */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        <strong>Aviso Legal:</strong> Os cálculos são estimativos baseados em regras gerais do SNE e jurisprudência comum. 
        Sempre confirme informações nos portais oficiais dos órgãos de trânsito. Este app não substitui orientação jurídica profissional.
      </div>
    </div>
  );
}

function CDTSNEFeatureContent({ 
  onOpenHub 
}: { 
  onOpenHub: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center py-8">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-green-100 text-green-600 shadow-lg">
          <Smartphone size={32} strokeWidth={2} />
        </div>
        <h3 className="text-2xl font-bold text-ink mb-3">CDT + SNE Digital</h3>
        <p className="text-muted max-w-2xl mx-auto leading-relaxed">
          Ative a Carteira Digital de Trânsito e o Sistema de Notificação Eletrônica para economizar até 40% em multas e ter seus documentos sempre no celular.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard
          icon={<Smartphone size={24} className="text-blue-600" />}
          title="Carteira Digital (CDT)"
          description="CNH e CRLV válidos digitalmente, sempre no seu celular. App oficial do governo."
          highlight="Documentos digitais"
        />
        
        <FeatureCard
          icon={<Zap size={24} className="text-green-600" />}
          title="SNE - 40% Desconto"
          description="Sistema de Notificação Eletrônica com desconto automático no pagamento de multas"
          highlight="Economia garantida"
        />
        
        <FeatureCard
          icon={<Users size={24} className="text-purple-600" />}
          title="Indicar Real Infrator"
          description="Transfira a responsabilidade quando você não era o condutor do veículo"
          highlight="Processo simplificado"
        />
      </div>

      {/* CTA Button */}
      <div className="flex justify-center pt-6">
        <button
          onClick={onOpenHub}
          className="inline-flex items-center gap-3 px-8 py-4 bg-green-600 text-white rounded-2xl font-semibold text-lg hover:bg-green-700 transition shadow-lg shadow-green-600/25 hover:shadow-xl hover:shadow-green-600/30"
        >
          <Smartphone size={24} />
          Configurar CDT + SNE
        </button>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <BenefitsCard
          title="Vantagens da CDT"
          items={[
            'CNH e CRLV válidos digitalmente',
            'Acesso a serviços do DENATRAN',
            'Consulta de multas em tempo real',
            'Histórico completo do veículo',
            'Gratuito e oficial do governo',
            'Funciona offline após sincronização'
          ]}
          color="blue"
        />
        
        <BenefitsCard
          title="Benefícios do SNE"
          items={[
            '40% de desconto no pagamento',
            'Notificação por email instantânea',
            'Prazo maior para contestação',
            'Sem atraso nas notificações',
            'Histórico organizado de infrações',
            'Economia automática garantida'
          ]}
          color="green"
        />
      </div>

      {/* Process Steps */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
        <h4 className="text-xl font-bold text-green-800 mb-6 text-center">
          Como Funciona - Processo Guiado
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ProcessStep
            number="1"
            title="Ativar CDT"
            description="Baixe o app oficial e ative seus documentos digitais"
          />
          
          <ProcessStep
            number="2"
            title="Conectar gov.br"
            description="Faça login seguro com sua conta gov.br"
          />
          
          <ProcessStep
            number="3"
            title="Aderir ao SNE"
            description="Ative o desconto de 40% em multas"
          />
          
          <ProcessStep
            number="4"
            title="Importar Multas"
            description="Veja suas multas com desconto automático"
          />
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
        <strong>Informação Importante:</strong> O Consulta Car orienta você no processo de ativação, 
        mas o login e configuração são feitos diretamente nos portais oficiais do governo (.gov.br). 
        Não armazenamos suas credenciais. Todos os links direcionam para sites oficiais.
      </div>
    </div>
  );
}

function InmetroFeatureContent({ 
  onOpenConsulta 
}: { 
  onOpenConsulta: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center py-8">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-lg">
          <ShieldAlert size={32} strokeWidth={2} />
        </div>
        <h3 className="text-2xl font-bold text-ink mb-3">Consulta de Radares - INMETRO</h3>
        <p className="text-muted max-w-2xl mx-auto leading-relaxed">
          Verifique a situação de equipamentos de medição de velocidade. Se o radar estiver irregular, você tem fortes argumentos para contestar a multa.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard
          icon={<Search size={24} className="text-blue-600" />}
          title="Consulta Rápida"
          description="Busque por UF, município, tipo de equipamento ou número do INMETRO"
          highlight="Resultados em segundos"
        />
        
        <FeatureCard
          icon={<CheckCircle2 size={24} className="text-green-600" />}
          title="Status Visual"
          description="Veja claramente se o equipamento é válido, irregular, reprovado ou não encontrado"
          highlight="Fácil de entender"
        />
        
        <FeatureCard
          icon={<Gavel size={24} className="text-purple-600" />}
          title="Integração com Recursos"
          description="Use os resultados diretamente no Assistente de Recurso com IA"
          highlight="Argumentos fortes"
        />
      </div>

      {/* Benefits Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BenefitsCard
          title="Por que verificar?"
          items={[
            'Equipamentos irregularmente calibrados invalidam multas',
            'Certificação INMETRO é obrigatória por lei',
            'Histórico de verificações é público',
            'Dados oficiais para defesa prévia ou recurso'
          ]}
          color="blue"
        />
        
        <BenefitsCard
          title="Dicas importantes"
          items={[
            'Sempre verifique se há sinalização prévia',
            'Confira data de validade da certificação',
            'Tire fotos do equipamento e local',
            'Guarde todos os documentos'
          ]}
          color="green"
        />
      </div>

      {/* Process Steps */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-8">
        <h4 className="text-xl font-bold text-blue-800 mb-6 text-center">
          Como Funciona
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ProcessStep
            number="1"
            title="Preencher Dados"
            description="Informe UF, município e tipo de equipamento"
          />
          
          <ProcessStep
            number="2"
            title="Consultar INMETRO"
            description="Receba o status e o histórico do equipamento"
          />
          
          <ProcessStep
            number="3"
            title="Analisar Resultado"
            description="Veja se o equipamento está irregular ou válido"
          />
          
          <ProcessStep
            number="4"
            title="Contestar Multa"
            description="Use os dados no Assistente de Recurso com IA"
          />
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
        <strong>Informação Importante:</strong> Esta consulta é baseada em dados simulados para demonstração. 
        Para informações oficiais, sempre consulte diretamente o portal do INMETRO. Esta ferramenta não substitui orientação jurídica profissional.
      </div>
    </div>
  );
}

function BenefitsCard({ 
  title, 
  items, 
  color 
}: { 
  title: string; 
  items: string[]; 
  color: 'blue' | 'green'; 
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
  };

  return (
    <div className={`p-6 rounded-2xl border ${colorClasses[color]}`}>
      <h4 className="text-lg font-semibold text-ink mb-4">{title}</h4>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3 text-sm text-muted">
            <CheckCircle2 size={16} className={`mt-0.5 shrink-0 ${color === 'blue' ? 'text-blue-600' : 'text-green-600'}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProcessStep({ 
  number, 
  title, 
  description 
}: { 
  number: string; 
  title: string; 
  description: string; 
}) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-white font-bold text-lg">
        {number}
      </div>
      <h5 className="font-semibold text-green-800 mb-2">{title}</h5>
      <p className="text-sm text-green-600">{description}</p>
    </div>
  );
}

function LaudoFeatureContent({ 
  onOpenLaudo 
}: { 
  onOpenLaudo: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center py-8">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-soft text-brand-emphasis shadow-lg">
          <FileText size={32} strokeWidth={2} />
        </div>
        <h3 className="text-2xl font-bold text-ink mb-3">Laudo Veicular Profissional</h3>
        <p className="text-muted max-w-2xl mx-auto leading-relaxed">
          Consulta completa do veículo com análise de risco, multas, débitos, restrições e geração de laudo profissional para compra/venda.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard
          icon={<Search size={24} className="text-blue-600" />}
          title="Consulta Completa"
          description="Busca integrada em múltiplas bases: multas, débitos, restrições, recalls e histórico"
          highlight="Dados completos"
        />
        
        <FeatureCard
          icon={<Shield size={24} className="text-green-600" />}
          title="Análise de Risco"
          description="Score automático baseado em pendências, restrições e histórico do veículo"
          highlight="Decisão segura"
        />
        
        <FeatureCard
          icon={<FileText size={24} className="text-purple-600" />}
          title="Laudo Profissional"
          description="PDF completo com análise técnica, sugestão de preço e recomendações"
          highlight="Documento oficial"
        />
      </div>

      {/* CTA Button */}
      <div className="flex justify-center pt-6">
        <button
          onClick={onOpenLaudo}
          className="inline-flex items-center gap-3 px-8 py-4 bg-brand text-white rounded-2xl font-semibold text-lg hover:bg-brand-emphasis transition shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/30"
        >
          <Search size={24} />
          Consultar Veículo
        </button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <InfoCard
          title="O que Consultamos"
          items={[
            'Multas pendentes e valor total',
            'Débitos (IPVA, licenciamento, DPVAT)',
            'Restrições (roubo, alienação, judicial)',
            'Recalls em aberto por risco',
            'Histórico de proprietários',
            'Valor FIPE atualizado'
          ]}
        />
        
        <InfoCard
          title="Laudo Inclui"
          items={[
            'Análise de risco com score',
            'Sugestão de preço ajustada',
            'Relatório completo de pendências',
            'Recomendação final de compra/venda',
            'Documento profissional em PDF',
            'Dados para negociação segura'
          ]}
        />
      </div>

      {/* Legal Disclaimer */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        <strong>Aviso Legal:</strong> Este laudo é informativo e baseado em consultas a bases públicas. 
        NÃO substitui vistoria presencial por profissional qualificado. Sempre confirme informações nos portais oficiais 
        e faça inspeção técnica antes de finalizar negócios.
      </div>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  highlight 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  highlight: string;
}) {
  return (
    <div className="p-6 bg-surface border border-ink/8 rounded-2xl hover:border-brand/25 hover:shadow-lg transition">
      <div className="mb-4">{icon}</div>
      <h4 className="text-lg font-semibold text-ink mb-2">{title}</h4>
      <p className="text-muted text-sm leading-relaxed mb-3">{description}</p>
      <span className="inline-block px-3 py-1 bg-brand-soft text-brand-emphasis text-xs font-semibold rounded-full">
        {highlight}
      </span>
    </div>
  );
}

function InfoCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="p-6 bg-canvas/50 border border-ink/8 rounded-2xl">
      <h4 className="text-lg font-semibold text-ink mb-4">{title}</h4>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3 text-sm text-muted">
            <CheckCircle2 size={16} className="text-brand mt-0.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
