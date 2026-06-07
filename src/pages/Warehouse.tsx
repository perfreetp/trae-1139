import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { cn } from '@/lib/utils';
import type { StorageType } from '@/types';
import {
  Warehouse, Thermometer, Snowflake, Sun, Package,
  ArrowRight, CheckCircle2, AlertCircle, ChevronDown, X
} from 'lucide-react';

const ZONE_STYLES: Record<StorageType, { bg: string; border: string; icon: React.ReactNode; label: string }> = {
  cold: {
    bg: 'bg-[#1e3a5f]',
    border: 'border-[#2563eb]',
    icon: <Thermometer size={16} className="text-blue-400" />,
    label: '冷藏',
  },
  frozen: {
    bg: 'bg-[#1e3a4f]',
    border: 'border-[#06b6d4]',
    icon: <Snowflake size={16} className="text-cyan-400" />,
    label: '冷冻',
  },
  ambient: {
    bg: 'bg-[#3a2f1e]',
    border: 'border-[#a16207]',
    icon: <Sun size={16} className="text-amber-400" />,
    label: '常温',
  },
};

const STORAGE_TYPE_BADGE: Record<StorageType, { bg: string; text: string; label: string }> = {
  cold: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: '冷藏' },
  frozen: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', label: '冷冻' },
  ambient: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: '常温' },
};

const WAREHOUSE_SLOT_GROUPS: Record<string, string> = {
  cw1: '城东中央仓', cw2: '城东中央仓', cw3: '城东中央仓',
  cw4: '城西冷链仓', cw5: '城西冷链仓', cw6: '城西冷链仓',
};

