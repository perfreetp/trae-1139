import type { Supplier, Recipe, Customer, Vehicle, WarehouseSlot, EmergencyEvent, Ingredient, Phase, GameState } from '@/types';

const SUPPLIERS: Supplier[] = [
  { id: 's1', name: '金源粮油', category: 'grain_oil', pricePerUnit: 8, deliveryDays: 1, reputation: 5, available: true },
  { id: 's2', name: '绿野果蔬', category: 'vegetable_fruit', pricePerUnit: 5, deliveryDays: 2, reputation: 3, available: true },
  { id: 's3', name: '鲜汇肉业', category: 'meat', pricePerUnit: 22, deliveryDays: 1, reputation: 4, available: true },
  { id: 's4', name: '海鲜达', category: 'seafood', pricePerUnit: 35, deliveryDays: 2, reputation: 3, available: true },
  { id: 's5', name: '万家调味', category: 'seasoning', pricePerUnit: 3, deliveryDays: 1, reputation: 5, available: true },
  { id: 's6', name: '顺达粮油', category: 'grain_oil', pricePerUnit: 10, deliveryDays: 1, reputation: 4, available: true },
  { id: 's7', name: '田园果蔬', category: 'vegetable_fruit', pricePerUnit: 6, deliveryDays: 1, reputation: 4, available: true },
  { id: 's8', name: '瑞丰肉业', category: 'meat', pricePerUnit: 18, deliveryDays: 2, reputation: 3, available: true },
];

const RECIPES: Recipe[] = [
  { id: 'r1', name: '番茄炒蛋', cost: 6, nutritionScore: 65, requiredIngredients: [{ ingredientCategory: 'egg', quantity: 2 }, { ingredientCategory: 'tomato', quantity: 2 }, { ingredientCategory: 'seasoning', quantity: 1 }], targetCustomer: 'all', description: '经典家常菜，酸甜可口' },
  { id: 'r2', name: '土豆烧鸡', cost: 12, nutritionScore: 75, requiredIngredients: [{ ingredientCategory: 'chicken', quantity: 2 }, { ingredientCategory: 'potato', quantity: 2 }, { ingredientCategory: 'seasoning', quantity: 1 }], targetCustomer: 'school', description: '鸡肉软嫩，土豆绵密' },
  { id: 'r3', name: '蔬菜炒饭', cost: 5, nutritionScore: 60, requiredIngredients: [{ ingredientCategory: 'rice', quantity: 2 }, { ingredientCategory: 'vegetable', quantity: 2 }, { ingredientCategory: 'seasoning', quantity: 1 }], targetCustomer: 'school', description: '营养均衡，色彩丰富' },
  { id: 'r4', name: '清蒸鲈鱼', cost: 18, nutritionScore: 85, requiredIngredients: [{ ingredientCategory: 'fish', quantity: 2 }, { ingredientCategory: 'seasoning', quantity: 1 }, { ingredientCategory: 'vegetable', quantity: 1 }], targetCustomer: 'hospital', description: '鲜嫩清淡，易于消化' },
  { id: 'r5', name: '蔬菜粥', cost: 4, nutritionScore: 55, requiredIngredients: [{ ingredientCategory: 'rice', quantity: 2 }, { ingredientCategory: 'vegetable', quantity: 2 }], targetCustomer: 'hospital', description: '温和养胃，低脂低盐' },
  { id: 'r6', name: '鸡汤面', cost: 10, nutritionScore: 70, requiredIngredients: [{ ingredientCategory: 'chicken', quantity: 2 }, { ingredientCategory: 'flour', quantity: 2 }, { ingredientCategory: 'vegetable', quantity: 1 }], targetCustomer: 'hospital', description: '滋补暖胃，恢复体力' },
  { id: 'r7', name: '红烧肉', cost: 16, nutritionScore: 60, requiredIngredients: [{ ingredientCategory: 'pork', quantity: 3 }, { ingredientCategory: 'seasoning', quantity: 2 }, { ingredientCategory: 'vegetable', quantity: 1 }], targetCustomer: 'enterprise', description: '肥而不腻，入口即化' },
  { id: 'r8', name: '宫保鸡丁', cost: 13, nutritionScore: 72, requiredIngredients: [{ ingredientCategory: 'chicken', quantity: 2 }, { ingredientCategory: 'seasoning', quantity: 2 }, { ingredientCategory: 'vegetable', quantity: 1 }], targetCustomer: 'enterprise', description: '麻辣鲜香，下饭首选' },
  { id: 'r9', name: '麻婆豆腐', cost: 8, nutritionScore: 58, requiredIngredients: [{ ingredientCategory: 'tofu', quantity: 2 }, { ingredientCategory: 'seasoning', quantity: 2 }], targetCustomer: 'enterprise', description: '麻辣烫鲜，嫩滑入味' },
  { id: 'r10', name: '蛋炒饭', cost: 5, nutritionScore: 50, requiredIngredients: [{ ingredientCategory: 'rice', quantity: 2 }, { ingredientCategory: 'egg', quantity: 1 }, { ingredientCategory: 'seasoning', quantity: 1 }], targetCustomer: 'all', description: '简单美味，百吃不厌' },
  { id: 'r11', name: '三鲜汤', cost: 12, nutritionScore: 78, requiredIngredients: [{ ingredientCategory: 'seafood', quantity: 2 }, { ingredientCategory: 'tofu', quantity: 1 }, { ingredientCategory: 'vegetable', quantity: 1 }], targetCustomer: 'all', description: '鲜美浓郁，营养丰富' },
  { id: 'r12', name: '时蔬拼盘', cost: 4, nutritionScore: 70, requiredIngredients: [{ ingredientCategory: 'vegetable', quantity: 3 }, { ingredientCategory: 'seasoning', quantity: 1 }], targetCustomer: 'all', description: '清新爽口，维生素满分' },
];

