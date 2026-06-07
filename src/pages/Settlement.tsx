import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import RadarChart from '@/components/RadarChart';
import {
  BarChart3, TrendingUp, DollarSign, Users,
  Package, Trophy, Skull, ArrowRight,
  CheckCircle, AlertTriangle, Sparkles,
  ShoppingCart, UtensilsCrossed, Truck, ArrowLeftRight,
} from 'lucide-react';

function metricColor(value: number): string {
  if (value >= 70) return 'text-emerald-400';
  if (value >= 50) return 'text-amber-400';
  return 'text-red-400';
}

function metricRingColor(value: number): string {
  if (value >= 70) return '#10b981';
  if (value >= 50) return '#f59e0b';
  return '#ef4444';
}

function metricBg(value: number): string {
  if (value >= 70) return 'bg-emerald-500/10 border-emerald-500/30';
  if (value >= 50) return 'bg-amber-500/10 border-amber-500/30';
  return 'bg-red-500/10 border-red-500/30';
}

const CUSTOMER_TYPE_LABEL: Record<string, string> = {
  school: '学校',
  hospital: '医院',
  enterprise: '企业',
};

export default function Settlement() {
  const navigate = useNavigate();
  const {
    currentDay, totalDays, satisfaction, wasteRate, onTimeRate, profit,
    todayRevenue, todayCost, customers, completedEvents,
    gameOver, gameWon, multiWarehouseUnlocked, challengeMode,
    lastSettlement, calculateSettlement, nextDay, startChallenge,
  } = useGameStore();

  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (!settled) {
      calculateSettlement();
      setSettled(true);
    }
  }, [settled, calculateSettlement]);

  const displayRevenue = lastSettlement?.revenue ?? todayRevenue;
  const displayCost = lastSettlement?.cost ?? todayCost;
  const displayProfit = lastSettlement?.profit ?? (todayRevenue - todayCost);

  const radarData = useMemo(() => {
    const profitNorm = Math.min(100, Math.max(0, (profit / 5000) * 50 + 50));
    return [
      { label: '满意度', value: satisfaction },
      { label: '有效率', value: 100 - wasteRate },
      { label: '准时率', value: onTimeRate },
      { label: '盈利力', value: profitNorm },
    ];
  }, [satisfaction, wasteRate, onTimeRate, profit]);

  const baseRate = useMemo(() => {
    if (!lastSettlement?.deliveryResults.length) return onTimeRate;
    const onTimeCount = lastSettlement.deliveryResults.filter(r => r.onTime).length;
    return Math.round((onTimeCount / lastSettlement.deliveryResults.length) * 100);
  }, [lastSettlement, onTimeRate]);

  const penaltyPercent = lastSettlement?.onTimePenalty ?? 0;

  function handleNextDay() {
    nextDay();
    if (currentDay < totalDays) {
      navigate('/procurement');
    }
  }

  function handleStartChallenge() {
    startChallenge();
    navigate('/procurement');
  }

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 size={28} className="text-amber-400" />
          <h1 className="text-2xl font-bold text-slate-100">经营结算</h1>
          <span className="font-mono-data text-sm text-slate-400 bg-[#1e1e32] px-3 py-1 rounded-lg border border-[#2a2a45]">
            第 {currentDay} 天
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card animate-slide-in">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <TrendingUp size={18} className="text-emerald-400" />
            </div>
            <span className="text-sm text-slate-400">营业收入</span>
          </div>
          <div className={`font-mono-data text-3xl font-bold animate-count-up ${displayRevenue > 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
            ¥{displayRevenue.toLocaleString()}
          </div>
        </div>

        <div className="card animate-slide-in">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <DollarSign size={18} className="text-red-400" />
            </div>
            <span className="text-sm text-slate-400">运营成本</span>
          </div>
          <div className="font-mono-data text-3xl font-bold text-red-400 animate-count-up">
            ¥{displayCost.toLocaleString()}
          </div>
        </div>

        <div className="card animate-slide-in">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${displayProfit >= 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
              <Package size={18} className={displayProfit >= 0 ? 'text-emerald-400' : 'text-red-400'} />
            </div>
            <span className="text-sm text-slate-400">净利润</span>
          </div>
          <div className={`font-mono-data text-3xl font-bold animate-count-up ${displayProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ¥{displayProfit.toLocaleString()}
          </div>
        </div>
      </div>

      {lastSettlement && (
        <div>
          <h2 className="text-lg font-bold text-slate-200 mb-3 flex items-center gap-2">
            <DollarSign size={18} className="text-amber-400" />
            成本明细
          </h2>
          <div className="card">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-3 bg-[#14142a] rounded-lg p-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <ShoppingCart size={16} className="text-emerald-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-slate-500">采购成本</div>
                  <div className="font-mono-data text-sm font-bold text-slate-200">¥{lastSettlement.costBreakdown.procurement.toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#14142a] rounded-lg p-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                  <UtensilsCrossed size={16} className="text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-slate-500">菜单排产</div>
                  <div className="font-mono-data text-sm font-bold text-slate-200">¥{lastSettlement.costBreakdown.menu.toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#14142a] rounded-lg p-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <AlertTriangle size={16} className="text-amber-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-slate-500">事件处理</div>
                  <div className="font-mono-data text-sm font-bold text-slate-200">¥{lastSettlement.costBreakdown.events.toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#14142a] rounded-lg p-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center">
                  <Truck size={16} className="text-violet-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-slate-500">车辆租赁</div>
                  <div className="font-mono-data text-sm font-bold text-slate-200">¥{lastSettlement.costBreakdown.rental.toLocaleString()}</div>
                </div>
              </div>
              {lastSettlement.costBreakdown.transfer > 0 && (
                <div className="flex items-center gap-3 bg-[#14142a] rounded-lg p-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                    <ArrowLeftRight size={16} className="text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-slate-500">跨仓调拨</div>
                    <div className="font-mono-data text-sm font-bold text-amber-400">¥{lastSettlement.costBreakdown.transfer.toLocaleString()}</div>
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-[#2a2a45] pt-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">合计</span>
                <span className="font-mono-data text-lg font-bold text-red-400">¥{lastSettlement.cost.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-slate-500">收入</span>
                  <span className="font-mono-data text-emerald-400">¥{lastSettlement.revenue.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500">净利</span>
                  <span className={`font-mono-data font-bold ${lastSettlement.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    ¥{lastSettlement.profit.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold text-slate-200 mb-3 flex items-center gap-2">
          <BarChart3 size={18} className="text-amber-400" />
          核心指标
        </h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="card flex flex-col items-center py-5 animate-slide-in">
            <div className="relative w-20 h-20 mb-3">
              <svg width={80} height={80} className="-rotate-90">
                <circle cx={40} cy={40} r={34} fill="none" stroke="#2a2a45" strokeWidth={6} />
                <circle
                  cx={40} cy={40} r={34} fill="none"
                  stroke={metricRingColor(satisfaction)}
                  strokeWidth={6}
                  strokeDasharray={34 * 2 * Math.PI}
                  strokeDashoffset={34 * 2 * Math.PI * (1 - satisfaction / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`font-mono-data text-sm font-bold ${metricColor(satisfaction)}`}>
                  {satisfaction}%
                </span>
              </div>
            </div>
            <span className="text-sm text-slate-400">客户满意度</span>
          </div>

          <div className="card flex flex-col items-center py-5 animate-slide-in">
            <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center mb-3 ${metricBg(100 - wasteRate)}`}>
              <span className={`font-mono-data text-xl font-bold ${metricColor(100 - wasteRate)}`}>
                {wasteRate}%
              </span>
            </div>
            <span className="text-sm text-slate-400">食材损耗率</span>
            <span className="text-xs text-slate-500 mt-1">越低越好</span>
          </div>

          <div className="card flex flex-col items-center py-5 animate-slide-in">
            <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center mb-3 ${metricBg(onTimeRate)}`}>
              <span className={`font-mono-data text-xl font-bold ${metricColor(onTimeRate)}`}>
                {onTimeRate}%
              </span>
            </div>
            <span className="text-sm text-slate-400">准时交付率</span>
            <span className="text-xs text-slate-500 mt-1">
              配送率 {baseRate}% - 事件惩罚 {penaltyPercent * 10}%
            </span>
          </div>

          <div className="card flex flex-col items-center py-5 animate-slide-in">
            <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center mb-3 ${profit >= 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
              <span className={`font-mono-data text-lg font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {profit >= 0 ? '+' : ''}{(profit / 1000).toFixed(1)}k
              </span>
            </div>
            <span className="text-sm text-slate-400">累计利润</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-bold text-slate-200 mb-3 flex items-center gap-2">
            <BarChart3 size={18} className="text-amber-400" />
            能力雷达
          </h2>
          <div className="card flex items-center justify-center py-6">
            <RadarChart data={radarData} size={280} />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-200 mb-3 flex items-center gap-2">
            <Users size={18} className="text-amber-400" />
            客户满意度明细
          </h2>
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2a45]">
                  <th className="text-left text-slate-500 font-medium px-4 py-3">客户</th>
                  <th className="text-left text-slate-500 font-medium px-4 py-3">类型</th>
                  <th className="text-left text-slate-500 font-medium px-4 py-3">位置</th>
                  <th className="text-right text-slate-500 font-medium px-4 py-3">满意度</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id} className="border-b border-[#2a2a45]/50 hover:bg-[#2a2a45]/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-slate-200 font-medium">{c.name}</span>
                        {c.consecutiveDelays > 0 && (
                          <span className="text-xs text-red-400 mt-0.5">连续延误 x{c.consecutiveDelays}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{CUSTOMER_TYPE_LABEL[c.type] ?? c.type}</td>
                    <td className="px-4 py-3 text-slate-400">{c.location}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-mono-data font-bold ${metricColor(c.satisfaction)}`}>
                        {c.satisfaction}%
                      </span>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">暂无客户数据</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {lastSettlement && lastSettlement.deliveryResults.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-slate-200 mb-3 flex items-center gap-2">
            <Truck size={18} className="text-amber-400" />
            配送结果
          </h2>
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2a45]">
                  <th className="text-left text-slate-500 font-medium px-4 py-3">客户</th>
                  <th className="text-center text-slate-500 font-medium px-4 py-3">状态</th>
                  <th className="text-left text-slate-500 font-medium px-4 py-3">延误原因</th>
                  <th className="text-right text-slate-500 font-medium px-4 py-3">距离</th>
                  <th className="text-center text-slate-500 font-medium px-4 py-3">标签</th>
                </tr>
              </thead>
              <tbody>
                {lastSettlement.deliveryResults.map(r => (
                  <tr key={r.customerId} className="border-b border-[#2a2a45]/50 hover:bg-[#2a2a45]/20 transition-colors">
                    <td className="px-4 py-3 text-slate-200 font-medium">{r.customerName}</td>
                    <td className="px-4 py-3 text-center">
                      {r.onTime ? (
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">准点</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30">延误</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs max-w-[200px] truncate">
                      {r.delayReason ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono-data text-slate-400">{r.distance}km</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        {r.crossWarehouse && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">跨仓</span>
                        )}
                        {r.isRented && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">租赁车</span>
                        )}
                        {r.vehicleType === 'cold_chain' && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">冷链</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold text-slate-200 mb-3 flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-400" />
          事件影响
        </h2>
        <div className="card">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2 bg-[#14142a] rounded-lg px-4 py-2">
              <span className="text-xs text-slate-500">满意度变化</span>
              <span className={`font-mono-data text-sm font-bold ${(lastSettlement?.satisfactionChange ?? 0) > 0 ? 'text-red-400' : (lastSettlement?.satisfactionChange ?? 0) < 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                {(lastSettlement?.satisfactionChange ?? 0) > 0 ? `扣${lastSettlement!.satisfactionChange}` : (lastSettlement?.satisfactionChange ?? 0) < 0 ? `+${Math.abs(lastSettlement!.satisfactionChange)}` : '无变化'}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-[#14142a] rounded-lg px-4 py-2">
              <span className="text-xs text-slate-500">准时惩罚</span>
              <span className={`font-mono-data text-sm font-bold ${(lastSettlement?.onTimePenalty ?? 0) > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                {(lastSettlement?.onTimePenalty ?? 0) > 0 ? `扣${lastSettlement!.onTimePenalty * 10}%` : '无'}
              </span>
            </div>
          </div>
          {completedEvents.length > 0 && (
            <div className="space-y-3 border-t border-[#2a2a45] pt-4">
              {completedEvents.map(ev => (
                <div key={ev.id} className="animate-slide-in border-amber-500/20">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <AlertTriangle size={16} className="text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-slate-200">{ev.title}</h4>
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">已解决</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{ev.description}</p>
                      {ev.selectedOption !== undefined && ev.options[ev.selectedOption] && (
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-2 text-slate-500">
                            <CheckCircle size={12} className="text-emerald-400" />
                            <span>选择方案：{ev.options[ev.selectedOption].label}</span>
                          </div>
                          <div className="flex items-center gap-3 ml-5">
                            {ev.options[ev.selectedOption].costPenalty > 0 && (
                              <span className="text-red-400/80">成本扣 ¥{ev.options[ev.selectedOption].costPenalty.toLocaleString()}</span>
                            )}
                            {ev.options[ev.selectedOption].satisfactionPenalty > 0 && (
                              <span className="text-red-400/80">满意度扣 {ev.options[ev.selectedOption].satisfactionPenalty}</span>
                            )}
                            {ev.options[ev.selectedOption].timePenalty > 0 && (
                              <span className="text-amber-400/80">准点惩罚 {ev.options[ev.selectedOption].timePenalty}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {completedEvents.length === 0 && (
            <div className="text-sm text-slate-500 text-center py-2">今日无突发事件</div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-2 pb-4">
        {currentDay < totalDays ? (
          <button onClick={handleNextDay} className="btn-primary flex items-center gap-2 text-base px-8 py-3">
            进入第 {currentDay + 1} 天
            <ArrowRight size={20} />
          </button>
        ) : (
          <button onClick={handleNextDay} className="btn-success flex items-center gap-2 text-base px-8 py-3">
            查看最终结果
            <Trophy size={20} />
          </button>
        )}
      </div>

      {gameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="card max-w-lg w-full mx-4 p-8 text-center animate-slide-in border-2 border-amber-500/30">
            {gameWon ? (
              <>
                <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center mx-auto mb-5">
                  <Trophy size={40} className="text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-amber-400 mb-2">
                  {challengeMode ? '挑战完成！' : '经营成功！'}
                </h2>
                <p className="text-slate-400 mb-5">
                  {challengeMode
                    ? '恭喜你完成了多仓配送挑战！'
                    : `恭喜你完成了 ${totalDays} 天的城市中央厨房运营挑战！`}
                </p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-[#14142a] rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">客户满意度</div>
                    <div className={`font-mono-data text-xl font-bold ${metricColor(satisfaction)}`}>{satisfaction}%</div>
                  </div>
                  <div className="bg-[#14142a] rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">准时交付率</div>
                    <div className={`font-mono-data text-xl font-bold ${metricColor(onTimeRate)}`}>{onTimeRate}%</div>
                  </div>
                  <div className="bg-[#14142a] rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">累计利润</div>
                    <div className={`font-mono-data text-xl font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      ¥{profit.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-[#14142a] rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">食材损耗率</div>
                    <div className={`font-mono-data text-xl font-bold ${metricColor(100 - wasteRate)}`}>{wasteRate}%</div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => navigate('/')} className="btn-primary px-8 py-3">
                    返回首页
                  </button>
                  {multiWarehouseUnlocked && !challengeMode && (
                    <button onClick={handleStartChallenge} className="flex items-center gap-2 px-6 py-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold hover:bg-amber-500/20 transition-colors">
                      <Sparkles size={18} />
                      开始多仓配送挑战
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/40 flex items-center justify-center mx-auto mb-5">
                  <Skull size={40} className="text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-red-400 mb-2">经营失败</h2>
                <p className="text-slate-400 mb-4">很遗憾，你的经营未能达到目标要求。</p>
                <div className="space-y-2 text-left text-sm text-slate-400 bg-[#14142a] rounded-lg p-4 mb-6">
                  {satisfaction < 60 && (
                    <div className="flex items-center gap-2">
                      <span className="text-red-400">✗</span>
                      <span>客户满意度需达到 60% 以上（当前 {satisfaction}%）</span>
                    </div>
                  )}
                  {onTimeRate < 70 && (
                    <div className="flex items-center gap-2">
                      <span className="text-red-400">✗</span>
                      <span>准时交付率需达到 70% 以上（当前 {onTimeRate}%）</span>
                    </div>
                  )}
                  {useGameStore.getState().funds <= 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-red-400">✗</span>
                      <span>资金已耗尽，需保持正现金流</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2 text-left text-xs text-slate-500 bg-[#14142a] rounded-lg p-4 mb-6">
                  <div className="font-medium text-slate-400 mb-1">改进建议：</div>
                  <div>• 合理选择供应商，平衡价格与品质</div>
                  <div>• 严格质检，避免劣质原料影响客户满意度</div>
                  <div>• 优化配送路线，提升准时交付率</div>
                  <div>• 控制运营成本，确保盈利</div>
                </div>
                <button onClick={() => navigate('/')} className="btn-primary px-8 py-3">
                  返回首页
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
