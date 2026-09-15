import React from 'react';
import { LayoutDashboard, ClipboardList, DollarSign, Calendar, Menu } from 'lucide-react';
import { ActiveTab } from '../types';
import { useTheme } from '../context/ThemeContext';

interface BottomNavProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenNewBudget: () => void;
  onOpenDrawer: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenDrawer,
}) => {
  const { isDark } = useTheme();

  const items: { tab: ActiveTab | 'menu'; label: string; icon: React.ElementType }[] = [
    { tab: 'resumo', label: 'Cockpit', icon: LayoutDashboard },
    { tab: 'operacao', label: 'Ordens', icon: ClipboardList },
    { tab: 'financeiro', label: 'Finanças', icon: DollarSign },
    { tab: 'agenda', label: 'Agenda', icon: Calendar },
    { tab: 'menu', label: 'Mais', icon: Menu },
  ];

  return (
    <div className="fixed inset-x-0 bottom-3 z-40 flex justify-center px-4 pointer-events-none">
      <nav
        className={`w-full max-w-[380px] rounded-2xl border p-1.5 pointer-events-auto backdrop-blur-2xl transition-all duration-200 ${
          isDark
            ? 'bg-[#18181C]/90 border-white/[0.1] text-zinc-300 shadow-[0_16px_36px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.08)]'
            : 'bg-white/95 border-slate-200/90 text-slate-700 shadow-[0_12px_32px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]'
        }`}
      >
        <div className="flex items-center justify-around">
          {items.map(({ tab, label, icon: Icon }) => {
            const isMenu = tab === 'menu';
            const isActive = !isMenu && currentTab === tab;

            return (
              <button
                key={tab}
                id={`nav-bottom-${tab}`}
                type="button"
                onClick={() => {
                  if (isMenu) {
                    onOpenDrawer();
                  } else {
                    onSelectTab(tab as ActiveTab);
                  }
                }}
                className={`min-h-[44px] flex flex-1 flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl transition-all duration-150 active:scale-95 select-none relative ${
                  isActive
                    ? isDark
                      ? 'text-cyan-300 font-semibold bg-cyan-500/15 border border-cyan-500/30 shadow-xs'
                      : 'text-sky-700 font-semibold bg-sky-50 border border-sky-200/80 shadow-xs'
                    : isDark
                    ? 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                    : 'text-slate-500 hover:text-slate-900 border border-transparent'
                }`}
              >
                <Icon className="h-4.5 w-4.5 stroke-[1.8]" />
                <span className="text-[10px] tracking-tight">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
