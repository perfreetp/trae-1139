## 1. 架构设计

```mermaid
flowchart TD
    subgraph "前端层"
        A["React 18 + TypeScript"] --> B["Zustand 状态管理"]
        A --> C["React Router 路由"]
        A --> D["Tailwind CSS 样式"]
        A --> E["Canvas 雷达图/地图"]
    end
    subgraph "数据层"
        B --> F["游戏状态 Store"]
        F --> G["供应商数据"]
        F --> H["仓库数据"]
        F --> I["车辆数据"]
        F --> J["菜谱数据"]
        F --> K["事件数据"]
        F --> L["经营指标"]
    end
    subgraph "游戏引擎层"
        B --> M["关卡控制器"]
        M --> N["采购谈判逻辑"]
        M --> O["原料验收逻辑"]
        M --> P["仓库存放逻辑"]
        M --> Q["菜单排产逻辑"]
        M --> R["车辆装载逻辑"]
        M --> S["突发事件逻辑"]
        M --> T["经营结算逻辑"]
    end
```

## 2. 技术说明

- **前端**：React 18 + TailwindCSS 3 + Vite
- **初始化工具**：vite-init
- **后端**：无（纯前端游戏，数据存储在内存/localStorage）
- **数据库**：无（使用 localStorage 持久化存档）
- **状态管理**：Zustand
- **路由**：React Router DOM v6
- **图表**：Canvas API 自绘（雷达图、进度环）
- **动画**：CSS transitions + keyframes

## 3. 路由定义

| 路由 | 用途 |
|------|------|
| `/` | 主界面/仪表盘 |
| `/procurement` | 采购谈判关卡 |
| `/inspection` | 原料验收关卡 |
| `/warehouse` | 仓库存放关卡 |
| `/menu` | 菜单排产关卡 |
| `/loading` | 车辆装载关卡 |
| `/emergency` | 突发事件关卡 |
| `/settlement` | 经营结算关卡 |

## 4. API定义

无后端API，所有数据通过 Zustand store 管理。

## 5. 服务器架构图

不适用（纯前端项目）。

## 6. 数据模型

### 6.1 数据模型定义

```mermaid
erDiagram
    "游戏状态" ||--o{ "供应商" : "选择"
    "游戏状态" ||--o{ "原料" : "持有"
    "游戏状态" ||--o{ "仓库货位" : "使用"
    "游戏状态" ||--o{ "菜谱" : "排产"
    "游戏状态" ||--o{ "车辆" : "调度"
    "游戏状态" ||--o{ "配送订单" : "执行"
    "游戏状态" ||--o{ "突发事件" : "处理"
    "供应商" ||--o{ "原料" : "供应"
    "原料" }o--|| "仓库货位" : "存放"
    "菜谱" }o--o{ "原料" : "需要"
    "车辆" ||--o{ "配送订单" : "配送"
    "配送订单" }o--|| "客户" : "送达"
    "供应商" {
        string id PK
        string name
        number price
        number deliveryDays
        number reputation
        string category
    }
    "原料" {
        string id PK
        string name
        string category
        number expiryDays
        number quantity
        string storageType
        number quality
        string supplierId FK
    }
    "仓库货位" {
        string id PK
        string zone "冷藏/冷冻/常温"
        number capacity
        number used
        string[] itemIds
    }
    "菜谱" {
        string id PK
        string name
        number cost
        number nutrition
        string[] requiredIngredients
        string targetCustomer "学校/医院/企业"
    }
    "车辆" {
        string id PK
        string type "冷链/普通"
        number capacity
        boolean available
        string currentRoute
    }
    "配送订单" {
        string id PK
        string customerId FK
        string vehicleId FK
        string[] menuItemIds
        string status "待配送/配送中/已送达"
        number deadline
    }
    "客户" {
        string id PK
        string name
        string type "学校/医院/企业"
        number satisfaction
        string location
    }
    "突发事件" {
        string id PK
        string type "供应商迟到/原料短缺/车辆故障/临时加单/食品召回"
        string description
        string[] options
        number[] penalties
        number deadline
        boolean resolved
    }
    "游戏状态" {
        number currentDay
        number totalDays
        number funds
        number satisfaction
        number wasteRate
        number onTimeRate
        number profit
        string currentPhase
        boolean multiWarehouseUnlocked
    }
```

### 6.2 数据定义语言

使用 TypeScript 类型定义替代 DDL：

```typescript
interface GameState {
  currentDay: number;
  totalDays: number;
  funds: number;
  satisfaction: number;
  wasteRate: number;
  onTimeRate: number;
  profit: number;
  currentPhase: Phase;
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
}

type Phase = 'procurement' | 'inspection' | 'warehouse' | 'menu' | 'loading' | 'emergency' | 'settlement';

interface Supplier {
  id: string;
  name: string;
  category: string;
  pricePerUnit: number;
  deliveryDays: number;
  reputation: number;
}

interface Ingredient {
  id: string;
  name: string;
  category: string;
  expiryDays: number;
  receivedDay: number;
  quantity: number;
  storageType: 'cold' | 'frozen' | 'ambient';
  quality: number;
  supplierId: string;
  slotId?: string;
  inspected: boolean;
}

interface WarehouseSlot {
  id: string;
  zone: 'cold' | 'frozen' | 'ambient';
  capacity: number;
  itemIds: string[];
}

interface Recipe {
  id: string;
  name: string;
  cost: number;
  nutritionScore: number;
  requiredIngredients: { ingredientId: string; quantity: number }[];
  targetCustomer: 'school' | 'hospital' | 'enterprise' | 'all';
}

interface Vehicle {
  id: string;
  type: 'cold_chain' | 'normal';
  capacity: number;
  available: boolean;
  currentRoute: string[];
}

interface DeliveryOrder {
  id: string;
  customerId: string;
  vehicleId?: string;
  menuItemIds: string[];
  status: 'pending' | 'delivering' | 'delivered' | 'failed';
  deadline: number;
}

interface Customer {
  id: string;
  name: string;
  type: 'school' | 'hospital' | 'enterprise';
  satisfaction: number;
  location: string;
}

interface EmergencyEvent {
  id: string;
  type: 'supplier_late' | 'ingredient_shortage' | 'vehicle_breakdown' | 'rush_order' | 'food_recall';
  description: string;
  options: EventOption[];
  deadline: number;
  resolved: boolean;
  selectedOption?: number;
}

interface EventOption {
  label: string;
  description: string;
  costPenalty: number;
  satisfactionPenalty: number;
  timePenalty: number;
}
```
