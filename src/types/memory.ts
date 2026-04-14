// Memory interface with task queue and colony management
import { RoomMemory, ColonyMemory } from './task';

// Export extended CreepMemory interface
export interface CreepMemory {
  role: string;
  room: string;
  working: boolean;
  taskId?: string;
  targetId?: string;
  sourceId?: string;
  homeRoom?: string;
  state?: 'idle' | 'working' | 'returning' | 'fleeing' | 'building' | 'withdrawing' | 'harvesting' | 'patrolling' | 'guarding' | 'attacking' | 'healing' | 'exploring';
  bodyValue?: number;  // Energy value of creep body
}

// Export extended Memory interface - this will merge with @types/screeps Memory
export interface Memory {
  uuid?: number;
  log?: any;
  rooms?: { [roomId: string]: RoomMemory };
  colony?: ColonyMemory;
  stats?: {
    cpuUsed: number;
    gcl: number;
    gpl: number;
  };
}
