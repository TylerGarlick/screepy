// Scout Role - Room exploration and intelligence gathering
// Priority: Low - provides strategic information

import { CreepMemory } from '../types/memory';

export class ScoutRole {
  private creep: Creep;

  constructor(creep: Creep) {
    this.creep = creep;
  }

  /**
   * Execute scout role logic
   */
  public run(): void {
    const state = this.creep.memory.state || 'exploring';

    switch (state) {
      case 'exploring':
        this.explore();
        break;
      case 'returning':
        this.returnHome();
        break;
    }
  }

  /**
   * Explore adjacent rooms
   */
  private explore(): void {
    const currentRoom = this.creep.room;
    
    // Check if we're at an exit
    const atExit = this.isAtExit();
    
    if (atExit) {
      // Move to adjacent room
      this.moveToAdjacentRoom();
    } else {
      // Explore current room
      this.exploreRoom();
    }

    // Report findings
    this.reportFindings();
  }

  /**
   * Check if at room exit
   */
  private isAtExit(): boolean {
    const pos = this.creep.pos;
    return pos.x === 0 || pos.x === 49 || pos.y === 0 || pos.y === 49;
  }

  /**
   * Move to adjacent room
   */
  private moveToAdjacentRoom(): void {
    const pos = this.creep.pos;
    let dx = 0, dy = 0;

    if (pos.x === 0) dx = -1;
    else if (pos.x === 49) dx = 1;
    else if (pos.y === 0) dy = -1;
    else if (pos.y === 49) dy = 1;

    // Move in direction
    const direction = this.getDirection(dx, dy);
    this.creep.move(direction);
  }

  /**
   * Get direction from dx, dy
   */
  private getDirection(dx: number, dy: number): DirectionConstant {
    if (dx === -1 && dy === 0) return LEFT;
    if (dx === 1 && dy === 0) return RIGHT;
    if (dx === 0 && dy === -1) return TOP;
    if (dx === 0 && dy === 1) return BOTTOM;
    if (dx === -1 && dy === -1) return TOP_LEFT;
    if (dx === 1 && dy === -1) return TOP_RIGHT;
    if (dx === -1 && dy === 1) return BOTTOM_LEFT;
    if (dx === 1 && dy === 1) return BOTTOM_RIGHT;
    return RIGHT; // Default
  }

  /**
   * Explore current room
   */
  private exploreRoom(): void {
    // Move to unexplored area or random position
    const randomX = Math.floor(Math.random() * 50);
    const randomY = Math.floor(Math.random() * 50);
    const targetPos = new RoomPosition(randomX, randomY, this.creep.room.name);
    
    this.creep.moveTo(targetPos, { reusePath: 1 });
  }

  /**
   * Report findings (sources, enemies, etc.)
   */
  private reportFindings(): void {
    // Report sources
    const sources = this.creep.room.find(FIND_SOURCES);
    if (sources.length > 0) {
      console.log(`[Scout ${this.creep.name}] Room ${this.creep.room.name} has ${sources.length} sources`);
      
      // Store in memory for colony manager
      if (!Memory.colony) {
        Memory.colony = { ownedRooms: [], expansionTargets: [], marketOrders: [], remoteRooms: [] };
      }
      
      // Check if this room should be an expansion target
      const existing = Memory.colony.expansionTargets.find(t => t.roomName === this.creep.room.name);
      
      if (!existing && sources.length >= 2) {
        Memory.colony.expansionTargets.push({
          roomName: this.creep.room.name,
          score: sources.length * 10,
          sources: sources.length,
          distance: 0 // Should calculate from home room
        });
      }
    }

    // Report enemies
    const enemies = this.creep.room.find(FIND_HOSTILE_CREEPS);
    if (enemies.length > 0) {
      console.log(`[Scout ${this.creep.name}] Hostiles in ${this.creep.room.name}: ${enemies.length}`);
    }

    // Report controller status
    const controller = this.creep.room.controller;
    if (controller) {
      if (controller.owner) {
        console.log(`[Scout ${this.creep.name}] Room ${this.creep.room.name} owned by ${controller.owner.username}`);
      } else {
        console.log(`[Scout ${this.creep.name}] Room ${this.creep.room.name} is unclaimed (RCL ${controller.level})`);
      }
    }
  }

  /**
   * Return to home room
   */
  private returnHome(): void {
    const homeRoom = this.creep.memory.homeRoom;
    
    if (!homeRoom || homeRoom === this.creep.room.name) {
      this.creep.memory.state = 'exploring';
      return;
    }

    // Move towards home room (simplified - should use pathfinding)
    const coords = Room.parseRoomName(homeRoom);
    if (coords) {
      const [targetX, targetY] = coords;
      const currentCoords = Room.parseRoomName(this.creep.room.name);
      
      if (currentCoords) {
        const [currentX, currentY] = currentCoords;
        const dx = Math.sign(targetX - currentX);
        const dy = Math.sign(targetY - currentY);
        
        const direction = this.getDirection(dx, dy);
        this.creep.move(direction);
      }
    }
  }
}
