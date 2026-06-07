import { useNavigate, useLocation } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import type { Phase } from '@/types';
import {
  ShoppingCart, ClipboardCheck, Warehouse, UtensilsCrossed,
  Truck, AlertTriangle, BarChart3, Home
} from 'lucide-react';

const PHASE_CONFIG: { phase: Phase; label: string; icon: React.ReactNode; path: string }[] = [
  { phase: 'procurement', label: '采购谈判', icon: <ShoppingCart size={18} />, path: '/procurement' },
  { phase: 'inspection', label: '原料验收', icon: <ClipboardCheck size={18} />, path: '/inspection' },
  { phase: 'warehouse', label: '仓库存放', icon: <Warehouse size={18} />, path: '/warehouse' },
  { phase: 'menu', label: '菜单排产', icon: <UtensilsCrossed size={18} />, path: '/menu' },
  { phase: 'loading', label: '车辆装载', icon: <Truck size={18} />, path: '/loading' },
  { phase: 'emergency', label: '突发事件', icon: <AlertTriangle size={18} />, path: '/emergency' },
  { phase: 'settlement', label: '经营结算', icon: <BarChart3 size={18} />, path: '/settlement' },
];

export default function GameLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentDay, totalDays, funds, satisfaction, currentPhase, completedPhases, started, activeEvents } = useGameStore();

  if (!started) return <>{children}</>;

  const phaseOrder = PHASE_CONFIG.map(p => p.phase);
  const currentIdx = phaseOrder.indexOf(currentPhase);

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 bg-[#14142a] border-r border-[#2a2a45] flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-[#2a2a45]">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors text-sm">
            <Home size={16} />
            返回总览
          </button>
        </div>

        <div className="p-4 border-b border-[#2a2a45]">
          <div className="text-xs text-slate-500 mb-1">当前进度</div>
          <div className="font-mono-data text-amber-400 text-lg font-bold">
            第 {currentDay} / {totalDays} 天
          </div>
          <div className="mt-2 w-full bg-[#2a2a45] rounded-full h-1.5">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${(currentDay / totalDays) * 100}%` }}
            />
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {PHASE_CONFIG.map((config, idx) => {
            const isCompleted = completedPhases.includes(config.phase);
            const isCurrent = currentPhase === config.phase;
            const isAccessible = idx <= currentIdx || isCompleted;
            const isOnPage = location.pathname === config.path;

            let nodeClass = 'phase-node';
            if (isCurrent) nodeClass += ' active';
            else if (isCompleted) nodeClass += ' completed';
            else if (!isAccessible) nodeClass += ' locked';

            return (
              <button
                key={config.phase}
                onClick={() => isAccessible && navigate(config.path)}
                disabled={!isAccessible}
                className={`${nodeClass} w-full text-left ${isOnPage ? 'bg-amber-500/10 border border-amber-500/30' : 'border border-transparent'}`}
              >
                <span className={`flex-shrink-0 ${isCurrent ? 'text-amber-400' : isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {config.icon}
                </span>
                <span className={`text-sm ${isCurrent ? 'text-amber-300 font-medium' : isCompleted ? 'text-slate-300' : 'text-slate-500'}`}>
                  {config.label}
                </span>
                {isCompleted && <span className="ml-auto text-emerald-400 text-xs">✓</span>}
                {isCurrent && !isCompleted && (
                  <span className="ml-auto w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {activeEvents.length > 0 && (
          <div className="p-3 border-t border-red-500/30 bg-red-500/5">
            <button
              onClick={() => navigate('/emergency')}
              className="w-full flex items-center gap-2 text-red-400 text-sm font-medium animate-pulse"
            >
              <AlertTriangle size={16} />
              {activeEvents.length} 个紧急事件待处理
            </button>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-[#14142a] border-b border-[#2a2a45] flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">资金</span>
              <span className={`font-mono-data font-bold ${funds > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                ¥{funds.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">满意度</span>
              <span className={`font-mono-data font-bold ${satisfaction >= 70 ? 'text-emerald-400' : satisfaction >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                {satisfaction}%
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-slate-500">
              {PHASE_CONFIG.find(p => p.phase === currentPhase)?.label || '总览'}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
