import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import ProgressRing from '@/components/ProgressRing';
import RadarChart from '@/components/RadarChart';
import type { Phase } from '@/types';
import {
  Play, RotateCcw, TrendingUp, TrendingDown, Activity,
  ShoppingCart, ClipboardCheck, Warehouse, UtensilsCrossed,
  Truck, AlertTriangle, BarChart3, Trophy, Skull,
} from 'lucide-react';

const PHASE_CONFIG: { phase: Phase; label: string; icon: React.ReactNode; path: string }[] = [
  { phase: 'procurement', label: '采购谈判', icon: <ShoppingCart size={16} />, path: '/procurement' },
  { phase: 'inspection', label: '原料验收', icon: <ClipboardCheck size={16} />, path: '/inspection' },
  { phase: 'warehouse', label: '仓库存放', icon: <Warehouse size={16} />, path: '/warehouse' },
  { phase: 'menu', label: '菜单排产', icon: <UtensilsCrossed size={16} />, path: '/menu' },
  { phase: 'loading', label: '车辆装载', icon: <Truck size={16} />, path: '/loading' },
  { phase: 'emergency', label: '突发事件', icon: <AlertTriangle size={16} />, path: '/emergency' },
  { phase: 'settlement', label: '经营结算', icon: <BarChart3 size={16} />, path: '/settlement' },
];

function getMetricColor(value: number, inverse = false) {
  const v = inverse ? 100 - value : value;
  if (v >= 70) return '#10b981';
  if (v >= 50) return '#f59e0b';
  return '#ef4444';
}

function LandingPage() {
  const navigate = useNavigate();
  const startGame = useGameStore(s => s.startGame);

  const handleStart = () => {
    startGame();
    navigate('/procurement');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0" style={{ background: '#0f0f1a' }}>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(245,158,11,0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(245,158,11,0.08) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.3) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.5) 0%, transparent 60%)' }} />
      </div>

      <div className="relative z-10 text-center animate-fade-in">
        <div className="mb-6 animate-slide-in">
          <Activity size={48} className="mx-auto text-amber-500/60" />
        </div>

        <h1
          className="text-5xl md:text-6xl font-bold mb-4 animate-slide-in"
          style={{ animationDelay: '0.1s' }}
        >
          <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-400 bg-clip-text text-transparent">
            中央厨房 · 供应链调度
          </span>
        </h1>

        <p
          className="text-slate-400 text-lg md:text-xl mb-3 animate-slide-in max-w-xl mx-auto"
          style={{ animationDelay: '0.2s' }}
        >
          你是城市中央厨房的供应链调度员
        </p>
        <p
          className="text-slate-500 text-sm md:text-base mb-12 animate-slide-in max-w-lg mx-auto"
          style={{ animationDelay: '0.25s' }}
        >
          在 10 天内统筹采购、验收、仓储、排产、配送全流程，确保食品安全与客户满意
        </p>

        <div
          className="animate-slide-in"
          style={{ animationDelay: '0.35s' }}
        >
          <button
            onClick={handleStart}
            className="btn-primary text-lg px-10 py-4 rounded-xl animate-glow-pulse inline-flex items-center gap-3"
          >
            <Play size={22} />
            开始调度
          </button>
        </div>

        <div
          className="mt-16 flex items-center justify-center gap-8 text-slate-600 text-xs animate-fade-in"
          style={{ animationDelay: '0.6s' }}
        >
          <span className="flex items-center gap-1.5"><ShoppingCart size={14} /> 采购谈判</span>
          <span className="flex items-center gap-1.5"><ClipboardCheck size={14} /> 原料验收</span>
          <span className="flex items-center gap-1.5"><Warehouse size={14} /> 仓库存放</span>
          <span className="flex items-center gap-1.5"><UtensilsCrossed size={14} /> 菜单排产</span>
          <span className="flex items-center gap-1.5"><Truck size={14} /> 车辆装载</span>
          <span className="flex items-center gap-1.5"><BarChart3 size={14} /> 经营结算</span>
        </div>
      </div>
    </div>
  );
}

