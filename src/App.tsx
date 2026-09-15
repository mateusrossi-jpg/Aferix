import React, { useState, useMemo, lazy, Suspense } from 'react';
import { ActiveTab, Budget, JobStatus, STATUS_CONFIG } from './types';
import { useAferixData, aferixStore } from './storage/store';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Header } from './components/Header';
import { OfflineSyncBanner } from './components/OfflineSyncBanner';
import { Sidebar } from './components/Sidebar';
import { NavigationDrawer } from './components/NavigationDrawer';
import { BottomNav } from './components/BottomNav';
import { NotificationsModal } from './components/NotificationsModal';
import { NewBudgetModal } from './components/NewBudgetModal';
import { QuickEntryModal } from './components/QuickEntryModal';
import { BudgetDetailModal } from './components/BudgetDetailModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { MarginSimulatorModal } from './components/MarginSimulatorModal';
import { PmocChecklistModal } from './components/PmocChecklistModal';
import { EquipmentModal } from './components/EquipmentModal';

// Lazy-loaded Views
const ResumoView = lazy(() => import('./views/ResumoView').then(m => ({ default: m.ResumoView })));
const OperacaoView = lazy(() => import('./views/OperacaoView').then(m => ({ default: m.OperacaoView })));
const FinanceiroView = lazy(() => import('./views/FinanceiroView').then(m => ({ default: m.FinanceiroView })));
const AgendaView = lazy(() => import('./views/AgendaView').then(m => ({ default: m.AgendaView })));
const ClientesView = lazy(() => import('./views/ClientesView').then(m => ({ default: m.ClientesView })));
const CatalogoView = lazy(() => import('./views/CatalogoView').then(m => ({ default: m.CatalogoView })));
const RelatoriosView = lazy(() => import('./views/RelatoriosView').then(m => ({ default: m.RelatoriosView })));
const ConfiguracoesView = lazy(() => import('./views/ConfiguracoesView').then(m => ({ default: m.ConfiguracoesView })));
const ClpFacilView = lazy(() => import('./views/ClpFacilView').then(m => ({ default: m.ClpFacilView })));

