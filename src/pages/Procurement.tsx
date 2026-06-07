import { useMemo } from 'react';
import { ShoppingCart, Star, DollarSign, Truck, Package, CheckCircle2, AlertCircle } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

const CATEGORY_TO_SUPPLIER: Record<string, string> = {
  rice: 'grain_oil',
  flour: 'grain_oil',
  egg: 'grain_oil',
  tomato: 'vegetable_fruit',
  potato: 'vegetable_fruit',
  vegetable: 'vegetable_fruit',
  tofu: 'vegetable_fruit',
  chicken: 'meat',
  pork: 'meat',
  fish: 'seafood',
  seafood: 'seafood',
  seasoning: 'seasoning',
};

const STORAGE_LABEL: Record<string, string> = {
  cold: '冷藏',
  frozen: '冷冻',
  ambient: '常温',
};

const STORAGE_COLOR: Record<string, string> = {
  cold: 'text-blue-400 bg-blue-400/10',
  frozen: 'text-cyan-400 bg-cyan-400/10',
  ambient: 'text-amber-400 bg-amber-400/10',
};

function ReputationStars({ value }: { value: number }) {
  return (
    <span className="font-mono-data text-sm">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < value ? 'text-amber-400' : 'text-slate-600'}>★</span>
      ))}
    </span>
  );
}