const CUSTOMERS: Customer[] = [
  { id: 'c1', name: '阳光小学', type: 'school', satisfaction: 80, location: '城东区-学府路12号', dailyOrderSize: 300, consecutiveDelays: 0 },
  { id: 'c2', name: '育才中学', type: 'school', satisfaction: 75, location: '城东区-育才大道88号', dailyOrderSize: 400, consecutiveDelays: 0 },
  { id: 'c3', name: '市中心医院', type: 'hospital', satisfaction: 85, location: '城中区-健康路56号', dailyOrderSize: 250, consecutiveDelays: 0 },
  { id: 'c4', name: '第一人民医院', type: 'hospital', satisfaction: 80, location: '城西区-医疗街33号', dailyOrderSize: 200, consecutiveDelays: 0 },
  { id: 'c5', name: '科技园区食堂', type: 'enterprise', satisfaction: 70, location: '高新区-创新大道100号', dailyOrderSize: 500, consecutiveDelays: 0 },
];

const VEHICLES: Vehicle[] = [
  { id: 'v1', name: '冷链车A', type: 'cold_chain', capacity: 200, usedCapacity: 0, available: true, route: [], assignedOrderIds: [] },
  { id: 'v2', name: '冷链车B', type: 'cold_chain', capacity: 150, usedCapacity: 0, available: true, route: [], assignedOrderIds: [] },
  { id: 'v3', name: '普通货车A', type: 'normal', capacity: 300, usedCapacity: 0, available: true, route: [], assignedOrderIds: [] },
  { id: 'v4', name: '普通货车B', type: 'normal', capacity: 250, usedCapacity: 0, available: true, route: [], assignedOrderIds: [] },
];

const WAREHOUSE_SLOTS: WarehouseSlot[] = [
  { id: 'w1', zone: 'cold', capacity: 50, itemIds: [], label: '冷藏区A' },
  { id: 'w2', zone: 'cold', capacity: 40, itemIds: [], label: '冷藏区B' },
  { id: 'w3', zone: 'frozen', capacity: 30, itemIds: [], label: '冷冻区A' },
  { id: 'w4', zone: 'frozen', capacity: 25, itemIds: [], label: '冷冻区B' },
  { id: 'w5', zone: 'ambient', capacity: 60, itemIds: [], label: '常温区A' },
  { id: 'w6', zone: 'ambient', capacity: 50, itemIds: [], label: '常温区B' },
];

