// Repairer Role - Structure maintenance and repair
// Priority: Medium-Low - maintains infrastructure

import { CreepMemory } from '../types/memory';

export class RepairerRole {
  private creep: Creep;

  constructor(creep: Creep) {
    this.creep = creep;
  }

  /**
   * Execute repairer role logic
   */
  public run(): void {
    const state = this.creep.memory.state || 'idle';

    switch (state) {
      case 'idle':
        this.findRepairTarget();
        break;
      case 'repairing':
        this.repair();
        break;
      case 'withdrawing':
        this.withdrawEnergy();
        break;
    }
  }

  /**
   * Find damaged structure to repair
   */
  private findRepairTarget(): void {
    // Find damaged structures
    const damaged = this.creep.room.find(FIND_STRUCTURES, {
      filter: (s: Structure) => s.hits < s.hitsMax && s.hitsMax > 0
    });

    if (damaged.length === 0) {
      this.creep.memory.state = 'idle';
      this.creep.memory.working = false;
      return;
    }

    // Prioritize by structure type
    const priorityOrder: { [key: string]: number } = {
      [STRUCTURE_SPAWN]: 10,
      [STRUCTURE_EXTENSION]: 9,
      [STRUCTURE_TOWER]: 8,
      [STRUCTURE_STORAGE]: 7,
      [STRUCTURE_LINK]: 6,
      [STRUCTURE_LAB]: 5,
      [STRUCTURE_TERMINAL]: 4,
      [STRUCTURE_CONTAINER]: 3,
      [STRUCTURE_ROAD]: 2,
      [STRUCTURE_WALL]: 1,
      [STRUCTURE_RAMPART]: 1
    };

    // Sort by priority and damage
    damaged.sort((a, b) => {
      const priorityA = priorityOrder[a.structureType] || 1;
      const priorityB = priorityOrder[b.structureType] || 1;
      const damageA = a.hitsMax - a.hits;
      const damageB = b.hitsMax - b.hits;
      
      return priorityB - priorityA || damageB - damageA;
    });

    const target = damaged[0];
    this.creep.memory.targetId = target.id;
    this.creep.memory.state = 'repairing';
    this.creep.memory.working = true;
  }

  /**
   * Repair damaged structure
   */
  private repair(): void {
    const targetId = this.creep.memory.targetId;
    
    if (!targetId) {
      this.creep.memory.state = 'idle';
      return;
    }

    const target = Game.getObjectById<Structure>(targetId);
    
    if (!target || target.hits >= target.hitsMax) {
      this.creep.memory.state = 'idle';
      return;
    }

    // Repair
    const result = this.creep.repair(target);
    
    if (result === ERR_NOT_IN_RANGE) {
      this.creep.moveTo(target, { reusePath: 5 });
    } else if (result === ERR_NOT_ENOUGH_RESOURCES) {
      this.creep.memory.state = 'withdrawing';
    } else if (result === OK) {
      this.creep.memory.working = true;
    }
  }

  /**
   * Withdraw energy for repairing
   */
  private withdrawEnergy(): void {
    // Priority: storage > spawn > extensions
    const storage = this.creep.room.storage;
    
    if (storage && storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
      const result = this.creep.withdraw(storage, RESOURCE_ENERGY);
      
      if (result === ERR_NOT_IN_RANGE) {
        this.creep.moveTo(storage, { reusePath: 5 });
      } else if (result === OK) {
        this.creep.memory.state = 'repairing';
      }
      return;
    }

    // Try spawn
    const spawns = this.creep.room.find(FIND_MY_SPAWNS, {
      filter: (s: Structure) => (s as StructureSpawn).energy > 0
    });

    if (spawns.length > 0) {
      const spawn = spawns[0];
      const result = this.creep.withdraw(spawn, RESOURCE_ENERGY);
      
      if (result === ERR_NOT_IN_RANGE) {
        this.creep.moveTo(spawn, { reusePath: 5 });
      } else if (result === OK) {
        this.creep.memory.state = 'repairing';
      }
    }
  }
}
