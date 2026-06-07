import { create } from 'zustand';
import type { GameState, Phase, DeliveryOrder, Vehicle, EmergencyEvent, DaySummary, CostBreakdown } from '@/types';
import { createInitialState, generateIngredients, generateEmergencyEvents, createChallengeState } from '@/data/gameData';

const COLD_CHAIN_CATEGORIES = ['egg', 'tomato', 'vegetable', 'chicken', 'pork', 'fish', 'seafood', 'tofu'];

const EMPTY_COST_BREAKDOWN: CostBreakdown = { procurement: 0, menu: 0, events: 0, rental: 0 };

type GameActions = {
  startGame: () => void;
  resetGame: () => void;
  setPhase: (phase: Phase) => void;
  completePhase: (phase: Phase) => void;
  nextPhase: () => void;
  selectSupplier: (ingredientId: string, supplierId: string) => void;
  confirmProcurement: () => void;
  inspectIngredient: (ingredientId: string) => void;
  rejectIngredient: (ingredientId: string) => void;
  passIngredient: (ingredientId: string) => void;
  assignToSlot: (ingredientId: string, slotId: string) => void;
  removeFromSlot: (ingredientId: string) => void;
  assignRecipeToCustomer: (customerId: string, recipeIds: string[]) => void;
  createOrders: () => void;
  assignOrderToVehicle: (orderId: string, vehicleId: string) => void;
  setVehicleRoute: (vehicleId: string, route: string[]) => void;
  confirmLoading: () => void;
  resolveEvent: (eventId: string, optionIndex: number) => void;
  calculateSettlement: () => void;
  nextDay: () => void;
  adjustFunds: (amount: number) => void;
  adjustSatisfaction: (amount: number) => void;
  adjustWasteRate: (amount: number) => void;
  adjustOnTimeRate: (amount: number) => void;
  setOrders: (orders: DeliveryOrder[]) => void;
  updateVehicle: (vehicleId: string, updates: Partial<Vehicle>) => void;
  rentVehicle: (vehicleType: 'cold_chain' | 'normal') => Vehicle;
  startChallenge: () => void;
};

const PHASE_ORDER: Phase[] = ['procurement', 'inspection', 'warehouse', 'menu', 'loading', 'emergency', 'settlement'];