function generateIngredients(day: number, suppliers: Supplier[]): Ingredient[] {
  const qualityVariance = Math.max(0.5, 1 - day * 0.05);
  const baseIngredients: Omit<Ingredient, 'id' | 'receivedDay' | 'quality' | 'inspected' | 'inspectionResult' | 'unitPrice' | 'supplierId' | 'slotId'>[] = [
    { name: '大米', category: 'rice', expiryDays: 90, quantity: 100, storageType: 'ambient' },
    { name: '面粉', category: 'flour', expiryDays: 60, quantity: 80, storageType: 'ambient' },
    { name: '鸡蛋', category: 'egg', expiryDays: 15, quantity: 50, storageType: 'cold' },
    { name: '番茄', category: 'tomato', expiryDays: 7, quantity: 40, storageType: 'cold' },
    { name: '土豆', category: 'potato', expiryDays: 14, quantity: 60, storageType: 'ambient' },
    { name: '蔬菜混合', category: 'vegetable', expiryDays: 5, quantity: 80, storageType: 'cold' },
    { name: '鸡肉', category: 'chicken', expiryDays: 3, quantity: 50, storageType: 'cold' },
    { name: '猪肉', category: 'pork', expiryDays: 4, quantity: 40, storageType: 'cold' },
    { name: '鲈鱼', category: 'fish', expiryDays: 2, quantity: 30, storageType: 'cold' },
    { name: '虾仁', category: 'seafood', expiryDays: 2, quantity: 25, storageType: 'frozen' },
    { name: '豆腐', category: 'tofu', expiryDays: 3, quantity: 40, storageType: 'cold' },
    { name: '调味料套装', category: 'seasoning', expiryDays: 180, quantity: 60, storageType: 'ambient' },
  ];

  return baseIngredients.map((ing, idx) => {
    const categorySupplierMap: Record<string, string> = {
      rice: 'grain_oil', flour: 'grain_oil', egg: 'grain_oil',
      tomato: 'vegetable_fruit', potato: 'vegetable_fruit', vegetable: 'vegetable_fruit',
      chicken: 'meat', pork: 'meat', fish: 'seafood', seafood: 'seafood',
      tofu: 'vegetable_fruit', seasoning: 'seasoning',
    };
    const supplierCategory = categorySupplierMap[ing.category] || 'seasoning';
    const matchedSupplier = suppliers.find(s => s.category === supplierCategory && s.available) || suppliers[0];
    const quality = Math.round((0.6 + Math.random() * 0.4 * qualityVariance) * 100) / 100;

    return {
      ...ing,
      id: `ing_d${day}_${idx}`,
      receivedDay: day,
      quality,
      inspected: false,
      inspectionResult: 'pending' as const,
      unitPrice: matchedSupplier.pricePerUnit * (1 + day * 0.02),
      supplierId: matchedSupplier.id,
    };
  });
}

