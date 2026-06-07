import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { cn } from '@/lib/utils';
import { CHALLENGE_DISTANCE_MATRIX } from '@/data/gameData';
import type { StorageType, WarehouseSlot, Vehicle, Ingredient, DeliveryOrder, Customer } from '@/types';
import {
  Warehouse, Thermometer, Snowflake, Sun, Truck, Package,
  MapPin, AlertTriangle, ArrowLeft, Building2, RouteIcon, TrendingUp
} from 'lucide-react';

interface WarehouseData {
  key: string;
  name: string;
  slots: WarehouseSlot[];
  vehicles: Vehicle[];
  ingredients: Ingredient[];
  customers: Customer[];
  orders: DeliveryOrder[];
  totalCapacity: number;
  totalUsed: number;
}

const WAREHOUSE_GROUPS: { key: string; name: string; slotIds: string[] }[] = [
  { key: 'east', name: '城东中央仓', slotIds: ['cw1', 'cw2', 'cw3'] },
  { key: 'west', name: '城西冷链仓', slotIds: ['cw4', 'cw5', 'cw6'] },
];

const ZONE_STYLES: Record<StorageType, { bg: string; border: string; icon: React.ReactNode; label: string }> = {
  cold: {
    bg: 'bg-[#1e3a5f]',
    border: 'border-[#2563eb]',
    icon: <Thermometer size={14} className="text-blue-400" />,
    label: '冷藏',
  },
  frozen: {
    bg: 'bg-[#1e3a4f]',
    border: 'border-[#06b6d4]',
    icon: <Snowflake size={14} className="text-cyan-400" />,
    label: '冷冻',
  },
  ambient: {
    bg: 'bg-[#3a2f1e]',
    border: 'border-[#a16207]',
    icon: <Sun size={14} className="text-amber-400" />,
    label: '常温',
  },
};

const VEHICLE_TYPE_LABEL: Record<string, string> = {
  cold_chain: '冷链车',
  normal: '普通货车',
};

