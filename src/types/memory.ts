// Memory interface with task queue and colony management
import { RoomMemory, ColonyMemory } from './task';

export interface CreepMemory {
  role: string;
  room: string;
  working: boolean;
  taskId?: string;
  targetId?: string;
  sourceId?: string;
  homeRoom?: string;
  state?: 'idle' | 'working' | 'returning' | 'fleeing';
  bodyValue?: number;  // Energy value of creep body
}

export interface Memory {
  uuid: number;
  log: any;
  rooms: { [roomId: string]: RoomMemory };
  colony: ColonyMemory;
  stats: {
    cpuUsed: number;
    gcl: number;
    gpl: number;
  };
}