function generateEmergencyEvents(day: number): EmergencyEvent[] {
  const events: EmergencyEvent[] = [];
  if (day < 2) return events;

  const eventPool: Omit<EmergencyEvent, 'id' | 'resolved'>[] = [
    {
      type: 'supplier_late',
      title: '供应商迟到',
      description: `金源粮油运输车辆途中抛锚，交货将延迟1天。现有库存可能不足以支撑全部订单。`,
      options: [
        { label: '等待延迟交货', description: '延迟1天到货，部分订单可能无法准时供应', costPenalty: 0, satisfactionPenalty: 15, timePenalty: 1 },
        { label: '紧急调货', description: '从备用供应商处高价采购，成本增加50%', costPenalty: 500, satisfactionPenalty: 0, timePenalty: 0 },
        { label: '调整菜单', description: '用现有库存替代，营养评分降低', costPenalty: 0, satisfactionPenalty: 10, timePenalty: 0 },
      ],
    },
    {
      type: 'ingredient_shortage',
      title: '原料短缺',
      description: `今日蔬菜到货量仅达预期的60%，部分菜谱无法按原计划执行。`,
      options: [
        { label: '削减部分菜品', description: '减少蔬菜供应量，客户满意度下降', costPenalty: 0, satisfactionPenalty: 20, timePenalty: 0 },
        { label: '高价补货', description: '从市场零售价补充短缺部分，成本翻倍', costPenalty: 800, satisfactionPenalty: 0, timePenalty: 0 },
        { label: '替换菜单', description: '用其他可用食材替代，营养略降', costPenalty: 200, satisfactionPenalty: 5, timePenalty: 0 },
      ],
    },
    {
      type: 'vehicle_breakdown',
      title: '车辆故障',
      description: `冷链车A压缩机故障，无法维持冷藏温度，需紧急维修1天。`,
      options: [
        { label: '等待维修', description: '冷链车A停运1天，冷藏食品无法配送', costPenalty: 300, satisfactionPenalty: 15, timePenalty: 1 },
        { label: '租赁替代车辆', description: '租赁外部冷链车，费用较高但保障时效', costPenalty: 1000, satisfactionPenalty: 0, timePenalty: 0 },
        { label: '改装普通货车', description: '加冰柜运输，保鲜效果下降，部分食品品质降低', costPenalty: 200, satisfactionPenalty: 8, timePenalty: 0 },
      ],
    },
    {
      type: 'rush_order',
      title: '临时加单',
      description: `科技园区临时通知，因加班人数增加，需额外追加200份餐食。`,
      options: [
        { label: '接受加单', description: '加班生产，成本增加但收入增加', costPenalty: 400, satisfactionPenalty: 0, timePenalty: 0 },
        { label: '部分满足', description: '仅提供100份加量，客户不太满意', costPenalty: 200, satisfactionPenalty: 10, timePenalty: 0 },
        { label: '拒绝加单', description: '按原计划执行，客户满意度大幅下降', costPenalty: 0, satisfactionPenalty: 25, timePenalty: 0 },
      ],
    },
    {
      type: 'food_recall',
      title: '食品召回',
      description: `接到质检通知：某批次猪肉存在检疫风险，需紧急召回检查。`,
      options: [
        { label: '立即召回', description: '销毁相关原料，重新采购，成本大增', costPenalty: 1200, satisfactionPenalty: 5, timePenalty: 0 },
        { label: '封存待检', description: '暂停使用相关原料，用替代食材', costPenalty: 600, satisfactionPenalty: 8, timePenalty: 0 },
        { label: '继续使用', description: '冒一定风险，但若出事后果严重', costPenalty: 0, satisfactionPenalty: 40, timePenalty: 0 },
      ],
    },
  ];

  const eventChance = Math.min(0.3 + day * 0.08, 0.8);
  if (Math.random() < eventChance) {
    const availableEvents = eventPool.filter(() => Math.random() < 0.5);
    if (availableEvents.length === 0 && Math.random() < 0.5) {
      availableEvents.push(eventPool[Math.floor(Math.random() * eventPool.length)]);
    }
    availableEvents.forEach((evt, idx) => {
      events.push({
        ...evt,
        id: `evt_d${day}_${idx}`,
        resolved: false,
      });
    });
  }

  return events;
}

export function createInitialState() {
  const day = 1;
  const suppliers = SUPPLIERS.map(s => ({ ...s }));
  const ingredients = generateIngredients(day, suppliers);
  const events = generateEmergencyEvents(day);

  return {
    started: true,
    gameOver: false,
    gameWon: false,
    currentDay: day,
    totalDays: 10,
    funds: 50000,
    satisfaction: 80,
    wasteRate: 5,
    onTimeRate: 95,
    profit: 0,
    currentPhase: 'procurement' as Phase,
    completedPhases: [] as Phase[],
    multiWarehouseUnlocked: false,
    challengeMode: false,
    suppliers,
    ingredients,
    warehouseSlots: WAREHOUSE_SLOTS.map(s => ({ ...s, itemIds: [] })),
    recipes: RECIPES.map(r => ({ ...r })),
    vehicles: VEHICLES.map(v => ({ ...v, usedCapacity: 0, route: [], assignedOrderIds: [] })),
    orders: [],
    customers: CUSTOMERS.map(c => ({ ...c })),
    activeEvents: events,
    completedEvents: [],
    daySummaries: [],
    todayRevenue: 0,
    todayCost: 0,
    satisfactionChangeToday: 0,
    onTimePenaltyToday: 0,
    rentedVehicles: [],
    dayCostBreakdown: { procurement: 0, menu: 0, events: 0, rental: 0 },
    brokenVehicleIds: [],
    lastSettlement: null,
    transferCostToday: 0,
  };
}