function DashboardPage() {
  const navigate = useNavigate();
  const {
    currentDay, totalDays, funds, satisfaction, wasteRate,
    onTimeRate, profit, currentPhase, completedPhases,
    activeEvents, daySummaries, gameOver, gameWon, resetGame,
  } = useGameStore();

  const currentPhaseConfig = PHASE_CONFIG.find(p => p.phase === currentPhase);
  const currentPhaseIdx = PHASE_CONFIG.findIndex(p => p.phase === currentPhase);

  const handleReset = () => {
    resetGame();
  };

  return (
    <div className="min-h-screen p-6 space-y-6 animate-fade-in" style={{ background: '#0f0f1a' }}>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            调度员，第 <span className="font-mono-data text-amber-400">{currentDay}</span> 天
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-slate-500">
              当前阶段：
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-amber-400 font-medium">
              {currentPhaseConfig?.icon}
              {currentPhaseConfig?.label}
            </span>
            {activeEvents.length > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                <AlertTriangle size={12} />
                {activeEvents.length} 个紧急事件
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-500">可用资金</div>
            <div className={`font-mono-data text-xl font-bold ${funds > 0 ? 'text-amber-400' : 'text-red-400'}`}>
              ¥{funds.toLocaleString()}
            </div>
          </div>
          <button onClick={handleReset} className="btn-secondary flex items-center gap-2 text-sm">
            <RotateCcw size={14} />
            重新开始
          </button>
        </div>
      </header>

      <div className="w-full bg-[#2a2a45] rounded-full h-2">
        <div
          className="bg-gradient-to-r from-amber-500 to-emerald-500 h-2 rounded-full transition-all duration-700"
          style={{ width: `${(currentDay / totalDays) * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card animate-slide-in" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">客户满意度</span>
            <Activity size={14} className="text-slate-500" />
          </div>
          <div className="flex items-center justify-center relative">
            <ProgressRing
              value={satisfaction}
              color={getMetricColor(satisfaction)}
              size={90}
              strokeWidth={7}
              label="满意度"
            />
          </div>
        </div>

        <div className="card animate-slide-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">损耗率</span>
            <TrendingDown size={14} className="text-slate-500" />
          </div>
          <div className="flex items-center justify-center relative">
            <ProgressRing
              value={100 - wasteRate}
              color={getMetricColor(wasteRate, true)}
              size={90}
              strokeWidth={7}
              label="有效率"
            />
          </div>
        </div>

        <div className="card animate-slide-in" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">准时交付率</span>
            <TrendingUp size={14} className="text-slate-500" />
          </div>
          <div className="flex items-center justify-center relative">
            <ProgressRing
              value={onTimeRate}
              color={getMetricColor(onTimeRate)}
              size={90}
              strokeWidth={7}
              label="准时率"
            />
          </div>
        </div>

        <div className="card animate-slide-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">利润趋势</span>
            {profit >= 0
              ? <TrendingUp size={14} className="text-emerald-400" />
              : <TrendingDown size={14} className="text-red-400" />
            }
          </div>
          <div className="flex flex-col items-center justify-center h-[90px]">
            <span className={`font-mono-data text-2xl font-bold animate-count-up ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {profit >= 0 ? '+' : ''}¥{profit.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 mt-1">累计利润</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card animate-slide-in" style={{ animationDelay: '0.25s' }}>
          <h3 className="text-sm font-medium text-slate-300 mb-4">综合能力雷达</h3>
          <div className="flex justify-center">
            <RadarChart
              data={[
                { label: '满意度', value: satisfaction },
                { label: '有效率', value: 100 - wasteRate },
                { label: '准时率', value: onTimeRate },
                { label: '盈利力', value: Math.max(0, Math.min(100, 50 + profit / 1000)) },
              ]}
              size={280}
            />
          </div>
        </div>

        <div className="card animate-slide-in" style={{ animationDelay: '0.3s' }}>
          <h3 className="text-sm font-medium text-slate-300 mb-4">快速操作</h3>
          <div className="space-y-2">
            {PHASE_CONFIG.map((config, idx) => {
              const isCompleted = completedPhases.includes(config.phase);
              const isCurrent = currentPhase === config.phase;
              const isAccessible = idx <= currentPhaseIdx || isCompleted;

              return (
                <button
                  key={config.phase}
                  onClick={() => isAccessible && navigate(config.path)}
                  disabled={!isAccessible}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-left
                    ${isCurrent
                      ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                      : isCompleted
                        ? 'bg-emerald-500/5 border border-emerald-500/20 text-slate-300'
                        : 'opacity-40 cursor-not-allowed text-slate-500'
                    }`}
                >
                  <span className={isCurrent ? 'text-amber-400' : isCompleted ? 'text-emerald-400' : 'text-slate-600'}>
                    {config.icon}
                  </span>
                  <span className="text-sm">{config.label}</span>
                  {isCompleted && <span className="ml-auto text-emerald-400 text-xs">✓</span>}
                  {isCurrent && !isCompleted && (
                    <span className="ml-auto w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {daySummaries.length > 0 && (
        <div className="card animate-slide-in" style={{ animationDelay: '0.35s' }}>
          <h3 className="text-sm font-medium text-slate-300 mb-4">历史日结</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2a45]">
                  <th className="text-left text-slate-500 font-medium py-2 px-3">天数</th>
                  <th className="text-right text-slate-500 font-medium py-2 px-3">满意度</th>
                  <th className="text-right text-slate-500 font-medium py-2 px-3">损耗率</th>
                  <th className="text-right text-slate-500 font-medium py-2 px-3">准时率</th>
                  <th className="text-right text-slate-500 font-medium py-2 px-3">收入</th>
                  <th className="text-right text-slate-500 font-medium py-2 px-3">成本</th>
                  <th className="text-right text-slate-500 font-medium py-2 px-3">利润</th>
                </tr>
              </thead>
              <tbody>
                {daySummaries.map((s) => (
                  <tr key={s.day} className="border-b border-[#2a2a45]/50 hover:bg-[#2a2a45]/30 transition-colors">
                    <td className="py-2 px-3 font-mono-data text-amber-400">第{s.day}天</td>
                    <td className={`py-2 px-3 text-right font-mono-data ${s.satisfaction >= 70 ? 'text-emerald-400' : s.satisfaction >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                      {s.satisfaction}%
                    </td>
                    <td className={`py-2 px-3 text-right font-mono-data ${s.wasteRate <= 20 ? 'text-emerald-400' : s.wasteRate <= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                      {s.wasteRate}%
                    </td>
                    <td className={`py-2 px-3 text-right font-mono-data ${s.onTimeRate >= 70 ? 'text-emerald-400' : s.onTimeRate >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                      {s.onTimeRate}%
                    </td>
                    <td className="py-2 px-3 text-right font-mono-data text-slate-300">
                      ¥{s.revenue.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right font-mono-data text-slate-400">
                      ¥{s.cost.toLocaleString()}
                    </td>
                    <td className={`py-2 px-3 text-right font-mono-data font-medium ${s.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {s.profit >= 0 ? '+' : ''}¥{s.profit.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="card max-w-md w-full mx-4 text-center p-8 animate-slide-in border-2"
            style={{ borderColor: gameWon ? '#10b981' : '#ef4444' }}
          >
            {gameWon ? (
              <Trophy size={56} className="mx-auto text-emerald-400 mb-4" />
            ) : (
              <Skull size={56} className="mx-auto text-red-400 mb-4" />
            )}

            <h2 className={`text-2xl font-bold mb-2 ${gameWon ? 'text-emerald-400' : 'text-red-400'}`}>
              {gameWon ? '调度成功' : '调度失败'}
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              {gameWon
                ? `你在 ${totalDays} 天内成功维持了供应链运转！最终满意度 ${satisfaction}%，准时率 ${onTimeRate}%。`
                : '供应链运转不畅，未能达到基本运营指标。重新调整策略再试一次吧。'
              }
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
              <div className="bg-[#0f0f1a] rounded-lg p-3">
                <div className="text-slate-500 text-xs mb-1">最终资金</div>
                <div className={`font-mono-data font-bold ${funds > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                  ¥{funds.toLocaleString()}
                </div>
              </div>
              <div className="bg-[#0f0f1a] rounded-lg p-3">
                <div className="text-slate-500 text-xs mb-1">累计利润</div>
                <div className={`font-mono-data font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  ¥{profit.toLocaleString()}
                </div>
              </div>
              <div className="bg-[#0f0f1a] rounded-lg p-3">
                <div className="text-slate-500 text-xs mb-1">客户满意度</div>
                <div className={`font-mono-data font-bold ${satisfaction >= 70 ? 'text-emerald-400' : satisfaction >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                  {satisfaction}%
                </div>
              </div>
              <div className="bg-[#0f0f1a] rounded-lg p-3">
                <div className="text-slate-500 text-xs mb-1">准时交付率</div>
                <div className={`font-mono-data font-bold ${onTimeRate >= 70 ? 'text-emerald-400' : onTimeRate >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                  {onTimeRate}%
                </div>
              </div>
            </div>

            <button onClick={handleReset} className="btn-primary w-full flex items-center justify-center gap-2">
              <RotateCcw size={16} />
              重新调度
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const started = useGameStore(s => s.started);

  if (!started) return <LandingPage />;
  return <DashboardPage />;
}