const initialState: GameState = {
  started: false,
  gameOver: false,
  gameWon: false,
  currentDay: 1,
  totalDays: 10,
  funds: 50000,
  satisfaction: 80,
  wasteRate: 5,
  onTimeRate: 95,
  profit: 0,
  currentPhase: 'procurement',
  completedPhases: [],
  multiWarehouseUnlocked: false,
  suppliers: [],
  ingredients: [],
  warehouseSlots: [],
  recipes: [],
  vehicles: [],
  orders: [],
  customers: [],
  activeEvents: [],
  completedEvents: [],
  daySummaries: [],
  todayRevenue: 0,
  todayCost: 0,
  challengeMode: false,
  satisfactionChangeToday: 0,
  onTimePenaltyToday: 0,
  rentedVehicles: [],
  dayCostBreakdown: { ...EMPTY_COST_BREAKDOWN },
  brokenVehicleIds: [],
};

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...initialState,

  startGame: () => {
    set(createInitialState());
  },

  resetGame: () => {
    set({ ...initialState });
  },

  setPhase: (phase: Phase) => {
    set({ currentPhase: phase });
  },

  completePhase: (phase: Phase) => {
    const state = get();
    if (!state.completedPhases.includes(phase)) {
      set({ completedPhases: [...state.completedPhases, phase] });
    }
  },

  nextPhase: () => {
    const state = get();
    const currentIdx = PHASE_ORDER.indexOf(state.currentPhase);
    if (currentIdx < PHASE_ORDER.length - 1) {
      const nextP = PHASE_ORDER[currentIdx + 1];
      if (!state.completedPhases.includes(state.currentPhase)) {
        set({
          currentPhase: nextP,
          completedPhases: [...state.completedPhases, state.currentPhase],
        });
      } else {
        set({ currentPhase: nextP });
      }
    }
  },

  selectSupplier: (ingredientId: string, supplierId: string) => {
    set(state => ({
      ingredients: state.ingredients.map(ing =>
        ing.id === ingredientId ? { ...ing, supplierId, inspected: false, inspectionResult: 'pending' as const } : ing
      ),
    }));
  },

  confirmProcurement: () => {
    const state = get();
    let totalCost = 0;
    const updatedIngredients = state.ingredients.map(ing => {
      const supplier = state.suppliers.find(s => s.id === ing.supplierId);
      if (supplier) {
        const cost = ing.quantity * supplier.pricePerUnit;
        totalCost += cost;
      }
      return ing;
    });
    set({
      ingredients: updatedIngredients,
      funds: state.funds - totalCost,
      todayCost: state.todayCost + totalCost,
      dayCostBreakdown: {
        ...state.dayCostBreakdown,
        procurement: state.dayCostBreakdown.procurement + totalCost,
      },
    });
  },

  inspectIngredient: (ingredientId: string) => {
    set(state => ({
      ingredients: state.ingredients.map(ing =>
        ing.id === ingredientId ? { ...ing, inspected: true } : ing
      ),
    }));
  },

  rejectIngredient: (ingredientId: string) => {
    set(state => {
      const ing = state.ingredients.find(i => i.id === ingredientId);
      if (!ing) return state;
      const refund = ing.quantity * ing.unitPrice;
      return {
        ingredients: state.ingredients.map(i =>
          i.id === ingredientId ? { ...i, inspectionResult: 'failed' as const } : i
        ),
        funds: state.funds + refund,
        wasteRate: Math.min(100, state.wasteRate + 2),
      };
    });
  },

  passIngredient: (ingredientId: string) => {
    set(state => ({
      ingredients: state.ingredients.map(ing =>
        ing.id === ingredientId ? { ...ing, inspectionResult: 'passed' as const } : ing
      ),
    }));
  },

  assignToSlot: (ingredientId: string, slotId: string) => {
    set(state => {
      const ingredient = state.ingredients.find(i => i.id === ingredientId);
      const slot = state.warehouseSlots.find(s => s.id === slotId);
      if (!ingredient || !slot) return state;
      if (slot.itemIds.length >= slot.capacity) return state;
      const prevSlotId = ingredient.slotId;
      return {
        ingredients: state.ingredients.map(i =>
          i.id === ingredientId ? { ...i, slotId } : i
        ),
        warehouseSlots: state.warehouseSlots.map(s => {
          if (s.id === slotId) return { ...s, itemIds: [...s.itemIds, ingredientId] };
          if (s.id === prevSlotId) return { ...s, itemIds: s.itemIds.filter(id => id !== ingredientId) };
          return s;
        }),
      };
    });
  },

  removeFromSlot: (ingredientId: string) => {
    set(state => {
      const ingredient = state.ingredients.find(i => i.id === ingredientId);
      if (!ingredient || !ingredient.slotId) return state;
      const prevSlotId = ingredient.slotId;
      return {
        ingredients: state.ingredients.map(i =>
          i.id === ingredientId ? { ...i, slotId: undefined } : i
        ),
        warehouseSlots: state.warehouseSlots.map(s =>
          s.id === prevSlotId ? { ...s, itemIds: s.itemIds.filter(id => id !== ingredientId) } : s
        ),
      };
    });
  },

  assignRecipeToCustomer: (customerId: string, recipeIds: string[]) => {
    set(state => {
      const customer = state.customers.find(c => c.id === customerId);
      if (!customer) return state;

      const existingOrders = state.orders.filter(o => o.customerId === customerId);
      let oldMenuCost = 0;
      existingOrders.forEach(order => {
        order.recipeIds.forEach(rid => {
          const recipe = state.recipes.find(r => r.id === rid);
          if (recipe) oldMenuCost += recipe.cost * (order.portions / 100);
        });
      });

      const newOrders: DeliveryOrder[] = recipeIds.map((rid, idx) => {
        const recipe = state.recipes.find(r => r.id === rid);
        const needsColdChain = recipe
          ? recipe.requiredIngredients.some(ri => COLD_CHAIN_CATEGORIES.includes(ri.ingredientCategory))
          : false;
        return {
          id: `order_d${state.currentDay}_${customerId}_${idx}`,
          customerId,
          recipeIds: [rid],
          portions: customer.dailyOrderSize,
          status: 'pending' as const,
          deadline: state.currentDay,
          needsColdChain,
        };
      });

      let newMenuCost = 0;
      recipeIds.forEach(rid => {
        const recipe = state.recipes.find(r => r.id === rid);
        if (recipe) newMenuCost += recipe.cost * (customer.dailyOrderSize / 100);
      });

      const otherOrders = state.orders.filter(o => o.customerId !== customerId);
      const allOrders = [...otherOrders, ...newOrders];

      let totalRevenue = 0;
      allOrders.forEach(order => {
        order.recipeIds.forEach(rid => {
          const recipe = state.recipes.find(r => r.id === rid);
          const cust = state.customers.find(c => c.id === order.customerId);
          if (recipe && cust) {
            totalRevenue += recipe.cost * 1.5 * (cust.dailyOrderSize / 100);
          }
        });
      });

      const costDelta = newMenuCost - oldMenuCost;

      return {
        orders: allOrders,
        todayRevenue: totalRevenue,
        funds: state.funds - costDelta,
        todayCost: state.todayCost + costDelta,
        dayCostBreakdown: {
          ...state.dayCostBreakdown,
          menu: state.dayCostBreakdown.menu + costDelta,
        },
      };
    });
  },

  createOrders: () => {
    const state = get();
    let totalCost = 0;
    const updatedOrders = state.orders.map(order => {
      order.recipeIds.forEach(rid => {
        const recipe = state.recipes.find(r => r.id === rid);
        if (recipe) totalCost += recipe.cost * (order.portions / 100);
      });
      return order;
    });
    set({
      orders: updatedOrders,
      todayCost: state.todayCost + totalCost,
      funds: state.funds - totalCost,
    });
  },

  assignOrderToVehicle: (orderId: string, vehicleId: string) => {
    set(state => {
      const order = state.orders.find(o => o.id === orderId);
      const vehicle = state.vehicles.find(v => v.id === vehicleId);
      if (!order || !vehicle) return state;
      const prevVehicleId = state.orders.find(o => o.id === orderId)?.vehicleId;
      return {
        orders: state.orders.map(o =>
          o.id === orderId ? { ...o, vehicleId } : o
        ),
        vehicles: state.vehicles.map(v => {
          if (v.id === vehicleId) {
            return {
              ...v,
              assignedOrderIds: [...v.assignedOrderIds.filter(id => id !== orderId), orderId],
              usedCapacity: v.usedCapacity + (order.portions / 10),
            };
          }
          if (v.id === prevVehicleId) {
            return {
              ...v,
              assignedOrderIds: v.assignedOrderIds.filter(id => id !== orderId),
              usedCapacity: Math.max(0, v.usedCapacity - (order.portions / 10)),
            };
          }
          return v;
        }),
      };
    });
  },

  setVehicleRoute: (vehicleId: string, route: string[]) => {
    set(state => ({
      vehicles: state.vehicles.map(v =>
        v.id === vehicleId ? { ...v, route } : v
      ),
    }));
  },

  confirmLoading: () => {
    set(state => ({
      orders: state.orders.map(o =>
        o.vehicleId ? { ...o, status: 'delivering' as const } : o
      ),
    }));
  },

  resolveEvent: (eventId: string, optionIndex: number) => {
    set(state => {
      const event = state.activeEvents.find(e => e.id === eventId);
      if (!event) return state;
      const option = event.options[optionIndex];
      if (!option) return state;

      const penaltyPerCustomer = state.customers.length > 0
        ? option.satisfactionPenalty / state.customers.length
        : 0;

      const updatedCustomers = state.customers.map(c => ({
        ...c,
        satisfaction: Math.max(0, Math.min(100, c.satisfaction - penaltyPerCustomer)),
      }));

      const newSatisfaction = Math.max(0, Math.min(100, state.satisfaction - option.satisfactionPenalty));

      let updatedVehicles = state.vehicles;
      let updatedBrokenVehicleIds = state.brokenVehicleIds;

      if (event.type === 'vehicle_breakdown') {
        const targetVehicle = state.vehicles.find(v => v.type === 'cold_chain' && v.available);
        if (targetVehicle) {
          updatedVehicles = state.vehicles.map(v =>
            v.id === targetVehicle.id ? { ...v, available: false } : v
          );
          if (option.timePenalty > 0) {
            updatedBrokenVehicleIds = [...state.brokenVehicleIds, targetVehicle.id];
          }
        }
      }

      return {
        funds: state.funds - option.costPenalty,
        satisfaction: newSatisfaction,
        todayCost: state.todayCost + option.costPenalty,
        dayCostBreakdown: {
          ...state.dayCostBreakdown,
          events: state.dayCostBreakdown.events + option.costPenalty,
        },
        customers: updatedCustomers,
        satisfactionChangeToday: state.satisfactionChangeToday + option.satisfactionPenalty,
        onTimePenaltyToday: state.onTimePenaltyToday + (option.timePenalty > 0 ? option.timePenalty : 0),
        activeEvents: state.activeEvents.filter(e => e.id !== eventId),
        completedEvents: [...state.completedEvents, { ...event, resolved: true, selectedOption: optionIndex }],
        vehicles: updatedVehicles,
        brokenVehicleIds: updatedBrokenVehicleIds,
      };
    });
  },

  calculateSettlement: () => {
    const state = get();
    const assignedOrders = state.orders.filter(o => o.vehicleId);
    const totalOrders = state.orders.length;
    const deliveredCount = assignedOrders.length;
    const baseOnTime = Math.round((deliveredCount / Math.max(totalOrders, 1)) * 100);
    const onTime = Math.max(0, baseOnTime - state.onTimePenaltyToday * 10);

    const wasteIngredients = state.ingredients.filter(i => i.inspectionResult === 'failed' || !i.slotId);
    const wastePercent = Math.round((wasteIngredients.length / Math.max(state.ingredients.length, 1)) * 100);
    const profit = state.todayRevenue - state.todayCost;

    const summary: DaySummary = {
      day: state.currentDay,
      satisfaction: Math.round(state.satisfaction),
      wasteRate: wastePercent,
      onTimeRate: onTime,
      profit: Math.round(profit),
      revenue: Math.round(state.todayRevenue),
      cost: Math.round(state.todayCost),
    };

    set({
      wasteRate: wastePercent,
      onTimeRate: onTime,
      profit: state.profit + Math.round(profit),
      funds: state.funds + Math.round(state.todayRevenue),
      daySummaries: [...state.daySummaries, summary],
      todayRevenue: 0,
      todayCost: 0,
      satisfactionChangeToday: 0,
      onTimePenaltyToday: 0,
      dayCostBreakdown: { ...EMPTY_COST_BREAKDOWN },
    });
  },

  nextDay: () => {
    const state = get();
    if (state.currentDay >= state.totalDays) {
      const won = state.satisfaction >= 60 && state.onTimeRate >= 70 && state.funds > 0;
      set({ gameOver: true, gameWon: won, multiWarehouseUnlocked: won });
      return;
    }

    const nextDay = state.currentDay + 1;
    const newIngredients = generateIngredients(nextDay, state.suppliers);
    const newEvents = generateEmergencyEvents(nextDay);

    const rentedVehicleIds = new Set(state.rentedVehicles.map(v => v.id));

    set({
      currentDay: nextDay,
      currentPhase: 'procurement',
      completedPhases: [],
      ingredients: newIngredients,
      activeEvents: newEvents,
      completedEvents: [],
      orders: [],
      todayRevenue: 0,
      todayCost: 0,
      satisfactionChangeToday: 0,
      onTimePenaltyToday: 0,
      dayCostBreakdown: { ...EMPTY_COST_BREAKDOWN },
      rentedVehicles: [],
      vehicles: state.vehicles
        .filter(v => !rentedVehicleIds.has(v.id))
        .map(v => ({
          ...v,
          usedCapacity: 0,
          route: [],
          assignedOrderIds: [],
          available: !state.brokenVehicleIds.includes(v.id),
        })),
      brokenVehicleIds: [],
      warehouseSlots: state.warehouseSlots.map(s => ({ ...s, itemIds: [] })),
    });
  },

  adjustFunds: (amount: number) => {
    set(state => ({ funds: state.funds + amount }));
  },

  adjustSatisfaction: (amount: number) => {
    set(state => ({ satisfaction: Math.max(0, Math.min(100, state.satisfaction + amount)) }));
  },

  adjustWasteRate: (amount: number) => {
    set(state => ({ wasteRate: Math.max(0, Math.min(100, state.wasteRate + amount)) }));
  },

  adjustOnTimeRate: (amount: number) => {
    set(state => ({ onTimeRate: Math.max(0, Math.min(100, state.onTimeRate + amount)) }));
  },

  setOrders: (orders: DeliveryOrder[]) => {
    set({ orders });
  },

  updateVehicle: (vehicleId: string, updates: Partial<Vehicle>) => {
    set(state => ({
      vehicles: state.vehicles.map(v =>
        v.id === vehicleId ? { ...v, ...updates } : v
      ),
    }));
  },

  rentVehicle: (vehicleType: 'cold_chain' | 'normal') => {
    const state = get();
    const rentalCost = vehicleType === 'cold_chain' ? 1500 : 800;
    const id = `rental_d${state.currentDay}_${Date.now()}`;
    const vehicle: Vehicle = {
      id,
      name: vehicleType === 'cold_chain' ? '租赁冷链车' : '租赁普通货车',
      type: vehicleType,
      capacity: vehicleType === 'cold_chain' ? 150 : 250,
      usedCapacity: 0,
      available: true,
      route: [],
      assignedOrderIds: [],
    };
    set({
      vehicles: [...state.vehicles, vehicle],
      rentedVehicles: [...state.rentedVehicles, vehicle],
      funds: state.funds - rentalCost,
      todayCost: state.todayCost + rentalCost,
      dayCostBreakdown: {
        ...state.dayCostBreakdown,
        rental: state.dayCostBreakdown.rental + rentalCost,
      },
    });
    return vehicle;
  },

  startChallenge: () => {
    set(createChallengeState());
  },
}));
