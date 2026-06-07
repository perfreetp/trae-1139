export type Phase = 'procurement' | 'inspection' | 'warehouse' | 'menu' | 'loading' | 'emergency' | 'settlement';

export type StorageType = 'cold' | 'frozen' | 'ambient';

export type CustomerType = 'school' | 'hospital' | 'enterprise';

export type VehicleType = 'cold_chain' | 'normal';

export type EventType = 'supplier_late' | 'ingredient_shortage' | 'vehicle_breakdown' | 'rush_order' | 'food_recall';

export type OrderStatus = 'pending' | 'delivering' | 'delivered' | 'failed';

export type InspectionResult = 'pending' | 'passed' | 'failed';

export interface Supplier {
  id: string;
  name: string;
  category: string;
  pricePerUnit: number;
  deliveryDays: number;
  reputation: number;
  available: boolean;
}

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  expiryDays: number;
  receivedDay: number;
  quantity: number;
  storageType: StorageType;
  quality: number;
  supplierId: string;
  slotId?: string;
  inspected: boolean;
  inspectionResult: InspectionResult;
  unitPrice: number;
}

export interface WarehouseSlot {
  id: string;
  zone: StorageType;
  capacity: number;
  itemIds: string[];
  label: string;
}

export interface RecipeIngredient {
  ingredientCategory: string;
  quantity: number;
}

export interface Recipe {
  id: string;
  name: string;
  cost: number;
  nutritionScore: number;
  requiredIngredients: RecipeIngredient[];
  targetCustomer: CustomerType | 'all';
  description: string;
}

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  capacity: number;
  usedCapacity: number;
  available: boolean;
  route: string[];
  assignedOrderIds: string[];
  originWarehouse?: string;
}

export interface DeliveryOrder {
  id: string;
  customerId: string;
  vehicleId?: string;
  recipeIds: string[];
  portions: number;
  status: OrderStatus;
  deadline: number;
  needsColdChain: boolean;
  originWarehouse?: string;
}

export interface Customer {
  id: string;
  name: string;
  type: CustomerType;
  satisfaction: number;
  location: string;
  dailyOrderSize: number;
}

export interface EventOption {
  label: string;
  description: string;
  costPenalty: number;
  satisfactionPenalty: number;
  timePenalty: number;
}

export interface EmergencyEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  options: EventOption[];
  resolved: boolean;
  selectedOption?: number;
}

export interface DaySummary {
  day: number;
  satisfaction: number;
  wasteRate: number;
  onTimeRate: number;
  profit: number;
  revenue: number;
  cost: number;
}

export interface CostBreakdown {
  procurement: number;
  menu: number;
  events: number;
  rental: number;
}

export interface GameState {
  started: boolean;
  gameOver: boolean;
  gameWon: boolean;
  currentDay: number;
  totalDays: number;
  funds: number;
  satisfaction: number;
  wasteRate: number;
  onTimeRate: number;
  profit: number;
  currentPhase: Phase;
  completedPhases: Phase[];
  multiWarehouseUnlocked: boolean;
  suppliers: Supplier[];
  ingredients: Ingredient[];
  warehouseSlots: WarehouseSlot[];
  recipes: Recipe[];
  vehicles: Vehicle[];
  orders: DeliveryOrder[];
  customers: Customer[];
  activeEvents: EmergencyEvent[];
  completedEvents: EmergencyEvent[];
  daySummaries: DaySummary[];
  todayRevenue: number;
  todayCost: number;
  challengeMode: boolean;
  satisfactionChangeToday: number;
  onTimePenaltyToday: number;
  rentedVehicles: Vehicle[];
  dayCostBreakdown: CostBreakdown;
  brokenVehicleIds: string[];
}

export interface MultiWarehouseConfig {
  warehouses: WarehouseSlot[];
  vehicles: Vehicle[];
  customers: Customer[];
  distanceMatrix: Record<string, Record<string, number>>;
}