export default function Procurement() {
  const {
    ingredients,
    suppliers,
    funds,
    currentDay,
    selectSupplier,
    confirmProcurement,
    nextPhase,
  } = useGameStore();

  const ingredientsWithSuppliers = useMemo(() => {
    return ingredients.map(ing => {
      const supplierCategory = CATEGORY_TO_SUPPLIER[ing.category] || 'seasoning';
      const matchedSuppliers = suppliers.filter(
        s => s.category === supplierCategory && s.available
      );
      return { ingredient: ing, matchedSuppliers };
    });
  }, [ingredients, suppliers]);

  const allSelected = ingredientsWithSuppliers.every(
    ({ ingredient }) => ingredient.supplierId
  );

  const totalCost = useMemo(() => {
    return ingredients.reduce((sum, ing) => {
      const supplier = suppliers.find(s => s.id === ing.supplierId);
      if (supplier) return sum + ing.quantity * supplier.pricePerUnit;
      return sum;
    }, 0);
  }, [ingredients, suppliers]);

  const remainingFunds = funds - totalCost;

  const selectedCount = ingredients.filter(i => i.supplierId).length;

  function handleConfirm() {
    if (!allSelected) return;
    confirmProcurement();
    nextPhase();
  }

  return (
    <div className="animate-slide-in space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingCart size={28} className="text-amber-400" />
          <div>
            <h1 className="text-2xl font-bold text-slate-100">采购谈判</h1>
            <p className="text-sm text-slate-400">为每种原料选择最优供应商</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-[#1e1e32] border border-[#2a2a45] rounded-lg px-4 py-2">
          <span className="text-xs text-slate-500">当前</span>
          <span className="font-mono-data text-amber-400 font-bold">第 {currentDay} 天</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          {ingredientsWithSuppliers.map(({ ingredient, matchedSuppliers }) => {
            const selectedSupplier = suppliers.find(s => s.id === ingredient.supplierId);
            const minPrice = Math.min(...matchedSuppliers.map(s => s.pricePerUnit));

            return (
              <div key={ingredient.id} className="card animate-slide-in">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Package size={18} className="text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100">{ingredient.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500">{ingredient.category}</span>
                        <span className="text-slate-600">·</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${STORAGE_COLOR[ingredient.storageType]}`}>
                          {STORAGE_LABEL[ingredient.storageType]}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono-data text-lg text-slate-100">
                      {ingredient.quantity}
                      <span className="text-xs text-slate-500 ml-1">份</span>
                    </div>
                    <div className="text-xs text-slate-500">需求量</div>
                  </div>
                </div>

                <div className="border-t border-[#2a2a45] pt-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {matchedSuppliers.map(supplier => {
                      const isSelected = ingredient.supplierId === supplier.id;
                      const isLowest = supplier.pricePerUnit === minPrice;

                      return (
                        <button
                          key={supplier.id}
                          onClick={() => selectSupplier(ingredient.id, supplier.id)}
                          className={`
                            relative text-left p-3 rounded-lg border transition-all duration-200
                            ${isSelected
                              ? 'border-amber-500/60 bg-amber-500/5 shadow-md shadow-amber-500/10'
                              : 'border-[#2a2a45] bg-[#14142a] hover:border-[#3a3a5a] hover:bg-[#1a1a30]'
                            }
                          `}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2">
                              <CheckCircle2 size={16} className="text-amber-400" />
                            </div>
                          )}
                          <div className="font-medium text-sm text-slate-200 mb-2">
                            {supplier.name}
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1 text-xs text-slate-500">
                                <DollarSign size={12} />
                                单价
                              </span>
                              <span className={`font-mono-data text-sm font-bold ${isLowest ? 'text-emerald-400' : 'text-slate-300'}`}>
                                ¥{supplier.pricePerUnit}
                                {isLowest && <span className="text-xs ml-1 text-emerald-400">最低</span>}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1 text-xs text-slate-500">
                                <Truck size={12} />
                                交货
                              </span>
                              <span className="font-mono-data text-sm text-slate-300">
                                {supplier.deliveryDays}天
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1 text-xs text-slate-500">
                                <Star size={12} />
                                信誉
                              </span>
                              <ReputationStars value={supplier.reputation} />
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-[#2a2a45]">
                              <span className="text-xs text-slate-500">小计</span>
                              <span className="font-mono-data text-sm font-bold text-amber-400">
                                ¥{(ingredient.quantity * supplier.pricePerUnit).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="xl:col-span-1">
          <div className="sticky top-0 space-y-4">
            <div className="card">
              <h3 className="font-bold text-slate-100 mb-4 flex items-center gap-2">
                <ShoppingCart size={16} className="text-amber-400" />
                采购总览
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">原料总数</span>
                  <span className="font-mono-data text-slate-200">{ingredients.length} 种</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">已选供应商</span>
                  <span className={`font-mono-data ${selectedCount === ingredients.length ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {selectedCount} / {ingredients.length}
                  </span>
                </div>
                <div className="border-t border-[#2a2a45] pt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-400">采购总额</span>
                    <span className="font-mono-data text-lg font-bold text-amber-400">
                      ¥{totalCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">当前资金</span>
                    <span className="font-mono-data text-slate-200">
                      ¥{funds.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="border-t border-[#2a2a45] pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">采购后余额</span>
                    <span className={`font-mono-data text-lg font-bold ${remainingFunds >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      ¥{remainingFunds.toLocaleString()}
                    </span>
                  </div>
                  {remainingFunds < 0 && (
                    <div className="flex items-center gap-1.5 mt-2 text-red-400 text-xs">
                      <AlertCircle size={14} />
                      资金不足，请重新选择供应商
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="font-bold text-slate-100 mb-3 text-sm">已选供应商明细</h3>
              {ingredientsWithSuppliers
                .filter(({ ingredient }) => ingredient.supplierId)
                .map(({ ingredient }) => {
                  const supplier = suppliers.find(s => s.id === ingredient.supplierId);
                  if (!supplier) return null;
                  return (
                    <div
                      key={ingredient.id}
                      className="flex items-center justify-between py-1.5 border-b border-[#2a2a45] last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-300">{ingredient.name}</span>
                        <span className="text-xs text-slate-500">×{ingredient.quantity}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500">{supplier.name}</div>
                        <div className="font-mono-data text-xs text-amber-400">
                          ¥{(ingredient.quantity * supplier.pricePerUnit).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            <button
              onClick={handleConfirm}
              disabled={!allSelected || remainingFunds < 0}
              className={`
                w-full btn-primary flex items-center justify-center gap-2 text-lg py-3
                ${(!allSelected || remainingFunds < 0) ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
              `}
            >
              <CheckCircle2 size={20} />
              确认采购
            </button>

            {!allSelected && (
              <p className="text-center text-xs text-slate-500">
                请为所有原料选择供应商后确认
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