const DISTANCE_MATRIX: Record<string, Record<string, number>> = {
  '中心厨房': {
    '城东区-学府路12号': 8,
    '城东区-育才大道88号': 10,
    '城中区-健康路56号': 5,
    '城西区-医疗街33号': 14,
    '高新区-创新大道100号': 12,
  },
  '城东区-学府路12号': {
    '中心厨房': 8,
    '城东区-育才大道88号': 4,
    '城中区-健康路56号': 7,
    '城西区-医疗街33号': 16,
    '高新区-创新大道100号': 14,
  },
  '城东区-育才大道88号': {
    '中心厨房': 10,
    '城东区-学府路12号': 4,
    '城中区-健康路56号': 9,
    '城西区-医疗街33号': 18,
    '高新区-创新大道100号': 16,
  },
  '城中区-健康路56号': {
    '中心厨房': 5,
    '城东区-学府路12号': 7,
    '城东区-育才大道88号': 9,
    '城西区-医疗街33号': 9,
    '高新区-创新大道100号': 10,
  },
  '城西区-医疗街33号': {
    '中心厨房': 14,
    '城东区-学府路12号': 16,
    '城东区-育才大道88号': 18,
    '城中区-健康路56号': 9,
    '高新区-创新大道100号': 20,
  },
  '高新区-创新大道100号': {
    '中心厨房': 12,
    '城东区-学府路12号': 14,
    '城东区-育才大道88号': 16,
    '城中区-健康路56号': 10,
    '城西区-医疗街33号': 20,
  },
};

const CHALLENGE_WAREHOUSE_SLOTS: WarehouseSlot[] = [
  { id: 'cw1', zone: 'cold', capacity: 40, itemIds: [], label: '城东中央仓-冷藏区' },
  { id: 'cw2', zone: 'frozen', capacity: 20, itemIds: [], label: '城东中央仓-冷冻区' },
  { id: 'cw3', zone: 'ambient', capacity: 60, itemIds: [], label: '城东中央仓-常温区' },
  { id: 'cw4', zone: 'cold', capacity: 50, itemIds: [], label: '城西冷链仓-冷藏区' },
  { id: 'cw5', zone: 'frozen', capacity: 30, itemIds: [], label: '城西冷链仓-冷冻区' },
  { id: 'cw6', zone: 'ambient', capacity: 30, itemIds: [], label: '城西冷链仓-常温区' },
];

const CHALLENGE_VEHICLES: Vehicle[] = [
  { id: 'cv1', name: '城东冷链车A', type: 'cold_chain', capacity: 180, usedCapacity: 0, available: true, route: [], assignedOrderIds: [], originWarehouse: 'cw1' },
  { id: 'cv2', name: '城东冷链车B', type: 'cold_chain', capacity: 150, usedCapacity: 0, available: true, route: [], assignedOrderIds: [], originWarehouse: 'cw1' },
  { id: 'cv3', name: '城东普通货车', type: 'normal', capacity: 280, usedCapacity: 0, available: true, route: [], assignedOrderIds: [], originWarehouse: 'cw1' },
  { id: 'cv4', name: '城西冷链车A', type: 'cold_chain', capacity: 200, usedCapacity: 0, available: true, route: [], assignedOrderIds: [], originWarehouse: 'cw4' },
  { id: 'cv5', name: '城西冷链车B', type: 'cold_chain', capacity: 160, usedCapacity: 0, available: true, route: [], assignedOrderIds: [], originWarehouse: 'cw4' },
  { id: 'cv6', name: '城西普通货车', type: 'normal', capacity: 250, usedCapacity: 0, available: true, route: [], assignedOrderIds: [], originWarehouse: 'cw4' },
];

