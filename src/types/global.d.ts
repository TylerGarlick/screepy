// Type augmentation for Screeps global interfaces
// This file augments the global Memory and CreepMemory interfaces

// Augment the global Memory interface
declare global {
  interface Memory {
    uuid?: number;
    log?: any;
    rooms?: { [roomId: string]: any };
    colony?: any;
    stats?: {
      cpuUsed: number;
      gcl: number;
      gpl: number;
    };
  }
}

// Augment the global CreepMemory interface  
declare global {
  interface CreepMemory {
    role?: string;
    room?: string;
    working?: boolean;
    taskId?: string;
    targetId?: string;
    sourceId?: string;
    homeRoom?: string;
    state?: 'idle' | 'working' | 'returning' | 'fleeing';
    bodyValue?: number;
  }
}

// Augment Room constructor with parseRoomName
declare global {
  interface RoomConstructor {
    parseRoomName(roomName: string): [number, number] | null;
  }
}

// This export is needed to make this a module file, but we use declare global
// so the declarations still augment the global scope
export {};