export default function MultiWarehouseChallenge() {
  const navigate = useNavigate();
  const {
    currentDay, totalDays, funds, satisfaction, onTimeRate,
    warehouseSlots, vehicles, ingredients, customers, orders, challengeMode,
  } = useGameStore();

  const warehouseData: WarehouseData[] = useMemo(() => {
    return WAREHOUSE_GROUPS.map(wh => {
      const slots = warehouseSlots.filter(s => wh.slotIds.includes(s.id));
      const whVehicles = vehicles.filter(v => v.originWarehouse && wh.slotIds.includes(v.originWarehouse));
      const slotItemIds = slots.flatMap(s => s.itemIds);
      const whIngredients = ingredients.filter(i => slotItemIds.includes(i.id));
      const otherGroups = WAREHOUSE_GROUPS.filter(g => g.key !== wh.key);
      const whCustomers = customers.filter(c => {
        const loc = c.location;
        const dist = CHALLENGE_DISTANCE_MATRIX[wh.name]?.[loc];
        const otherDist = otherGroups.map(g => CHALLENGE_DISTANCE_MATRIX[g.name]?.[loc]).filter((d): d is number => d !== undefined);
        const minOther = otherDist.length > 0 ? Math.min(...otherDist) : Infinity;
        return dist !== undefined && dist <= minOther;
      });
      const whOrders = orders.filter(o => {
        if (o.originWarehouse) return wh.slotIds.includes(o.originWarehouse);
        const customer = customers.find(c => c.id === o.customerId);
        if (!customer) return false;
        return whCustomers.some(c => c.id === customer.id);
      });
      const totalCapacity = slots.reduce((sum, s) => sum + s.capacity, 0);
      const totalUsed = slots.reduce((sum, s) => sum + s.itemIds.length, 0);
      return {
        key: wh.key,
        name: wh.name,
        slots,
        vehicles: whVehicles,
        ingredients: whIngredients,
        customers: whCustomers,
        orders: whOrders,
        totalCapacity,
        totalUsed,
      };
    });
  }, [warehouseSlots, vehicles, ingredients, customers, orders]);

  const distanceComparison = useMemo(() => {
    return customers
      .map(c => {
        const eastDist = CHALLENGE_DISTANCE_MATRIX['城东中央仓']?.[c.location];
        const westDist = CHALLENGE_DISTANCE_MATRIX['城西冷链仓']?.[c.location];
        if (eastDist === undefined && westDist === undefined) return null;
        const nearest = (eastDist ?? Infinity) <= (westDist ?? Infinity) ? '城东中央仓' : '城西冷链仓';
        return { customer: c.id, customerName: c.name, eastDist: eastDist ?? ('-' as const), westDist: westDist ?? ('-' as const), nearestWarehouse: nearest };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);
  }, [customers]);

  if (!challengeMode) {
    return (
      <div className="animate-slide-in flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Warehouse size={48} className="text-slate-600" />
        <h2 className="text-xl font-bold text-slate-400">非挑战模式</h2>
        <p className="text-sm text-slate-500">多仓配送挑战页面仅在挑战模式下可用</p>
        <button onClick={() => navigate('/')} className="btn-secondary">返回总览</button>
      </div>
    );
  }

  return (
    <div className="animate-slide-in space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Warehouse size={28} className="text-amber-400" />
          <div>
            <h1 className="text-2xl font-bold text-slate-100">多仓配送挑战</h1>
            <p className="text-sm text-slate-500">
              挑战日 <span className="font-mono-data text-amber-400">{currentDay}</span> / {totalDays}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#1e1e32] border border-[#2a2a45] rounded-lg px-3 py-1.5">
            <span className="text-xs text-slate-500">资金</span>
            <span className={cn('font-mono-data font-bold', funds > 0 ? 'text-amber-400' : 'text-red-400')}>
              ¥{funds.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-[#1e1e32] border border-[#2a2a45] rounded-lg px-3 py-1.5">
            <span className="text-xs text-slate-500">满意度</span>
            <span className={cn('font-mono-data font-bold', satisfaction >= 70 ? 'text-emerald-400' : 'text-amber-400')}>
              {satisfaction}%
            </span>
          </div>
          <div className="flex items-center gap-2 bg-[#1e1e32] border border-[#2a2a45] rounded-lg px-3 py-1.5">
            <span className="text-xs text-slate-500">准点率</span>
            <span className={cn('font-mono-data font-bold', onTimeRate >= 70 ? 'text-emerald-400' : 'text-red-400')}>
              {onTimeRate}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {warehouseData.map(wh => (
          <WarehouseColumn key={wh.key} warehouse={wh} />
        ))}
      </div>

      <CrossWarehouseAnalysis distanceComparison={distanceComparison} />

      <div className="card border-amber-500/30 bg-amber-500/5">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-amber-300">策略提示</h3>
            <ul className="text-sm text-amber-200/80 space-y-1">
              <li>• 提示：优先从距离客户最近的仓库发货</li>
              <li>• 跨仓配送距离加倍，准点率受影响</li>
              <li>• 城东中央仓侧重常温/冷藏，城西冷链仓侧重冷冻/冷藏</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button onClick={() => navigate('/procurement')} className="btn-primary flex items-center gap-2">
          <ArrowLeft size={16} />
          返回调度台
        </button>
        <button onClick={() => navigate('/warehouse')} className="btn-secondary flex items-center gap-2">
          <Building2 size={16} />
          查看仓库详情
        </button>
      </div>
    </div>
  );
}

function WarehouseColumn({ warehouse: wh }: { warehouse: WarehouseData }) {
  const customers = useGameStore(s => s.customers);
  const isEast = wh.key === 'east';
  const accentText = isEast ? 'text-amber-400' : 'text-cyan-400';
  const accentBg = isEast ? 'bg-amber-500/10' : 'bg-cyan-500/10';
  const accentBorder = isEast ? 'border-amber-500/30' : 'border-cyan-500/30';
  const usagePct = wh.totalCapacity > 0 ? Math.round((wh.totalUsed / wh.totalCapacity) * 100) : 0;

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Warehouse size={20} className={accentText} />
          <h2 className={cn('text-lg font-bold', accentText)}>{wh.name}</h2>
        </div>
        <div className={cn('text-xs px-2 py-1 rounded border', accentBg, accentText, accentBorder)}>
          容量 {wh.totalUsed}/{wh.totalCapacity}
        </div>
      </div>

      <div className="w-full bg-black/30 rounded-full h-2">
        <div
          className={cn(
            'h-2 rounded-full transition-all duration-500',
            usagePct >= 90 ? 'bg-red-500' : isEast ? 'bg-amber-500' : 'bg-cyan-500'
          )}
          style={{ width: `${Math.min(usagePct, 100)}%` }}
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-1.5">
          <Package size={14} />
          仓库分区
        </h3>
        {wh.slots.map(slot => {
          const style = ZONE_STYLES[slot.zone];
          const used = slot.itemIds.length;
          const pct = slot.capacity > 0 ? Math.round((used / slot.capacity) * 100) : 0;
          const isFull = used >= slot.capacity;
          return (
            <div key={slot.id} className={cn('rounded-lg p-2.5 border', style.bg, style.border)}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  {style.icon}
                  <span className="text-sm font-medium text-slate-200">{slot.label.replace(wh.name + '-', '')}</span>
                  <span className={cn('text-xs px-1 py-0.5 rounded', style.label === '冷藏' ? 'bg-blue-500/20 text-blue-400' : style.label === '冷冻' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-amber-500/20 text-amber-400')}>
                    {style.label}
                  </span>
                </div>
                <span className={cn('font-mono-data text-xs', isFull ? 'text-red-400' : pct >= 60 ? 'text-amber-400' : 'text-emerald-400')}>
                  {used}/{slot.capacity}
                </span>
              </div>
              <div className="w-full bg-black/30 rounded-full h-1.5">
                <div className={cn('h-1.5 rounded-full transition-all', isFull ? 'bg-red-500' : pct >= 60 ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-1.5">
          <Truck size={14} />
          配送车辆
        </h3>
        {wh.vehicles.length === 0 && (
          <div className="text-xs text-slate-500 py-2 text-center">暂无车辆</div>
        )}
        <div className="space-y-1.5">
          {wh.vehicles.map(v => {
            const usage = v.capacity > 0 ? Math.round((v.usedCapacity / v.capacity) * 100) : 0;
            return (
              <div key={v.id} className="flex items-center justify-between bg-black/20 rounded px-2.5 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <Truck size={12} className={v.type === 'cold_chain' ? 'text-cyan-400' : 'text-slate-400'} />
                  <span className="text-slate-200">{v.name}</span>
                  <span className={cn('text-xs px-1 py-0.5 rounded', v.type === 'cold_chain' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-500/20 text-slate-400')}>
                    {VEHICLE_TYPE_LABEL[v.type] ?? v.type}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-black/30 rounded-full h-1.5">
                    <div className={cn('h-1.5 rounded-full', usage >= 90 ? 'bg-red-500' : usage >= 60 ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: `${usage}%` }} />
                  </div>
                  <span className="font-mono-data text-xs text-slate-400">{v.usedCapacity}/{v.capacity}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-1.5">
          <Package size={14} />
          可用原料
          <span className="font-mono-data text-xs text-slate-500 ml-1">{wh.ingredients.length}种</span>
        </h3>
        {wh.ingredients.length === 0 && (
          <div className="text-xs text-slate-500 py-2 text-center">暂无入库原料</div>
        )}
        <div className="flex flex-wrap gap-1.5">
          {wh.ingredients.slice(0, 8).map(ing => (
            <span key={ing.id} className="text-xs bg-black/30 border border-[#2a2a45] rounded px-2 py-1 text-slate-300">
              {ing.name} <span className="text-slate-500">×{ing.quantity}</span>
            </span>
          ))}
          {wh.ingredients.length > 8 && (
            <span className="text-xs text-slate-500 py-1">+{wh.ingredients.length - 8}种</span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-1.5">
          <MapPin size={14} />
          负责客户
          <span className="font-mono-data text-xs text-slate-500 ml-1">{wh.customers.length}个</span>
        </h3>
        {wh.customers.length === 0 && (
          <div className="text-xs text-slate-500 py-2 text-center">暂无分配客户</div>
        )}
        <div className="space-y-1">
          {wh.customers.map(c => {
            const dist = CHALLENGE_DISTANCE_MATRIX[wh.name]?.[c.location];
            const typeLabel = c.type === 'school' ? '学校' : c.type === 'hospital' ? '医院' : '企业';
            return (
              <div key={c.id} className="flex items-center justify-between bg-black/20 rounded px-2.5 py-1.5 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin size={12} className={accentText} />
                  <span className="text-slate-200">{c.name}</span>
                  <span className="text-xs bg-slate-500/20 text-slate-400 px-1 py-0.5 rounded">{typeLabel}</span>
                </div>
                <span className="font-mono-data text-xs text-slate-400">
                  {dist !== undefined ? `${dist}km` : '-'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-1.5">
          <RouteIcon size={14} />
          待配送订单
          <span className="font-mono-data text-xs text-slate-500 ml-1">{wh.orders.length}单</span>
        </h3>
        {wh.orders.length === 0 && (
          <div className="text-xs text-slate-500 py-2 text-center">暂无待配送订单</div>
        )}
        <div className="space-y-1">
          {wh.orders.slice(0, 5).map(o => {
            const customer = customers.find(c => c.id === o.customerId);
            return (
              <div key={o.id} className="flex items-center justify-between bg-black/20 rounded px-2.5 py-1.5 text-sm">
                <span className="text-slate-300">{customer?.name ?? o.customerId}</span>
                <span className={cn('text-xs px-1.5 py-0.5 rounded',
                  o.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                  o.status === 'delivering' ? 'bg-blue-500/20 text-blue-400' :
                  o.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400' :
                  'bg-red-500/20 text-red-400'
                )}>
                  {o.status === 'pending' ? '待配送' : o.status === 'delivering' ? '配送中' : o.status === 'delivered' ? '已送达' : '失败'}
                </span>
              </div>
            );
          })}
          {wh.orders.length > 5 && (
            <span className="text-xs text-slate-500">+{wh.orders.length - 5}单</span>
          )}
        </div>
      </div>
    </div>
  );
}

interface DistanceRow {
  customer: string;
  customerName: string;
  eastDist: number | '-';
  westDist: number | '-';
  nearestWarehouse: string;
}

function CrossWarehouseAnalysis({ distanceComparison }: { distanceComparison: DistanceRow[] }) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={18} className="text-amber-400" />
        <h2 className="text-lg font-bold text-slate-100">跨仓配送分析</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-sm font-semibold text-emerald-400">同仓配送</span>
          </div>
          <p className="text-xs text-emerald-200/70">距离短、成本低、准点率有保障</p>
        </div>
        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-sm font-semibold text-red-400">跨仓配送</span>
          </div>
          <p className="text-xs text-red-200/70">距离加倍、成本更高、准点率受影响</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a2a45]">
              <th className="text-left text-slate-500 font-medium py-2 pr-4">客户</th>
              <th className="text-center text-amber-400 font-medium py-2 px-3">城东中央仓</th>
              <th className="text-center text-cyan-400 font-medium py-2 px-3">城西冷链仓</th>
              <th className="text-center text-slate-500 font-medium py-2 pl-3">最近仓库</th>
              <th className="text-center text-slate-500 font-medium py-2 pl-3">距离差</th>
            </tr>
          </thead>
          <tbody>
            {distanceComparison.map(row => {
              const eDist = typeof row.eastDist === 'number' ? row.eastDist : Infinity;
              const wDist = typeof row.westDist === 'number' ? row.westDist : Infinity;
              const isEastNearest = row.nearestWarehouse === '城东中央仓';
              const distanceDiff = eDist !== Infinity && wDist !== Infinity ? Math.abs(eDist - wDist) : null;
              return (
                <tr key={row.customer} className="border-b border-[#2a2a45]/50">
                  <td className="py-2.5 pr-4 text-slate-200">{row.customerName}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={cn('font-mono-data', isEastNearest ? 'text-emerald-400 font-bold' : 'text-red-400/80')}>
                      {row.eastDist}{typeof row.eastDist === 'number' ? 'km' : ''}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={cn('font-mono-data', !isEastNearest ? 'text-emerald-400 font-bold' : 'text-red-400/80')}>
                      {row.westDist}{typeof row.westDist === 'number' ? 'km' : ''}
                    </span>
                  </td>
                  <td className="py-2.5 pl-3 text-center">
                    <span className={cn('text-xs px-1.5 py-0.5 rounded', isEastNearest ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-500/20 text-cyan-400')}>
                      {isEastNearest ? '城东' : '城西'}
                    </span>
                  </td>
                  <td className="py-2.5 pl-3 text-center">
                    {distanceDiff !== null && (
                      <span className={cn('font-mono-data text-xs', distanceDiff >= 15 ? 'text-red-400' : distanceDiff >= 8 ? 'text-amber-400' : 'text-slate-400')}>
                        +{distanceDiff}km
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 pt-3 border-t border-[#2a2a45]">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>城东中央仓 → 城西冷链仓: <span className="font-mono-data text-slate-300">18km</span></span>
          <span>跨仓配送距离 ×2，准点率 -15%</span>
        </div>
      </div>
    </div>
  );
}