export default function WarehousePage() {
  const { ingredients, warehouseSlots, assignToSlot, removeFromSlot, transferIngredient, nextPhase, currentDay, totalDays, challengeMode, funds } = useGameStore();
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [crossWarehouseTarget, setCrossWarehouseTarget] = useState<{ ingredientId: string; fromSlotId: string; toSlotId: string } | null>(null);
  const [lastSlotMap, setLastSlotMap] = useState<Record<string, string>>({});
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!openDropdownId) return;
    const handleClick = (e: MouseEvent) => {
      const ref = dropdownRefs.current[openDropdownId];
      if (ref && !ref.contains(e.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openDropdownId]);

  const passedIngredients = ingredients.filter(i => i.inspectionResult === 'passed');
  const unassignedIngredients = passedIngredients.filter(i => !i.slotId);
  const assignedIngredients = passedIngredients.filter(i => i.slotId);

  const getIngredientName = (id: string) => ingredients.find(i => i.id === id)?.name ?? id;

  const getCompatibleSlots = (storageType: StorageType) =>
    warehouseSlots.filter(s => s.zone === storageType);

  const handleAssign = (ingredientId: string, slotId: string) => {
    const ingredient = ingredients.find(i => i.id === ingredientId);
    if (challengeMode) {
      const fromSlotId = ingredient?.slotId || lastSlotMap[ingredientId];
      if (fromSlotId) {
        const fromGroup = WAREHOUSE_SLOT_GROUPS[fromSlotId];
        const toGroup = WAREHOUSE_SLOT_GROUPS[slotId];
        if (fromGroup && toGroup && fromGroup !== toGroup) {
          setCrossWarehouseTarget({ ingredientId, fromSlotId, toSlotId: slotId });
          setOpenDropdownId(null);
          return;
        }
      }
    }
    assignToSlot(ingredientId, slotId);
    delete lastSlotMap[ingredientId];
    setOpenDropdownId(null);
  };

  const confirmCrossWarehouse = () => {
    if (crossWarehouseTarget) {
      transferIngredient(crossWarehouseTarget.ingredientId, crossWarehouseTarget.fromSlotId, crossWarehouseTarget.toSlotId);
      setCrossWarehouseTarget(null);
    }
  };

  const handleRemove = (ingredientId: string) => {
    const ingredient = ingredients.find(i => i.id === ingredientId);
    if (challengeMode && ingredient?.slotId) {
      setLastSlotMap(prev => ({ ...prev, [ingredientId]: ingredient.slotId! }));
    }
    removeFromSlot(ingredientId);
  };

  const allPassedAssigned = unassignedIngredients.length === 0 && passedIngredients.length > 0;

  return (
    <div className="animate-slide-in space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Warehouse size={28} className="text-amber-400" />
          <div>
            <h1 className="text-2xl font-bold text-slate-100">仓库存放</h1>
            <p className="text-sm text-slate-500">
              第 <span className="font-mono-data text-amber-400">{currentDay}</span> / {totalDays} 天
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-400">
            已分配 <span className="font-mono-data text-emerald-400">{assignedIngredients.length}</span>
            {' / '}
            待分配 <span className="font-mono-data text-amber-400">{unassignedIngredients.length}</span>
          </div>
          <button
            onClick={nextPhase}
            disabled={!allPassedAssigned}
            className={cn(
              'btn-primary flex items-center gap-2',
              !allPassedAssigned && 'opacity-40 cursor-not-allowed hover:bg-amber-500 hover:shadow-none active:scale-100'
            )}
          >
            确认存放
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-center gap-2 text-sm text-amber-300">
        <AlertCircle size={16} className="flex-shrink-0" />
        <span>FIFO 先进先出原则：优先使用入库早的原料，避免过期浪费</span>
      </div>

      {crossWarehouseTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="card max-w-sm w-full mx-4 p-6 text-center animate-slide-in border-2 border-amber-500/30">
            <AlertCircle size={40} className="mx-auto text-amber-400 mb-4" />
            <h3 className="text-lg font-bold text-amber-400 mb-2">跨仓调拨确认</h3>
            <p className="text-sm text-slate-400 mb-4">
              此操作将原料从 <span className="text-slate-200">{WAREHOUSE_SLOT_GROUPS[crossWarehouseTarget.fromSlotId]}</span> 调拨到{' '}
              <span className="text-slate-200">{WAREHOUSE_SLOT_GROUPS[crossWarehouseTarget.toSlotId]}</span>，
              需支付跨仓调拨费 <span className="text-amber-400 font-bold">¥200</span>
            </p>
            {funds < 200 && (
              <p className="text-xs text-red-400 mb-3">资金不足，无法支付调拨费</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setCrossWarehouseTarget(null)}
                className="btn-secondary flex-1"
              >
                取消
              </button>
              <button
                onClick={confirmCrossWarehouse}
                disabled={funds < 200}
                className={cn('btn-primary flex-1', funds < 200 && 'opacity-40 cursor-not-allowed')}
              >
                确认调拨 ¥200
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-[1fr_380px] gap-5 min-h-0">
        <div className="space-y-4 overflow-y-auto">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Package size={18} className="text-slate-400" />
            仓库平面图
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {warehouseSlots.map(slot => {
              const style = ZONE_STYLES[slot.zone];
              const isSelected = selectedSlotId === slot.id;
              const used = slot.itemIds.length;
              const pct = Math.round((used / slot.capacity) * 100);
              const isFull = used >= slot.capacity;

              return (
                <div
                  key={slot.id}
                  onClick={() => setSelectedSlotId(isSelected ? null : slot.id)}
                  className={cn(
                    'card cursor-pointer transition-all duration-200',
                    style.bg,
                    style.border,
                    'border-2',
                    isSelected && 'ring-2 ring-amber-400 ring-offset-2 ring-offset-[#0f0f1a]',
                    isFull && 'opacity-60'
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {style.icon}
                      <span className="font-semibold text-slate-100">{slot.label}</span>
                      <span className={cn('text-xs px-1.5 py-0.5 rounded', STORAGE_TYPE_BADGE[slot.zone].bg, STORAGE_TYPE_BADGE[slot.zone].text)}>
                        {style.label}
                      </span>
                    </div>
                    {isFull && (
                      <span className="text-xs text-red-400 font-medium">已满</span>
                    )}
                  </div>

                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400">容量</span>
                      <span className={cn('font-mono-data', pct >= 90 ? 'text-red-400' : pct >= 60 ? 'text-amber-400' : 'text-emerald-400')}>
                        {used}/{slot.capacity}
                      </span>
                    </div>
                    <div className="w-full bg-black/30 rounded-full h-2">
                      <div
                        className={cn(
                          'h-2 rounded-full transition-all duration-500',
                          pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {slot.itemIds.length > 0 && (
                    <div className="space-y-1 mt-3">
                      <div className="text-xs text-slate-500 mb-1">已存放物品</div>
                      {slot.itemIds.map(itemId => {
                        const ing = ingredients.find(i => i.id === itemId);
                        return (
                          <div
                            key={itemId}
                            className="flex items-center justify-between bg-black/20 rounded px-2 py-1 text-xs"
                          >
                            <span className="text-slate-300">{ing?.name ?? itemId}</span>
                            <button
                              onClick={e => { e.stopPropagation(); handleRemove(itemId); }}
                              className="text-red-400 hover:text-red-300 transition-colors p-0.5"
                              title="移出"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {slot.itemIds.length === 0 && (
                    <div className="text-xs text-slate-500 mt-3 text-center py-2 border border-dashed border-slate-600 rounded">
                      暂无物品
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 overflow-y-auto">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Package size={18} className="text-slate-400" />
            待分配原料
            <span className="font-mono-data text-sm text-amber-400 ml-1">{unassignedIngredients.length}</span>
          </h2>

          {unassignedIngredients.length === 0 && passedIngredients.length > 0 && (
            <div className="card flex flex-col items-center justify-center py-10 text-center">
              <CheckCircle2 size={40} className="text-emerald-400 mb-3" />
              <div className="text-emerald-400 font-semibold">全部原料已分配</div>
              <div className="text-sm text-slate-500 mt-1">点击「确认存放」进入下一阶段</div>
            </div>
          )}

          {unassignedIngredients.length === 0 && passedIngredients.length === 0 && (
            <div className="card flex flex-col items-center justify-center py-10 text-center">
              <Package size={40} className="text-slate-600 mb-3" />
              <div className="text-slate-500">暂无通过验收的原料</div>
            </div>
          )}

          <div className="space-y-2">
            {unassignedIngredients.map(ing => {
              const badge = STORAGE_TYPE_BADGE[ing.storageType];
              const compatibleSlots = getCompatibleSlots(ing.storageType);
              const hasAvailableSlot = compatibleSlots.some(s => s.itemIds.length < s.capacity);
              const isDropdownOpen = openDropdownId === ing.id;

              return (
                <div
                  key={ing.id}
                  className={cn(
                    'card animate-slide-in',
                    selectedSlotId && compatibleSlots.some(s => s.id === selectedSlotId)
                      ? 'border-amber-500/40'
                      : ''
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-200 truncate">{ing.name}</span>
                        <span className={cn('text-xs px-1.5 py-0.5 rounded flex-shrink-0', badge.bg, badge.text)}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>类别: {ing.category}</span>
                        <span>数量: <span className="font-mono-data text-slate-300">{ing.quantity}</span></span>
                      </div>
                    </div>

                    <div className="relative ml-3" ref={el => { dropdownRefs.current[ing.id] = el; }}>
                      <button
                        onClick={() => setOpenDropdownOpen(ing.id)}
                        disabled={!hasAvailableSlot}
                        className={cn(
                          'flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-colors',
                          hasAvailableSlot
                            ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                            : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                        )}
                      >
                        分配
                        <ChevronDown size={14} className={cn('transition-transform', isDropdownOpen && 'rotate-180')} />
                      </button>

                      {isDropdownOpen && hasAvailableSlot && (
                        <div className="absolute right-0 top-full mt-1 z-50 bg-[#1e1e32] border border-[#2a2a45] rounded-lg shadow-xl shadow-black/40 py-1 min-w-[180px] animate-fade-in">
                          <div className="px-3 py-1.5 text-xs text-slate-500 border-b border-[#2a2a45]">
                            {ZONE_STYLES[ing.storageType].label}区域
                          </div>
                          {compatibleSlots
                            .filter(s => s.itemIds.length < s.capacity)
                            .map(slot => (
                              <button
                                key={slot.id}
                                onClick={() => handleAssign(ing.id, slot.id)}
                                className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-[#2a2a45] transition-colors flex items-center justify-between"
                              >
                                <span>{slot.label}</span>
                                <span className="font-mono-data text-xs text-slate-500">
                                  {slot.itemIds.length}/{slot.capacity}
                                </span>
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {assignedIngredients.length > 0 && (
            <>
              <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2 pt-2">
                <CheckCircle2 size={18} className="text-emerald-400" />
                已分配原料
                <span className="font-mono-data text-sm text-emerald-400 ml-1">{assignedIngredients.length}</span>
              </h2>
              <div className="space-y-2">
                {assignedIngredients.map(ing => {
                  const badge = STORAGE_TYPE_BADGE[ing.storageType];
                  const slot = warehouseSlots.find(s => s.id === ing.slotId);

                  return (
                    <div key={ing.id} className="card border-emerald-500/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-200">{ing.name}</span>
                          <span className={cn('text-xs px-1.5 py-0.5 rounded', badge.bg, badge.text)}>
                            {badge.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-emerald-400">
                            → {slot?.label}
                          </span>
                          <button
                            onClick={() => handleRemove(ing.id)}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded hover:bg-red-500/10"
                          >
                            移出
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  function setOpenDropdownOpen(id: string) {
    setOpenDropdownId(prev => (prev === id ? null : id));
  }
}
