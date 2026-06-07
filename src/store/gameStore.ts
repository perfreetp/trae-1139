import { create } from 'zustand';
import type { GameState, Phase, Ingredient, DeliveryOrder, Vehicle, EmergencyEvent, DaySummary } from '@/types';
import { createInitialState, generateIngredients, generateEmergencyEvents } from '@/data/gameData';

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
      const existing = state.orders.filter(o => o.customerId === customerId);
      const removed = existing.filter(o => !recipeIds.includes(o.recipeIds[0] || ''));
      const revenue = recipeIds.reduce((sum, rid) => {
        const recipe = state.recipes.find(r => r.id === rid);
        const customer = state.customers.find(c => c.id === customerId);
        return sum + (recipe ? recipe.cost * 1.5 * (customer ? customer.dailyOrderSize / 100 : 1) : 0);
      }, 0);

      const newOrders: DeliveryOrder[] = recipeIds.map((rid, idx) => ({
        id: `order_d${state.currentDay}_${customerId}_${idx}`,
        customerId,
        recipeIds: [rid],
        portions: state.customers.find(c => c.id === customerId)?.dailyOrderSize || 100,
        status: 'pending' as const,
        deadline: state.currentDay,
      }));

      const otherOrders = state.orders.filter(o => o.customerId !== customerId);
      return {
        orders: [...otherOrders, ...newOrders],
        todayRevenue: state.todayRevenue + revenue,
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
      return {
        funds: state.funds - option.costPenalty,
        satisfaction: Math.max(0, Math.min(100, state.satisfaction - option.satisfactionPenalty)),
        todayCost: state.todayCost + option.costPenalty,
        activeEvents: state.activeEvents.filter(e => e.id !== eventId),
        completedEvents: [...state.completedEvents, { ...event, resolved: true, selectedOption: optionIndex }],
      };
    });
  },

  calculateSettlement: () => {
    const state = get();
    const assignedOrders = state.orders.filter(o => o.vehicleId);
    const totalOrders = state.orders.length;
    const deliveredCount = assignedOrders.length;
    const onTime = Math.round((deliveredCount / Math.max(totalOrders, 1)) * 100);
    const wasteIngredients = state.ingredients.filter(i => i.inspectionResult === 'failed' || !i.slotId);
    const wastePercent = Math.round((wasteIngredients.length / Math.max(state.ingredients.length, 1)) * 100);
    const profit = state.todayRevenue - state.todayCost;

    const avgSatisfaction = state.customers.reduce((sum, c) => sum + c.satisfaction, 0) / state.customers.length;

    const summary: DaySummary = {
      day: state.currentDay,
      satisfaction: Math.round(avgSatisfaction),
      wasteRate: wastePercent,
      onTimeRate: onTime,
      profit: Math.round(profit),
      revenue: Math.round(state.todayRevenue),
      cost: Math.round(state.todayCost),
    };

    set({
      satisfaction: Math.round(avgSatisfaction),
      wasteRate: wastePercent,
      onTimeRate: onTime,
      profit: state.profit + Math.round(profit),
      funds: state.funds + Math.round(state.todayRevenue),
      daySummaries: [...state.daySummaries, summary],
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
      vehicles: state.vehicles.map(v => ({
        ...v,
        usedCapacity: 0,
        route: [],
        assignedOrderIds: [],
        available: true,
      })),
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
}));
