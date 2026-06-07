import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import type { EventType } from '@/types';
import {
  AlertTriangle, ShieldAlert, Wrench, Zap, Package, Truck,
  Clock, Users, DollarSign, CheckCircle, ChevronDown, ChevronUp,
  ArrowRight,
} from 'lucide-react';

const EVENT_META: Record<EventType, { icon: typeof Truck; label: string; color: string; bg: string; border: string }> = {
  supplier_late: { icon: Truck, label: '供应商延误', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  ingredient_shortage: { icon: Package, label: '原料短缺', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  vehicle_breakdown: { icon: Wrench, label: '车辆故障', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  rush_order: { icon: Zap, label: '紧急订单', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  food_recall: { icon: ShieldAlert, label: '食品召回', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

function PenaltyBadge({ icon: Icon, value, label, color }: { icon: typeof DollarSign; value: number; label: string; color: string }) {
  if (value === 0) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-mono-data ${color}`}>
      <Icon size={12} />
      {label}{value > 0 ? ` -${value}` : ` +${Math.abs(value)}`}
    </span>
  );
}

export default function Emergency() {
  const { activeEvents, completedEvents, currentDay, resolveEvent, nextPhase } = useGameStore();
  const [selectedOption, setSelectedOption] = useState<Record<string, number>>({});
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const currentEvent = activeEvents.length > 0 ? activeEvents[0] : null;

  function handleConfirm(eventId: string) {
    const optIdx = selectedOption[eventId];
    if (optIdx === undefined) return;
    setResolvingId(eventId);
    setTimeout(() => {
      resolveEvent(eventId, optIdx);
      setResolvingId(null);
      setSelectedOption(prev => {
        const next = { ...prev };
        delete next[eventId];
        return next;
      });
    }, 600);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center animate-glow-pulse">
            <AlertTriangle size={22} className="text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-red-400">突发事件处理</h1>
          <span className="font-mono-data text-sm text-slate-400 bg-[#1e1e32] px-3 py-1 rounded-lg border border-[#2a2a45]">
            第 {currentDay} 天
          </span>
        </div>
        {activeEvents.length > 0 && (
          <span className="font-mono-data text-sm text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/30 animate-flash-border">
            剩余 {activeEvents.length} 个事件
          </span>
        )}
      </div>

      {!currentEvent && (
        <div className="card text-center py-16 animate-slide-in">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-emerald-400 mb-2">当前无紧急事件</h2>
          <p className="text-slate-500 text-sm">一切正常运转，请继续调度</p>
        </div>
      )}

      {currentEvent && (() => {
        const meta = EVENT_META[currentEvent.type];
        const Icon = meta.icon;
        const selected = selectedOption[currentEvent.id];
        const isResolving = resolvingId === currentEvent.id;

        return (
          <div
            key={currentEvent.id}
            className={`card animate-slide-in border-2 animate-flash-border ${isResolving ? 'opacity-60 scale-[0.98] transition-all duration-500' : ''}`}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className={`w-14 h-14 rounded-xl ${meta.bg} border ${meta.border} flex items-center justify-center flex-shrink-0`}>
                <Icon size={28} className={meta.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className={`text-xs px-2.5 py-1 rounded font-bold ${meta.bg} ${meta.color} ${meta.border} border`}>
                    {meta.label}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-100 mb-2">{currentEvent.title}</h2>
                <p className="text-slate-400 text-sm leading-relaxed">{currentEvent.description}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-400" />
                选择应对方案
              </h3>
              {currentEvent.options.map((opt, idx) => {
                const isSelected = selected === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => !isResolving && setSelectedOption(prev => ({ ...prev, [currentEvent.id]: idx }))}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/5 shadow-lg shadow-amber-500/10'
                        : 'border-[#2a2a45] bg-[#1a1a2e] hover:border-[#3a3a5a]'
                    } ${isResolving ? 'pointer-events-none' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isSelected ? 'border-amber-500 bg-amber-500' : 'border-[#3a3a5a]'
                      }`}>
                        {isSelected && <CheckCircle size={14} className="text-[#0f0f1a]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-100 mb-1">{opt.label}</div>
                        <div className="text-sm text-slate-400 mb-3">{opt.description}</div>
                        <div className="flex flex-wrap gap-3">
                          <PenaltyBadge icon={DollarSign} value={opt.costPenalty} label="💰" color="text-amber-400" />
                          <PenaltyBadge icon={Users} value={opt.satisfactionPenalty} label="👥" color="text-blue-400" />
                          <PenaltyBadge icon={Clock} value={opt.timePenalty} label="⏱" color="text-purple-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end border-t border-[#2a2a45] pt-4">
              <button
                onClick={() => handleConfirm(currentEvent.id)}
                disabled={selected === undefined || isResolving}
                className={`flex items-center gap-2 text-sm ${
                  selected !== undefined && !isResolving
                    ? 'btn-danger'
                    : 'bg-[#2a2a45] text-slate-500 cursor-not-allowed px-5 py-2.5 rounded-lg font-bold'
                }`}
              >
                <AlertTriangle size={16} />
                {isResolving ? '执行中...' : '执行此方案'}
              </button>
            </div>
          </div>
        );
      })()}

      {completedEvents.length > 0 && (
        <div className="card">
          <button
            onClick={() => setHistoryOpen(prev => !prev)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-400" />
              <span className="text-sm font-medium text-slate-400">
                已处理事件 ({completedEvents.length})
              </span>
            </div>
            {historyOpen ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
          </button>

          {historyOpen && (
            <div className="mt-3 space-y-2 animate-slide-in">
              {completedEvents.map(evt => {
                const meta = EVENT_META[evt.type];
                const opt = evt.selectedOption !== undefined ? evt.options[evt.selectedOption] : null;
                return (
                  <div key={evt.id} className="p-3 rounded-lg bg-[#0f0f1a] border border-[#2a2a45]">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <meta.icon size={14} className={meta.color} />
                        <span className="text-sm font-medium text-slate-200">{evt.title}</span>
                      </div>
                      <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">已处理</span>
                    </div>
                    {opt && (
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-500">方案：{opt.label}</span>
                        <div className="flex gap-2">
                          <PenaltyBadge icon={DollarSign} value={opt.costPenalty} label="💰" color="text-amber-400/70" />
                          <PenaltyBadge icon={Users} value={opt.satisfactionPenalty} label="👥" color="text-blue-400/70" />
                          <PenaltyBadge icon={Clock} value={opt.timePenalty} label="⏱" color="text-purple-400/70" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeEvents.length === 0 && (
        <div className="flex justify-end pt-2">
          <button onClick={nextPhase} className="btn-primary flex items-center gap-2">
            继续调度
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
