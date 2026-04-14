// Task queue system for mature creep management
import { Role, TaskType } from './role';

// Re-export for convenience
export { TaskType };

export interface Task {
  id: string;
  type: TaskType;
  priority: number;
  roomId: string;
  targetId?: string;
  targetPos?: RoomPosition;
  data: TaskData;
  assignedTo?: string;
  createdAt: number;
  expiresAt?: number;
}

export interface TaskData {
  // Harvest tasks
  sourceId?: string;
  amount?: number;
  
  // Haul tasks
  fromId?: string;
  toId?: string;
  resourceType?: ResourceConstant;
  
  // Build/Repair tasks
  structureId?: string;
  structureType?: BuildableStructureConstant;
  remainingWork?: number;
  
  // Combat tasks
  targetCreepId?: string;
  targetStructureId?: string;
  threatLevel?: number;
  
  // Scout tasks
  exploreRoom?: string;
  path?: RoomPosition[];
  
  // Claim tasks
  controllerId?: string;
}

export interface SpawnRequest {
  role: Role;
  priority: number;
  body?: BodyPartConstant[];
  memory?: CreepMemory;
  count?: number;
}

export interface RoomMemory {
  roleCount: { [role: string]: number };
  spawnQueue: SpawnRequest[];
  taskQueue: Task[];
  sources: SourceInfo[];
  constructionPlan: ConstructionPlan;
  defensePlan: DefensePlan;
  lastUpdate: number;
}

export interface SourceInfo {
  id: string;
  pos: RoomPosition;
  reservedBy?: string;
  containerId?: string;
  linkId?: string;
  mining?: boolean;
}

export interface ConstructionPlan {
  sites: PlannedStructure[];
  priority: 'spawn' | 'storage' | 'towers' | 'links' | 'labs';
}

export interface PlannedStructure {
  type: BuildableStructureConstant;
  pos: RoomPosition;
  priority: number;
  built?: boolean;
}

export interface DefensePlan {
  ramparts: RoomPosition[];
  walls: RoomPosition[];
  towerPositions: RoomPosition[];
  guardPositions: RoomPosition[];
}

export interface ColonyMemory {
  ownedRooms: string[];
  expansionTargets: ExpansionTarget[];
  marketOrders: MarketOrder[];
  remoteRooms: RemoteRoom[];
}

export interface ExpansionTarget {
  roomName: string;
  score: number;
  sources: number;
  distance: number;
  claimed?: boolean;
}

export interface RemoteRoom {
  roomName: string;
  sourceIds: string[];
  haulerRoute: string[];
  active: boolean;
}

export interface MarketOrder {
  id: string;
  type: 'buy' | 'sell';
  resourceType: ResourceConstant;
  price: number;
  amount: number;
  roomName?: string;
}