const CHALLENGE_CUSTOMERS: Customer[] = [
  { id: 'cc1', name: '阳光小学', type: 'school', satisfaction: 80, location: '城东区-学府路12号', dailyOrderSize: 300, consecutiveDelays: 0 },
  { id: 'cc2', name: '育才中学', type: 'school', satisfaction: 75, location: '城东区-育才大道88号', dailyOrderSize: 400, consecutiveDelays: 0 },
  { id: 'cc3', name: '启明小学', type: 'school', satisfaction: 78, location: '城西区-文教路22号', dailyOrderSize: 250, consecutiveDelays: 0 },
  { id: 'cc4', name: '市中心医院', type: 'hospital', satisfaction: 85, location: '城中区-健康路56号', dailyOrderSize: 250, consecutiveDelays: 0 },
  { id: 'cc5', name: '第一人民医院', type: 'hospital', satisfaction: 80, location: '城西区-医疗街33号', dailyOrderSize: 200, consecutiveDelays: 0 },
  { id: 'cc6', name: '科技园区食堂', type: 'enterprise', satisfaction: 70, location: '高新区-创新大道100号', dailyOrderSize: 500, consecutiveDelays: 0 },
  { id: 'cc7', name: '远航集团食堂', type: 'enterprise', satisfaction: 65, location: '远郊区-临港大道1号', dailyOrderSize: 350, consecutiveDelays: 0 },
];

const CHALLENGE_DISTANCE_MATRIX: Record<string, Record<string, number>> = {
  '城东中央仓': {
    '城东区-学府路12号': 5,
    '城东区-育才大道88号': 7,
    '城西区-文教路22号': 24,
    '城中区-健康路56号': 10,
    '城西区-医疗街33号': 22,
    '高新区-创新大道100号': 14,
    '远郊区-临港大道1号': 40,
    '城西冷链仓': 18,
  },
  '城西冷链仓': {
    '城东区-学府路12号': 20,
    '城东区-育才大道88号': 22,
    '城西区-文教路22号': 6,
    '城中区-健康路56号': 12,
    '城西区-医疗街33号': 5,
    '高新区-创新大道100号': 26,
    '远郊区-临港大道1号': 38,
    '城东中央仓': 18,
  },
  '城东区-学府路12号': {
    '城东中央仓': 5,
    '城西冷链仓': 20,
  },
  '城东区-育才大道88号': {
    '城东中央仓': 7,
    '城西冷链仓': 22,
  },
  '城西区-文教路22号': {
    '城东中央仓': 24,
    '城西冷链仓': 6,
  },
  '城中区-健康路56号': {
    '城东中央仓': 10,
    '城西冷链仓': 12,
  },
  '城西区-医疗街33号': {
    '城东中央仓': 22,
    '城西冷链仓': 5,
  },
  '高新区-创新大道100号': {
    '城东中央仓': 14,
    '城西冷链仓': 26,
  },
  '远郊区-临港大道1号': {
    '城东中央仓': 40,
    '城西冷链仓': 38,
  },
};

