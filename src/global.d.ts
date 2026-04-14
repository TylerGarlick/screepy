// Global type augmentations for Screeps
// This file extends the global interfaces from @types/screeps

export {};

declare global {
  // Extend Memory interface - use any to avoid type merging issues
  interface Memory {
    uuid?: number;
    log?: any;
    rooms?: any;
    colony?: any;
    stats?: any;
  }

  // Extend CreepMemory interface
  interface CreepMemory {
    role?: string;
    room?: string;
    working?: boolean;
    taskId?: string;
    targetId?: string;
    sourceId?: string;
    homeRoom?: string;
    state?: string;
    bodyValue?: number;
  }

  // Extend Room constructor
  interface RoomConstructor {
    parseRoomName(roomName: string): [number, number] | null;
  }
}