function AppContent() {
  const {
    budgets,
    clients,
    catalog,
    receivables,
    transactions,
    appointments,
    notifications,
    profile,
    equipments,
    pmocReports,
    stats,
  } = useAferixData();

  const { isDark } = useTheme();

  const [currentTab, setCurrentTab] = useState<ActiveTab>('resumo');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMarginSimulatorOpen, setIsMarginSimulatorOpen] = useState(false);
  const [isPmocChecklistOpen, setIsPmocChecklistOpen] = useState(false);
  const [isEquipmentsOpen, setIsEquipmentsOpen] = useState(false);
  const [isNewBudgetOpen, setIsNewBudgetOpen] = useState(false);
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  const handleStatusChange = (id: string, newStatus: JobStatus) => {
    aferixStore.updateBudgetStatus(id, newStatus);
    const updated = aferixStore.getBudgetById(id);
    if (updated) {
      setSelectedBudget(updated);
    }
  };

  const handleApplyMarginSimulation = (data: {
    title: string;
    cost: number;
    price: number;
    margin: number;
  }) => {
    setIsNewBudgetOpen(true);
  };

  const activeSubContext = useMemo(() => {
    if (selectedBudget) {
      return {
        title: `OS ${selectedBudget.code}`,
        subtitle: selectedBudget.title,
        onBack: () => setSelectedBudget(null),
        statusConfig: STATUS_CONFIG[selectedBudget.status],
      };
    }
    if (isNewBudgetOpen) {
      return {
        title: 'Novo Orçamento',
        onBack: () => setIsNewBudgetOpen(false),
      };
    }
    if (isMarginSimulatorOpen) {
      return {
        title: 'Simulador de Margem',
        onBack: () => setIsMarginSimulatorOpen(false),
      };
    }
    if (isPmocChecklistOpen) {
      return {
        title: 'Plano de Manutenção (PMP / PMOC)',
        onBack: () => setIsPmocChecklistOpen(false),
      };
    }
    if (isEquipmentsOpen) {
      return {
        title: 'Equipamentos',
        onBack: () => setIsEquipmentsOpen(false),
      };
    }
    if (isQuickEntryOpen) {
      return {
        title: 'Lançamento Rápido',
        onBack: () => setIsQuickEntryOpen(false),
      };
    }
    return null;
  }, [
    selectedBudget,
    isNewBudgetOpen,
    isMarginSimulatorOpen,
    isPmocChecklistOpen,
    isEquipmentsOpen,
    isQuickEntryOpen,
  ]);

  return (
    <div
      className={`min-h-screen flex flex-row transition-colors duration-250 relative ${
        isDark
          ? 'bg-[#141416] text-zinc-100 bg-ambient-dark selection:bg-cyan-500 selection:text-black'
          : 'bg-[#F8FAFC] text-[#0F172A] bg-ambient-light selection:bg-sky-500 selection:text-white'
      }`}
    >
      {/* Clean Desktop Sidebar (Linear + Stripe Style) */}
      <Sidebar
        currentTab={currentTab}
        onNavigate={(tab) => setCurrentTab(tab)}
        onOpenQuickEntry={() => setIsQuickEntryOpen(true)}
        onOpenNewBudget={() => setIsNewBudgetOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        unreadCount={stats.unreadNotificationsCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Constitution with Dynamic Breadcrumbs */}
        <Header
          currentTab={currentTab}
          onNavigate={(tab) => setCurrentTab(tab)}
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          unreadCount={stats.unreadNotificationsCount}
          activeSubContext={activeSubContext}
        />

        {/* Offline & Sync Status Banner */}
        <OfflineSyncBanner />

        {/* Main Viewport */}
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            }
          >
            {currentTab === 'resumo' && (
              <ResumoView
                budgets={budgets}
                appointments={appointments}
                stats={stats}
                onNavigate={(tab) => setCurrentTab(tab)}
                onOpenNewBudget={() => setIsNewBudgetOpen(true)}
                onOpenQuickEntry={() => setIsQuickEntryOpen(true)}
                onSelectBudget={(b) => setSelectedBudget(b)}
                onOpenSearch={() => setIsSearchOpen(true)}
                onOpenMarginSimulator={() => setIsMarginSimulatorOpen(true)}
                onOpenPmocChecklist={() => setIsPmocChecklistOpen(true)}
                onOpenEquipments={() => setIsEquipmentsOpen(true)}
              />
            )}

            {currentTab === 'operacao' && (
              <OperacaoView
                budgets={budgets}
                onOpenNewBudget={() => setIsNewBudgetOpen(true)}
                onSelectBudget={(b) => setSelectedBudget(b)}
                onOpenMarginSimulator={() => setIsMarginSimulatorOpen(true)}
                onOpenPmocChecklist={() => setIsPmocChecklistOpen(true)}
                onOpenEquipments={() => setIsEquipmentsOpen(true)}
              />
            )}

            {currentTab === 'financeiro' && (
              <FinanceiroView
                budgets={budgets}
                receivables={receivables}
                transactions={transactions}
                stats={stats}
              />
            )}

            {currentTab === 'agenda' && (
              <AgendaView appointments={appointments} clients={clients} />
            )}

            {currentTab === 'clientes' && <ClientesView clients={clients} />}

            {currentTab === 'catalogo' && <CatalogoView catalog={catalog} />}

            {currentTab === 'relatorios' && (
              <RelatoriosView
                budgets={budgets}
                clients={clients}
                transactions={transactions}
                stats={stats}
              />
            )}

            {currentTab === 'configuracoes' && <ConfiguracoesView profile={profile} />}

            {currentTab === 'clp_facil' && <ClpFacilView />}
          </Suspense>
        </main>
      </div>

      {/* Bottom Navigation Dock for Mobile Devices */}
      <div className="lg:hidden">
        <BottomNav
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          onOpenNewBudget={() => setIsNewBudgetOpen(true)}
          onOpenDrawer={() => setIsDrawerOpen(true)}
        />
      </div>

      {/* Drawers & Modals */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        profile={profile}
        onOpenNewBudget={() => setIsNewBudgetOpen(true)}
        onOpenMarginSimulator={() => setIsMarginSimulatorOpen(true)}
        onOpenPmocChecklist={() => setIsPmocChecklistOpen(true)}
        onOpenEquipments={() => setIsEquipmentsOpen(true)}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        budgets={budgets}
        clients={clients}
        catalog={catalog}
        appointments={appointments}
        onSelectBudget={(b) => {
          setSelectedBudget(b);
          setCurrentTab('operacao');
        }}
        onNavigateTab={(tab) => setCurrentTab(tab)}
      />

      <QuickEntryModal
        isOpen={isQuickEntryOpen}
        onClose={() => setIsQuickEntryOpen(false)}
        clients={clients}
      />

      <MarginSimulatorModal
        isOpen={isMarginSimulatorOpen}
        onClose={() => setIsMarginSimulatorOpen(false)}
        onApplyToNewBudget={handleApplyMarginSimulation}
      />

      <PmocChecklistModal
        isOpen={isPmocChecklistOpen}
        onClose={() => setIsPmocChecklistOpen(false)}
        clients={clients}
        existingReports={pmocReports}
      />

      <EquipmentModal
        isOpen={isEquipmentsOpen}
        onClose={() => setIsEquipmentsOpen(false)}
        equipments={equipments}
        clients={clients}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
      />

      <NewBudgetModal
        isOpen={isNewBudgetOpen}
        onClose={() => setIsNewBudgetOpen(false)}
        clients={clients}
        catalog={catalog}
        onCreated={(b) => {
          setSelectedBudget(b);
          setCurrentTab('operacao');
        }}
      />

      <BudgetDetailModal
        budget={selectedBudget}
        profile={profile}
        onClose={() => setSelectedBudget(null)}
        onStatusChange={handleStatusChange}
        onUpdateBudget={(id, updates) => {
          aferixStore.updateBudget(id, updates);
          if (selectedBudget && selectedBudget.id === id) {
            setSelectedBudget({ ...selectedBudget, ...updates });
          }
        }}
      />
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
