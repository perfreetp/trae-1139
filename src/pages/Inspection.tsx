import { useState, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import {
  ClipboardCheck, CheckCircle, XCircle, AlertTriangle,
  Thermometer, Clock, Shield, Package, ArrowRight,
} from 'lucide-react';

type TempCheck = { label: string; pass: boolean };

function simulateTempCheck(storageType: string): TempCheck {
  const passRates: Record<string, number> = { cold: 0.85, frozen: 0.8, ambient: 0.95 };
  const labels: Record<string, string> = { cold: '冷藏温度 0~4℃', frozen: '冷冻温度 -18℃以下', ambient: '常温存储 10~25℃' };
  const pass = Math.random() < (passRates[storageType] ?? 0.9);
  return { label: labels[storageType] ?? '温度检测', pass };
}

function qualityColor(q: number): string {
  if (q >= 0.8) return 'text-emerald-400';
  if (q >= 0.6) return 'text-amber-400';
  return 'text-red-400';
}

function qualityBg(q: number): string {
  if (q >= 0.8) return 'bg-emerald-500/10 border-emerald-500/30';
  if (q >= 0.6) return 'bg-amber-500/10 border-amber-500/30';
  return 'bg-red-500/10 border-red-500/30';
}

const STORAGE_LABEL: Record<string, string> = { cold: '冷藏', frozen: '冷冻', ambient: '常温' };

export default function Inspection() {
  const { ingredients, suppliers, currentDay, inspectIngredient, passIngredient, rejectIngredient, nextPhase } = useGameStore();
  const [inspectingId, setInspectingId] = useState<string | null>(null);
  const [tempChecks, setTempChecks] = useState<Record<string, TempCheck>>({});

  const pendingIngredients = useMemo(
    () => ingredients.filter(i => i.inspectionResult === 'pending' && !i.inspected),
    [ingredients],
  );

  const inspectedPassed = useMemo(
    () => ingredients.filter(i => i.inspectionResult === 'passed'),
    [ingredients],
  );

  const inspectedFailed = useMemo(
    () => ingredients.filter(i => i.inspectionResult === 'failed'),
    [ingredients],
  );

  const inspectedPending = useMemo(
    () => ingredients.filter(i => i.inspectionResult === 'pending' && i.inspected),
    [ingredients],
  );

  function handleInspect(id: string) {
    const ing = ingredients.find(i => i.id === id);
    if (!ing) return;
    inspectIngredient(id);
    const tc = simulateTempCheck(ing.storageType);
    setTempChecks(prev => ({ ...prev, [id]: tc }));
    setInspectingId(id);
  }

  function handlePass(id: string) {
    passIngredient(id);
    setInspectingId(null);
  }

  function handleReject(id: string) {
    rejectIngredient(id);
    setInspectingId(null);
  }

  function getSupplierName(supplierId: string) {
    return suppliers.find(s => s.id === supplierId)?.name ?? '未知供应商';
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardCheck size={28} className="text-amber-400" />
          <h1 className="text-2xl font-bold text-slate-100">原料验收</h1>
          <span className="font-mono-data text-sm text-slate-400 bg-[#1e1e32] px-3 py-1 rounded-lg border border-[#2a2a45]">
            第 {currentDay} 天
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-500/10 border border-slate-500/30 flex items-center justify-center">
            <Package size={20} className="text-slate-400" />
          </div>
          <div>
            <div className="text-xs text-slate-500">待检原料</div>
            <div className="font-mono-data text-xl font-bold text-slate-200">{pendingIngredients.length + inspectedPending.length}</div>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle size={20} className="text-emerald-400" />
          </div>
          <div>
            <div className="text-xs text-slate-500">合格入库</div>
            <div className="font-mono-data text-xl font-bold text-emerald-400">{inspectedPassed.length}</div>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <XCircle size={20} className="text-red-400" />
          </div>
          <div>
            <div className="text-xs text-slate-500">退货退款</div>
            <div className="font-mono-data text-xl font-bold text-red-400">{inspectedFailed.length}</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {pendingIngredients.map(ing => (
          <div key={ing.id} className={`card animate-slide-in ${inspectingId === ing.id ? 'card-active' : ''}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-bold text-slate-100">{ing.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#2a2a45] text-slate-400 border border-[#3a3a5a]">
                    {ing.category}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#2a2a45] text-slate-400 border border-[#3a3a5a]">
                    {STORAGE_LABEL[ing.storageType] ?? ing.storageType}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <div className="text-xs text-slate-500 mb-0.5">数量</div>
                    <div className="font-mono-data text-sm text-slate-200">{ing.quantity} 份</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-0.5">供应商</div>
                    <div className="text-sm text-slate-200 truncate">{getSupplierName(ing.supplierId)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-0.5">品质评分</div>
                    <div className={`font-mono-data text-sm font-bold ${qualityColor(ing.quality)}`}>
                      {Math.round(ing.quality * 100)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-0.5">保质期剩余</div>
                    <div className={`font-mono-data text-sm font-bold ${ing.expiryDays < 5 ? 'text-amber-400' : 'text-slate-200'}`}>
                      {ing.expiryDays} 天
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 flex flex-col items-end gap-2">
                <div className={`px-3 py-1.5 rounded-lg border text-sm font-bold ${qualityBg(ing.quality)}`}>
                  品质 {Math.round(ing.quality * 100)}%
                </div>
                {ing.expiryDays < 3 && (
                  <div className="flex items-center gap-1 text-xs text-red-400">
                    <AlertTriangle size={12} />
                    临近过期
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#2a2a45] flex justify-end">
              <button onClick={() => handleInspect(ing.id)} className="btn-primary flex items-center gap-2 text-sm">
                <Shield size={16} />
                开始检测
              </button>
            </div>
          </div>
        ))}

        {pendingIngredients.length === 0 && inspectedPending.length === 0 && inspectedPassed.length === 0 && inspectedFailed.length === 0 && (
          <div className="card text-center py-12">
            <Package size={48} className="mx-auto text-slate-600 mb-3" />
            <div className="text-slate-500">暂无待验收原料</div>
          </div>
        )}
      </div>

      {inspectingId && (() => {
        const ing = ingredients.find(i => i.id === inspectingId);
        if (!ing) return null;
        const tc = tempChecks[inspectingId];
        const qualityPass = ing.quality >= 0.6;
        const expiryPass = ing.expiryDays >= 3;
        const tempPass = tc?.pass ?? true;
        const allPass = qualityPass && expiryPass && tempPass;

        return (
          <div className="card card-active animate-slide-in mt-4">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={20} className="text-amber-400" />
              <h3 className="text-lg font-bold text-slate-100">检测报告 — {ing.name}</h3>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className={`p-3 rounded-lg border ${qualityPass ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-red-500/5 border-red-500/30'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {qualityPass ? <CheckCircle size={16} className="text-emerald-400" /> : <XCircle size={16} className="text-red-400" />}
                  <span className="text-sm font-medium text-slate-200">品质检测</span>
                </div>
                <div className="text-xs text-slate-400 mb-1">标准：品质 ≥ 60%</div>
                <div className={`font-mono-data text-sm font-bold ${qualityPass ? 'text-emerald-400' : 'text-red-400'}`}>
                  实测 {Math.round(ing.quality * 100)}% → {qualityPass ? '合格' : '不合格'}
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${expiryPass ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-red-500/5 border-red-500/30'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {expiryPass ? <CheckCircle size={16} className="text-emerald-400" /> : <XCircle size={16} className="text-red-400" />}
                  <span className="text-sm font-medium text-slate-200">保质期检测</span>
                </div>
                <div className="text-xs text-slate-400 mb-1">标准：保质期 ≥ 3天</div>
                <div className={`font-mono-data text-sm font-bold ${expiryPass ? 'text-emerald-400' : 'text-red-400'}`}>
                  剩余 {ing.expiryDays} 天 → {expiryPass ? '合格' : '不合格'}
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${tempPass ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-red-500/5 border-red-500/30'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {tempPass ? <CheckCircle size={16} className="text-emerald-400" /> : <XCircle size={16} className="text-red-400" />}
                  <span className="text-sm font-medium text-slate-200">温度检测</span>
                </div>
                <div className="text-xs text-slate-400 mb-1">{tc?.label ?? '温度检测'}</div>
                <div className={`font-mono-data text-sm font-bold ${tempPass ? 'text-emerald-400' : 'text-red-400'}`}>
                  {tempPass ? '温度正常' : '温度异常'} → {tempPass ? '合格' : '不合格'}
                </div>
              </div>
            </div>

            <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${allPass ? 'bg-emerald-500/5 border border-emerald-500/30' : 'bg-red-500/5 border border-red-500/30'}`}>
              {allPass ? (
                <>
                  <CheckCircle size={18} className="text-emerald-400" />
                  <span className="text-sm font-bold text-emerald-400">综合判定：符合入库标准</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={18} className="text-red-400" />
                  <span className="text-sm font-bold text-red-400">综合判定：存在不合格项，建议退货</span>
                </>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={() => handleReject(inspectingId)} className="btn-danger flex items-center gap-2 text-sm">
                <XCircle size={16} />
                退货退款
              </button>
              <button onClick={() => handlePass(inspectingId)} className="btn-success flex items-center gap-2 text-sm">
                <CheckCircle size={16} />
                合格入库
              </button>
            </div>
          </div>
        );
      })()}

      {inspectedPending.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <Clock size={14} />
            待判定（已检测）
          </h3>
          {inspectedPending.map(ing => (
            <div key={ing.id} className="card border-amber-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Thermometer size={18} className="text-amber-400" />
                  <span className="text-sm font-medium text-slate-200">{ing.name}</span>
                  <span className={`font-mono-data text-xs ${qualityColor(ing.quality)}`}>
                    品质 {Math.round(ing.quality * 100)}%
                  </span>
                  <span className="font-mono-data text-xs text-slate-400">
                    保质期 {ing.expiryDays}天
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setInspectingId(ing.id); }} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                    <Shield size={12} />
                    查看报告
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(inspectedPassed.length > 0 || inspectedFailed.length > 0) && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <ClipboardCheck size={14} />
            已完成验收
          </h3>
          <div className="grid gap-2">
            {[...inspectedPassed, ...inspectedFailed].map(ing => (
              <div key={ing.id} className={`card ${ing.inspectionResult === 'passed' ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {ing.inspectionResult === 'passed'
                      ? <CheckCircle size={16} className="text-emerald-400" />
                      : <XCircle size={16} className="text-red-400" />
                    }
                    <span className="text-sm text-slate-200">{ing.name}</span>
                    <span className={`font-mono-data text-xs ${qualityColor(ing.quality)}`}>
                      品质 {Math.round(ing.quality * 100)}%
                    </span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${ing.inspectionResult === 'passed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {ing.inspectionResult === 'passed' ? '已入库' : '已退货'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingIngredients.length === 0 && inspectedPending.length === 0 && (
        <div className="flex justify-end pt-2">
          <button onClick={nextPhase} className="btn-primary flex items-center gap-2">
            完成验收
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
