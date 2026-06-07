import { useState, useMemo, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import {
  Truck, MapPin, Route, Package, ArrowRight, ArrowUp, ArrowDown,
  AlertTriangle, CheckCircle, XCircle, Thermometer, ChevronRight,
} from 'lucide-react';

const COLD_CATEGORIES = new Set(['egg', 'tomato', 'vegetable', 'chicken', 'pork', 'fish', 'seafood', 'tofu']);

export default function VehicleLoading() {
  const vehicles = useGameStore(s => s.vehicles);
  const orders = useGameStore(s => s.orders);
  const customers = useGameStore(s => s.customers);
  const recipes = useGameStore(s => s.recipes);
  const currentDay = useGameStore(s => s.currentDay);
  const assignOrderToVehicle = useGameStore(s => s.assignOrderToVehicle);
  const setVehicleRoute = useGameStore(s => s.setVehicleRoute);
  const confirmLoading = useGameStore(s => s.confirmLoading);
  const nextPhase = useGameStore(s => s.nextPhase);
  const setOrders = useGameStore(s => s.setOrders);
  const updateVehicle = useGameStore(s => s.updateVehicle);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const unassignedOrders = useMemo(() => orders.filter(o => !o.vehicleId), [orders]);
  const assignedCount = useMemo(() => orders.filter(o => o.vehicleId).length, [orders]);

  const getCustomerName = useCallback(
    (customerId: string) => customers.find(c => c.id === customerId)?.name ?? '未知客户',
    [customers],
  );

  const getRecipeNames = useCallback(
    (recipeIds: string[]) => recipeIds.map(rid => recipes.find(r => r.id === rid)?.name ?? '未知').join('、'),
    [recipes],
  );

  function orderNeedsColdChain(recipeIds: string[]): boolean {
    return recipeIds.some(rid => {
      const recipe = recipes.find(r => r.id === rid);
      return recipe?.requiredIngredients.some(ri => COLD_CATEGORIES.has(ri.ingredientCategory)) ?? false;
    });
  }

  function getVehicleOrders(vehicleId: string) {
    return orders.filter(o => o.vehicleId === vehicleId);
  }

  function handleVehicleClick(vehicleId: string) {
    if (!selectedOrderId) return;
    const order = orders.find(o => o.id === selectedOrderId);
    if (!order) return;

    assignOrderToVehicle(selectedOrderId, vehicleId);

    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle && !vehicle.route.includes(order.customerId)) {
      setVehicleRoute(vehicleId, [...vehicle.route, order.customerId]);
    }

    setSelectedOrderId(null);
  }

  function handleUnassignOrder(orderId: string, vehicleId: string) {
    const order = orders.find(o => o.id === orderId);
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!order || !vehicle) return;

    const otherOrdersForCustomer = vehicle.assignedOrderIds
      .filter(id => id !== orderId)
      .map(id => orders.find(o => o.id === id))
      .filter(o => o && o.customerId === order.customerId);

    const shouldRemoveFromRoute = otherOrdersForCustomer.length === 0;

    setOrders(orders.map(o => o.id === orderId ? { ...o, vehicleId: undefined } : o));
    updateVehicle(vehicleId, {
      assignedOrderIds: vehicle.assignedOrderIds.filter(id => id !== orderId),
      usedCapacity: Math.max(0, vehicle.usedCapacity - (order.portions / 10)),
    });

    if (shouldRemoveFromRoute) {
      setVehicleRoute(vehicleId, vehicle.route.filter(cid => cid !== order.customerId));
    }
  }

  function handleMoveRouteStop(vehicleId: string, idx: number, direction: 'up' | 'down') {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;
    const newRoute = [...vehicle.route];
    const target = direction === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= newRoute.length) return;
    [newRoute[idx], newRoute[target]] = [newRoute[target], newRoute[idx]];
    setVehicleRoute(vehicleId, newRoute);
  }

  function handleConfirm() {
    const errors: string[] = [];

    if (unassignedOrders.length > 0) {
      errors.push(`还有 ${unassignedOrders.length} 个订单未分配车辆`);
    }

    const overCapacityVehicles = vehicles.filter(v => v.usedCapacity > v.capacity);
    if (overCapacityVehicles.length > 0) {
      errors.push(`${overCapacityVehicles.map(v => v.name).join('、')} 超载`);
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    confirmLoading();
    nextPhase();
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Route size={28} className="text-amber-400" />
          <h1 className="text-2xl font-bold text-slate-100">车辆装载与路线规划</h1>
          <span className="font-mono-data text-sm text-slate-400 bg-[#1e1e32] px-3 py-1 rounded-lg border border-[#2a2a45]">
            第 {currentDay} 天
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Package size={20} className="text-amber-400" />
          </div>
          <div>
            <div className="text-xs text-slate-500">总订单</div>
            <div className="font-mono-data text-xl font-bold text-slate-200">{orders.length}</div>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle size={20} className="text-emerald-400" />
          </div>
          <div>
            <div className="text-xs text-slate-500">已分配</div>
            <div className="font-mono-data text-xl font-bold text-emerald-400">{assignedCount}</div>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <XCircle size={20} className="text-red-400" />
          </div>
          <div>
            <div className="text-xs text-slate-500">未分配</div>
            <div className="font-mono-data text-xl font-bold text-red-400">{unassignedOrders.length}</div>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
            <Truck size={20} className="text-blue-400" />
          </div>
          <div>
            <div className="text-xs text-slate-500">可用车辆</div>
            <div className="font-mono-data text-xl font-bold text-blue-400">{vehicles.filter(v => v.available).length}</div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Truck size={20} className="text-amber-400" />
          车辆装载
        </h2>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8 grid grid-cols-2 gap-4">
            {vehicles.map(vehicle => {
              const isOverCapacity = vehicle.usedCapacity > vehicle.capacity;
              const capacityPercent = Math.min(100, Math.round((vehicle.usedCapacity / vehicle.capacity) * 100));
              const vOrders = getVehicleOrders(vehicle.id);

              return (
                <div
                  key={vehicle.id}
                  onClick={() => handleVehicleClick(vehicle.id)}
                  className={`card cursor-pointer transition-all ${
                    selectedOrderId ? 'hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10' : ''
                  } ${isOverCapacity ? 'border-red-500/30 animate-flash-border' : ''}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Truck size={18} className={vehicle.type === 'cold_chain' ? 'text-blue-400' : 'text-slate-400'} />
                      <span className="font-bold text-slate-100">{vehicle.name}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded border ${
                      vehicle.type === 'cold_chain'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                    }`}>
                      {vehicle.type === 'cold_chain' ? '冷链车' : '普通货车'}
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">装载容量</span>
                      <span className={`font-mono-data ${isOverCapacity ? 'text-red-400' : 'text-slate-300'}`}>
                        {vehicle.usedCapacity} / {vehicle.capacity}
                      </span>
                    </div>
                    <div className="h-2 bg-[#0f0f1a] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOverCapacity ? 'bg-red-500' : capacityPercent > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, capacityPercent)}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className={`font-mono-data text-xs ${isOverCapacity ? 'text-red-400' : 'text-slate-500'}`}>
                        {capacityPercent}%
                      </span>
                      {isOverCapacity && (
                        <span className="flex items-center gap-1 text-xs text-red-400">
                          <AlertTriangle size={12} />
                          超载
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {vOrders.length === 0 && (
                      <div className="text-xs text-slate-500 text-center py-3 border border-dashed border-[#2a2a45] rounded-lg">
                        {selectedOrderId ? '点击此处分配订单' : '暂无分配订单'}
                      </div>
                    )}
                    {vOrders.map(order => (
                      <div
                        key={order.id}
                        onClick={e => { e.stopPropagation(); handleUnassignOrder(order.id, vehicle.id); }}
                        className="flex items-center justify-between p-2 rounded-lg bg-[#0f0f1a] border border-[#2a2a45] hover:border-red-500/30 cursor-pointer group transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-slate-200 truncate">{getCustomerName(order.customerId)}</div>
                          <div className="text-xs text-slate-500 truncate">{getRecipeNames(order.recipeIds)}</div>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="font-mono-data text-xs text-slate-400">{order.portions}份</span>
                          <XCircle size={14} className="text-slate-600 group-hover:text-red-400 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="col-span-4">
            <div className="card h-full">
              <div className="flex items-center gap-2 mb-3">
                <Package size={18} className="text-amber-400" />
                <h3 className="font-bold text-slate-100">待分配订单</h3>
                <span className="font-mono-data text-xs text-slate-500 bg-[#0f0f1a] px-2 py-0.5 rounded">
                  {unassignedOrders.length}
                </span>
              </div>

              {unassignedOrders.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  所有订单已分配
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {unassignedOrders.map(order => {
                    const needsCold = orderNeedsColdChain(order.recipeIds);
                    const isSelected = selectedOrderId === order.id;

                    return (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrderId(isSelected ? null : order.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10'
                            : 'bg-[#0f0f1a] border-[#2a2a45] hover:border-[#3a3a5a]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-200">{getCustomerName(order.customerId)}</span>
                          {needsCold && (
                            <span className="flex items-center gap-1 text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">
                              <Thermometer size={12} />
                              需冷链
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mb-1">{getRecipeNames(order.recipeIds)}</div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono-data text-xs text-slate-400">{order.portions} 份</span>
                          <span className="font-mono-data text-xs text-slate-500">
                            占用 {Math.round(order.portions / 10)} 容量
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedOrderId && (
                <div className="mt-3 p-2 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-amber-400 flex items-center gap-2">
                  <ChevronRight size={14} />
                  请点击左侧车辆完成分配
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <MapPin size={20} className="text-amber-400" />
          路线规划
        </h2>

        {vehicles.every(v => v.route.length === 0) ? (
          <div className="card text-center py-8 text-slate-500">
            分配订单后可进行路线规划
          </div>
        ) : (
          <div className="space-y-4">
            {vehicles.filter(v => v.route.length > 0).map(vehicle => (
              <div key={vehicle.id} className="card animate-slide-in">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Truck size={16} className={vehicle.type === 'cold_chain' ? 'text-blue-400' : 'text-slate-400'} />
                    <span className="font-bold text-slate-200">{vehicle.name}</span>
                    <span className="font-mono-data text-xs text-slate-500">路线规划</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <MapPin size={12} />
                    <span className="font-mono-data">{vehicle.route.length} 站</span>
                    <span className="mx-1">·</span>
                    <span className="font-mono-data">约 {vehicle.route.length * 5} km</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-2">
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <div className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-400">
                      中心厨房
                    </div>
                  </div>

                  {vehicle.route.map((customerId, idx) => {
                    const customer = customers.find(c => c.id === customerId);
                    return (
                      <div key={customerId} className="flex items-center gap-1 flex-shrink-0">
                        <ArrowRight size={16} className="text-slate-600 flex-shrink-0" />
                        <div className="flex flex-col items-center gap-1">
                          <div className="px-3 py-2 rounded-lg bg-[#0f0f1a] border border-[#2a2a45] text-xs text-slate-200 min-w-[80px] text-center">
                            {customer?.name ?? '未知'}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleMoveRouteStop(vehicle.id, idx, 'up')}
                              disabled={idx === 0}
                              className="p-0.5 rounded bg-[#2a2a45] hover:bg-[#3a3a5a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              <ArrowUp size={10} className="text-slate-300" />
                            </button>
                            <button
                              onClick={() => handleMoveRouteStop(vehicle.id, idx, 'down')}
                              disabled={idx === vehicle.route.length - 1}
                              className="p-0.5 rounded bg-[#2a2a45] hover:bg-[#3a3a5a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              <ArrowDown size={10} className="text-slate-300" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <ArrowRight size={16} className="text-slate-600 flex-shrink-0" />
                    <div className="px-3 py-2 rounded-lg bg-slate-500/10 border border-slate-500/30 text-xs text-slate-400">
                      返回
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {validationErrors.length > 0 && (
        <div className="card border-red-500/30 animate-slide-in">
          <div className="flex items-start gap-2">
            <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              {validationErrors.map((err, idx) => (
                <div key={idx} className="text-sm text-red-400">{err}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button onClick={handleConfirm} className="btn-success flex items-center gap-2">
          确认装载出发
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
