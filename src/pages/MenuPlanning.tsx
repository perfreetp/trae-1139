import { useState, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { cn } from '@/lib/utils';
import type { CustomerType } from '@/types';
import {
  UtensilsCrossed, Heart, DollarSign, BookOpen,
  GraduationCap, Hospital, Building2, Users,
  AlertTriangle, CheckCircle2, ArrowRight, X,
  ChefHat, Target, Scale,
} from 'lucide-react';

const TYPE_CONFIG: Record<CustomerType, { label: string; icon: React.ReactNode; color: string; bg: string; border: string }> = {
  school: {
    label: '学校',
    icon: <GraduationCap size={18} />,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  hospital: {
    label: '医院',
    icon: <Hospital size={18} />,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
  },
  enterprise: {
    label: '企业',
    icon: <Building2 size={18} />,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
  },
};

const TARGET_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  school: { label: '学校', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  hospital: { label: '医院', color: 'text-rose-400', bg: 'bg-rose-500/20' },
  enterprise: { label: '企业', color: 'text-violet-400', bg: 'bg-violet-500/20' },
  all: { label: '通用', color: 'text-amber-400', bg: 'bg-amber-500/20' },
};

function nutritionColor(score: number): string {
  if (score >= 70) return 'text-emerald-400';
  if (score >= 50) return 'text-amber-400';
  return 'text-red-400';
}

function nutritionBg(score: number): string {
  if (score >= 70) return 'bg-emerald-500/10 border-emerald-500/30';
  if (score >= 50) return 'bg-amber-500/10 border-amber-500/30';
  return 'bg-red-500/10 border-red-500/30';
}

export default function MenuPlanning() {
  const { recipes, customers, ingredients, currentDay, totalDays, funds, assignRecipeToCustomer, nextPhase } = useGameStore();

  const [assignments, setAssignments] = useState<Record<string, string[]>>({});
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [filterTarget, setFilterTarget] = useState<'all' | CustomerType>('all');

  const customersByType = useMemo(() => {
    const map: Record<CustomerType, typeof customers> = { school: [], hospital: [], enterprise: [] };
    customers.forEach(c => map[c.type].push(c));
    return map;
  }, [customers]);

  const filteredRecipes = useMemo(() => {
    if (filterTarget === 'all') return recipes;
    return recipes.filter(r => r.targetCustomer === filterTarget || r.targetCustomer === 'all');
  }, [recipes, filterTarget]);

  const availableIngredients = useMemo(
    () => ingredients.filter(i => i.inspectionResult === 'passed' && i.slotId),
    [ingredients],
  );

  const availableByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    availableIngredients.forEach(i => {
      map[i.category] = (map[i.category] ?? 0) + i.quantity;
    });
    return map;
  }, [availableIngredients]);

  const requiredByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    Object.entries(assignments).forEach(([customerId, recipeIds]) => {
      const customer = customers.find(c => c.id === customerId);
      if (!customer) return;
      const portionFactor = customer.dailyOrderSize / 100;
      recipeIds.forEach(rid => {
        const recipe = recipes.find(r => r.id === rid);
        if (!recipe) return;
        recipe.requiredIngredients.forEach(ri => {
          map[ri.ingredientCategory] = (map[ri.ingredientCategory] ?? 0) + ri.quantity * portionFactor;
        });
      });
    });
    return map;
  }, [assignments, customers, recipes]);

  const shortageCategories = useMemo(() => {
    const shortages: { category: string; required: number; available: number }[] = [];
    Object.entries(requiredByCategory).forEach(([cat, req]) => {
      const avail = availableByCategory[cat] ?? 0;
      if (req > avail) {
        shortages.push({ category: cat, required: Math.round(req), available: Math.round(avail) });
      }
    });
    return shortages;
  }, [requiredByCategory, availableByCategory]);

  const totalCost = useMemo(() => {
    let cost = 0;
    Object.entries(assignments).forEach(([customerId, recipeIds]) => {
      const customer = customers.find(c => c.id === customerId);
      if (!customer) return;
      const portionFactor = customer.dailyOrderSize / 100;
      recipeIds.forEach(rid => {
        const recipe = recipes.find(r => r.id === rid);
        if (recipe) cost += recipe.cost * portionFactor;
      });
    });
    return Math.round(cost);
  }, [assignments, customers, recipes]);

  const avgNutrition = useMemo(() => {
    const scores: number[] = [];
    Object.values(assignments).forEach(recipeIds => {
      if (recipeIds.length === 0) return;
      const sum = recipeIds.reduce((s, rid) => {
        const r = recipes.find(x => x.id === rid);
        return s + (r?.nutritionScore ?? 0);
      }, 0);
      scores.push(sum / recipeIds.length);
    });
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [assignments, recipes]);

  const allAssigned = customers.every(c => (assignments[c.id]?.length ?? 0) > 0);

  function handleRecipeClick(recipeId: string) {
    setSelectedRecipeId(prev => (prev === recipeId ? null : recipeId));
  }

  function handleCustomerClick(customerId: string) {
    if (!selectedRecipeId) return;
    const recipe = recipes.find(r => r.id === selectedRecipeId);
    if (!recipe) return;
    if (recipe.targetCustomer !== 'all') {
      const customer = customers.find(c => c.id === customerId);
      if (customer && customer.type !== recipe.targetCustomer) return;
    }
    setAssignments(prev => {
      const current = prev[customerId] ?? [];
      if (current.includes(selectedRecipeId)) return prev;
      return { ...prev, [customerId]: [...current, selectedRecipeId] };
    });
    setSelectedRecipeId(null);
  }

  function handleRemoveRecipe(customerId: string, recipeId: string) {
    setAssignments(prev => ({
      ...prev,
      [customerId]: (prev[customerId] ?? []).filter(id => id !== recipeId),
    }));
  }

  function handleConfirm() {
    Object.entries(assignments).forEach(([customerId, recipeIds]) => {
      if (recipeIds.length > 0) {
        assignRecipeToCustomer(customerId, recipeIds);
      }
    });
    nextPhase();
  }

  function getCustomerTotalNutrition(customerId: string): number {
    const ids = assignments[customerId] ?? [];
    if (ids.length === 0) return 0;
    const sum = ids.reduce((s, rid) => s + (recipes.find(r => r.id === rid)?.nutritionScore ?? 0), 0);
    return Math.round(sum / ids.length);
  }

  function getCustomerTotalCost(customerId: string): number {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return 0;
    const ids = assignments[customerId] ?? [];
    const portionFactor = customer.dailyOrderSize / 100;
    return Math.round(ids.reduce((s, rid) => s + (recipes.find(r => r.id === rid)?.cost ?? 0) * portionFactor, 0));
  }

  return (
    <div className="space-y-5 animate-slide-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UtensilsCrossed size={28} className="text-amber-400" />
          <div>
            <h1 className="text-2xl font-bold text-slate-100">菜单排产</h1>
            <p className="text-sm text-slate-500">
              第 <span className="font-mono-data text-amber-400">{currentDay}</span> / {totalDays} 天
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-5 text-sm">
            <div className="flex items-center gap-1.5">
              <Heart size={14} className="text-rose-400" />
              <span className="text-slate-400">平均营养</span>
              <span className={cn('font-mono-data font-bold', nutritionColor(avgNutrition))}>{avgNutrition}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign size={14} className="text-amber-400" />
              <span className="text-slate-400">总成本</span>
              <span className={cn('font-mono-data font-bold', totalCost > funds ? 'text-red-400' : 'text-amber-400')}>
                ¥{totalCost.toLocaleString()}
              </span>
              <span className="text-slate-600">/ ¥{funds.toLocaleString()}</span>
            </div>
          </div>
          <button
            onClick={handleConfirm}
            disabled={!allAssigned || shortageCategories.length > 0 || totalCost > funds}
            className={cn(
              'btn-success flex items-center gap-2',
              (!allAssigned || shortageCategories.length > 0 || totalCost > funds) && 'opacity-40 cursor-not-allowed hover:bg-emerald-600 hover:shadow-none active:scale-100',
            )}
          >
            确认排产
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {shortageCategories.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2 text-sm text-red-300">
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-medium">原料不足警告：</span>
            {shortageCategories.map(s => (
              <span key={s.category} className="ml-2">
                {s.category}（需 {s.required} / 有 {s.available}）
              </span>
            ))}
          </div>
        </div>
      )}

      {totalCost > funds && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-center gap-2 text-sm text-amber-300">
          <DollarSign size={16} className="flex-shrink-0" />
          <span>总成本 ¥{totalCost.toLocaleString()} 超出当前资金 ¥{funds.toLocaleString()}</span>
        </div>
      )}

      {selectedRecipeId && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-center gap-2 text-sm text-amber-300">
          <Target size={16} className="flex-shrink-0" />
          <span>
            已选择菜谱「{recipes.find(r => r.id === selectedRecipeId)?.name}」，点击客户列分配
          </span>
          <button onClick={() => setSelectedRecipeId(null)} className="ml-auto text-amber-400 hover:text-amber-300">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {(Object.keys(TYPE_CONFIG) as CustomerType[]).map(type => {
          const config = TYPE_CONFIG[type];
          const typeCustomers = customersByType[type];

          return (
            <div key={type} className="space-y-3">
              <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg border', config.bg, config.border)}>
                <span className={config.color}>{config.icon}</span>
                <span className={cn('font-semibold', config.color)}>{config.label}</span>
                <span className="font-mono-data text-xs text-slate-500">{typeCustomers.length} 家</span>
              </div>

              <div className="space-y-3">
                {typeCustomers.map(customer => {
                  const assigned = assignments[customer.id] ?? [];
                  const nutrition = getCustomerTotalNutrition(customer.id);
                  const cost = getCustomerTotalCost(customer.id);
                  const isTarget = selectedRecipeId && (() => {
                    const r = recipes.find(x => x.id === selectedRecipeId);
                    return r && (r.targetCustomer === 'all' || r.targetCustomer === type);
                  })();

                  return (
                    <div
                      key={customer.id}
                      onClick={() => handleCustomerClick(customer.id)}
                      className={cn(
                        'card transition-all duration-200',
                        isTarget && 'cursor-pointer hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/5',
                        assigned.length > 0 && 'border-emerald-500/20',
                      )}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-slate-400" />
                          <span className="font-medium text-slate-200">{customer.name}</span>
                        </div>
                        <span className="font-mono-data text-xs text-slate-500">
                          {customer.dailyOrderSize} 份/天
                        </span>
                      </div>

                      {assigned.length > 0 ? (
                        <div className="space-y-1.5 mb-3">
                          {assigned.map(rid => {
                            const recipe = recipes.find(r => r.id === rid);
                            if (!recipe) return null;
                            return (
                              <div
                                key={rid}
                                className="flex items-center justify-between bg-black/20 rounded-lg px-2.5 py-1.5"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <ChefHat size={12} className="text-amber-400 flex-shrink-0" />
                                  <span className="text-sm text-slate-300 truncate">{recipe.name}</span>
                                  <span className={cn('font-mono-data text-xs', nutritionColor(recipe.nutritionScore))}>
                                    {recipe.nutritionScore}
                                  </span>
                                </div>
                                <button
                                  onClick={e => { e.stopPropagation(); handleRemoveRecipe(customer.id, rid); }}
                                  className="text-red-400 hover:text-red-300 transition-colors p-0.5 flex-shrink-0"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-4 border border-dashed border-slate-600 rounded-lg mb-3">
                          <BookOpen size={20} className="mx-auto text-slate-600 mb-1" />
                          <div className="text-xs text-slate-500">点击菜谱后分配到此客户</div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-[#2a2a45]">
                        <div className="flex items-center gap-1.5">
                          <Heart size={12} className="text-rose-400" />
                          <span className="text-xs text-slate-500">营养</span>
                          <span className={cn('font-mono-data text-xs font-bold', assigned.length > 0 ? nutritionColor(nutrition) : 'text-slate-600')}>
                            {assigned.length > 0 ? nutrition : '--'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <DollarSign size={12} className="text-amber-400" />
                          <span className="text-xs text-slate-500">成本</span>
                          <span className={cn('font-mono-data text-xs font-bold', assigned.length > 0 ? 'text-amber-400' : 'text-slate-600')}>
                            {assigned.length > 0 ? `¥${cost}` : '--'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-amber-400" />
            <h2 className="text-lg font-semibold text-slate-200">菜谱库</h2>
            <span className="font-mono-data text-sm text-slate-500">{filteredRecipes.length} 道</span>
          </div>
          <div className="flex items-center gap-1">
            {(['all', 'school', 'hospital', 'enterprise'] as const).map(target => (
              <button
                key={target}
                onClick={() => setFilterTarget(target)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                  filterTarget === target
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#2a2a45] border border-transparent',
                )}
              >
                {target === 'all' ? '全部' : TYPE_CONFIG[target].label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredRecipes.map(recipe => {
            const isSelected = selectedRecipeId === recipe.id;
            const badge = TARGET_BADGE[recipe.targetCustomer];
            const assignedSomewhere = Object.values(assignments).some(ids => ids.includes(recipe.id));

            return (
              <div
                key={recipe.id}
                onClick={() => handleRecipeClick(recipe.id)}
                className={cn(
                  'card cursor-pointer transition-all duration-200',
                  isSelected && 'ring-2 ring-amber-400 ring-offset-2 ring-offset-[#0f0f1a] card-active',
                  assignedSomewhere && !isSelected && 'border-emerald-500/20',
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-200 truncate">{recipe.name}</span>
                  <span className={cn('text-xs px-1.5 py-0.5 rounded flex-shrink-0 ml-2', badge.bg, badge.color)}>
                    {badge.label}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <div className={cn('flex items-center gap-1 px-2 py-0.5 rounded border text-xs', nutritionBg(recipe.nutritionScore))}>
                    <Heart size={10} />
                    <span className={cn('font-mono-data font-bold', nutritionColor(recipe.nutritionScore))}>
                      {recipe.nutritionScore}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <DollarSign size={10} />
                    <span className="font-mono-data">¥{recipe.cost}</span>
                  </div>
                </div>

                <div className="space-y-0.5 mb-2">
                  {recipe.requiredIngredients.map((ri, idx) => {
                    const avail = availableByCategory[ri.ingredientCategory] ?? 0;
                    const isShort = avail < ri.quantity;
                    return (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">{ri.ingredientCategory}</span>
                        <span className={cn('font-mono-data', isShort ? 'text-red-400' : 'text-slate-400')}>
                          需{ri.quantity} / 有{Math.round(avail)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <p className="text-xs text-slate-500 line-clamp-2">{recipe.description}</p>
              </div>
            );
          })}
        </div>

        {filteredRecipes.length === 0 && (
          <div className="text-center py-10">
            <BookOpen size={40} className="mx-auto text-slate-600 mb-2" />
            <div className="text-slate-500">暂无匹配菜谱</div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-1.5">
            <Scale size={14} />
            <span>
              已分配客户：<span className={cn('font-mono-data font-bold', allAssigned ? 'text-emerald-400' : 'text-amber-400')}>
                {customers.filter(c => (assignments[c.id]?.length ?? 0) > 0).length}
              </span> / {customers.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>
              可用原料品类：<span className="font-mono-data text-slate-200">{Object.keys(availableByCategory).length}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