function generateChallengeIngredients(day: number, suppliers: Supplier[]): Ingredient[] {
  const qualityVariance = Math.max(0.5, 1 - day * 0.05);
  const baseIngredients: Omit<Ingredient, 'id' | 'receivedDay' | 'quality' | 'inspected' | 'inspectionResult' | 'unitPrice' | 'supplierId' | 'slotId'>[] = [
    { name: '大米', category: 'rice', expiryDays: 90, quantity: 80, storageType: 'ambient' },
    { name: '面粉', category: 'flour', expiryDays: 60, quantity: 60, storageType: 'ambient' },
    { name: '鸡蛋', category: 'egg', expiryDays: 15, quantity: 40, storageType: 'cold' },
    { name: '番茄', category: 'tomato', expiryDays: 7, quantity: 35, storageType: 'cold' },
    { name: '土豆', category: 'potato', expiryDays: 14, quantity: 50, storageType: 'ambient' },
    { name: '蔬菜混合', category: 'vegetable', expiryDays: 5, quantity: 70, storageType: 'cold' },
    { name: '鸡肉', category: 'chicken', expiryDays: 3, quantity: 45, storageType: 'cold' },
    { name: '猪肉', category: 'pork', expiryDays: 4, quantity: 35, storageType: 'cold' },
    { name: '鲈鱼', category: 'fish', expiryDays: 2, quantity: 25, storageType: 'cold' },
    { name: '虾仁', category: 'seafood', expiryDays: 2, quantity: 20, storageType: 'frozen' },
    { name: '豆腐', category: 'tofu', expiryDays: 3, quantity: 35, storageType: 'cold' },
    { name: '调味料套装', category: 'seasoning', expiryDays: 180, quantity: 50, storageType: 'ambient' },
  ];

  return baseIngredients.map((ing, idx) => {
    const categorySupplierMap: Record<string, string> = {
      rice: 'grain_oil', flour: 'grain_oil', egg: 'grain_oil',
      tomato: 'vegetable_fruit', potato: 'vegetable_fruit', vegetable: 'vegetable_fruit',
      chicken: 'meat', pork: 'meat', fish: 'seafood', seafood: 'seafood',
      tofu: 'vegetable_fruit', seasoning: 'seasoning',
    };
    const supplierCategory = categorySupplierMap[ing.category] || 'seasoning';
    const matchedSupplier = suppliers.find(s => s.category === supplierCategory && s.available) || suppliers[0];
    const quality = Math.round((0.6 + Math.random() * 0.4 * qualityVariance) * 100) / 100;

    return {
      ...ing,
      id: `cing_d${day}_${idx}`,
      receivedDay: day,
      quality,
      inspected: false,
      inspectionResult: 'pending' as const,
      unitPrice: matchedSupplier.pricePerUnit * (1 + day * 0.02),
      supplierId: matchedSupplier.id,
    };
  });
}

export function createChallengeState(): GameState {
  const day = 1;
  const suppliers = SUPPLIERS.map(s => ({ ...s }));
  const ingredients = generateChallengeIngredients(day, suppliers);
  const events = generateEmergencyEvents(day);

  return {
    started: true,
    gameOver: false,
    gameWon: false,
    currentDay: day,
    totalDays: 5,
    funds: 80000,
    satisfaction: 80,
    wasteRate: 5,
    onTimeRate: 95,
    profit: 0,
    currentPhase: 'procurement' as Phase,
    completedPhases: [] as Phase[],
    multiWarehouseUnlocked: true,
    challengeMode: true,
    suppliers,
    ingredients,
    warehouseSlots: CHALLENGE_WAREHOUSE_SLOTS.map(s => ({ ...s, itemIds: [] })),
    recipes: RECIPES.map(r => ({ ...r })),
    vehicles: CHALLENGE_VEHICLES.map(v => ({ ...v, usedCapacity: 0, route: [], assignedOrderIds: [] })),
    orders: [],
    customers: CHALLENGE_CUSTOMERS.map(c => ({ ...c })),
    activeEvents: events,
    completedEvents: [],
    daySummaries: [],
    todayRevenue: 0,
    todayCost: 0,
    satisfactionChangeToday: 0,
    onTimePenaltyToday: 0,
    rentedVehicles: [],
    dayCostBreakdown: { procurement: 0, menu: 0, events: 0, rental: 0 },
    brokenVehicleIds: [],
    lastSettlement: null,
    transferCostToday: 0,
  };
}

export { SUPPLIERS, RECIPES, CUSTOMERS, VEHICLES, WAREHOUSE_SLOTS, generateIngredients, generateEmergencyEvents, DISTANCE_MATRIX, CHALLENGE_DISTANCE_MATRIX };
