// Guard Role - Room defense and combat
// Priority: Variable - critical when threatened

import { CreepMemory } from '../types/memory';

export class GuardRole {
  private creep: Creep;

  constructor(creep: Creep) {
    this.creep = creep;
  }

  /**
   * Execute guard role logic
   */
  public run(): void {
    const state = this.creep.memory.state || 'idle';

    // Check for threats
    const threat = this.findThreat();
    
    if (threat) {
      this.engageThreat(threat);
      return;
    }

    // No threat, patrol or guard position
    switch (state) {
      case 'idle':
      case 'patrolling':
        this.patrol();
        break;
      case 'guarding':
        this.guardPosition();
        break;
      case 'attacking':
        this.attackTarget();
        break;
      case 'healing':
        this.healSelf();
        break;
    }
  }

  /**
   * Find enemy threats in room
   */
  private findThreat(): Creep | null {
    // Find hostile creeps
    const enemies = this.creep.room.find(FIND_HOSTILE_CREEPS);
    
    if (enemies.length === 0) {
      return null;
    }

    // Find closest enemy
    const closest = this.creep.pos.findClosestByRange(enemies);
    return closest;
  }

  /**
   * Engage threat
   */
  private engageThreat(threat: Creep): void {
    this.creep.memory.state = 'attacking';
    this.creep.memory.targetId = threat.id;
    this.creep.memory.working = true;

    // Check if we can ranged attack
    const range = this.creep.pos.getRangeTo(threat);
    
    if (range <= 3 && this.creep.getActiveBodyparts(RANGED_ATTACK) > 0) {
      this.creep.rangedAttack(threat);
    } else if (range <= 1 && this.creep.getActiveBodyparts(ATTACK) > 0) {
      this.creep.attack(threat);
    }

    // Move towards threat
    if (range > 1) {
      this.creep.moveTo(threat, { reusePath: 3, ignoreCreeps: false });
    }

    // Heal if damaged
    if (this.creep.hits < this.creep.hitsMax && this.creep.getActiveBodyparts(HEAL) > 0) {
      this.creep.heal(this.creep);
    }
  }

  /**
   * Patrol room perimeter
   */
  private patrol(): void {
    // Find guard positions from memory or create default
    const guardPositions = this.getGuardPositions();
    
    if (guardPositions.length === 0) {
      // No specific positions, wander room
      this.wander();
      return;
    }

    // Find closest guard position
    const pos = guardPositions[0]; // Simplified - should rotate
    const targetPos = new RoomPosition(pos.x, pos.y, this.creep.room.name);
    
    if (this.creep.pos.getRangeTo(targetPos) > 3) {
      this.creep.moveTo(targetPos, { reusePath: 10 });
      this.creep.memory.state = 'guarding';
    } else {
      this.creep.memory.state = 'guarding';
    }
  }

  /**
   * Guard a specific position
   */
  private guardPosition(): void {
    // Stay in position, watch for threats
    if (!this.findThreat()) {
      // Heal if damaged
      if (this.creep.hits < this.creep.hitsMax && this.creep.getActiveBodyparts(HEAL) > 0) {
        this.creep.heal(this.creep);
      }
    }
  }

  /**
   * Attack target
   */
  private attackTarget(): void {
    const targetId = this.creep.memory.targetId;
    
    if (!targetId) {
      this.creep.memory.state = 'idle';
      return;
    }

    const target = Game.getObjectById<Creep>(targetId);
    
    if (!target || !target.room || target.room.name !== this.creep.room.name) {
      this.creep.memory.state = 'idle';
      return;
    }

    // Attack
    const range = this.creep.pos.getRangeTo(target);
    
    if (range <= 3 && this.creep.getActiveBodyparts(RANGED_ATTACK) > 0) {
      this.creep.rangedAttack(target);
    } else if (range <= 1 && this.creep.getActiveBodyparts(ATTACK) > 0) {
      this.creep.attack(target);
    }

    // Move
    if (range > 1) {
      this.creep.moveTo(target, { reusePath: 3, ignoreCreeps: false });
    }

    // Heal
    if (this.creep.hits < this.creep.hitsMax && this.creep.getActiveBodyparts(HEAL) > 0) {
      this.creep.heal(this.creep);
    }
  }

  /**
   * Heal self when damaged
   */
  private healSelf(): void {
    if (this.creep.hits < this.creep.hitsMax && this.creep.getActiveBodyparts(HEAL) > 0) {
      this.creep.heal(this.creep);
    }
    
    if (this.creep.hits >= this.creep.hitsMax) {
      this.creep.memory.state = 'idle';
    }
  }

  /**
   * Wander room randomly
   */
  private wander(): void {
    const randomX = Math.floor(Math.random() * 50);
    const randomY = Math.floor(Math.random() * 50);
    const targetPos = new RoomPosition(randomX, randomY, this.creep.room.name);
    
    this.creep.moveTo(targetPos, { reusePath: 1 });
  }

  /**
   * Get guard positions for room
   */
  private getGuardPositions(): RoomPosition[] {
    // Return default positions near controller and sources
    const positions: RoomPosition[] = [];
    const controller = this.creep.room.controller;
    
    if (controller && controller.pos) {
      positions.push(controller.pos);
    }

    const sources = this.creep.room.find(FIND_SOURCES);
    for (const source of sources) {
      positions.push(source.pos);
    }

    return positions;
  }
}
