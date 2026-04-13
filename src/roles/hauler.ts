// Hauler Role - Energy transport from containers to storage/controller
// Priority: High - ensures energy distribution

import { CreepMemory } from '../types/memory';

export class HaulerRole {
  private creep: Creep;

  constructor(creep: Creep) {
    this.creep = creep;
  }

  /**
   * Execute hauler role logic
   */
  public run(): void {
    const state = this.creep.memory.state || 'idle';

    switch (state) {
      case 'idle':
        this.findWork();
        break;
      case 'hauling':
        this.haulEnergy();
        break;
      case 'returning':
        this.returnToSource();
        break;
    }
  }

  /**
   * Find work - containers with energy to haul
   */
  private findWork(): void {
    // Find containers with energy
    const containers = this.creep.room.find(FIND_STRUCTURES, {
      filter: (s: Structure) => {
        if (s.structureType !== STRUCTURE_CONTAINER) return false;
        const energy = (s as StructureContainer).store.getUsedCapacity(RESOURCE_ENERGY);
        return energy > 0;
      }
    });

    if (containers.length > 0) {
      // Pick closest container
      const container = this.creep.pos.findClosestByRange(containers);
      
      if (container) {
        this.creep.memory.targetId = container.id;
        this.creep.memory.state = 'hauling';
        this.creep.memory.working = true;
      }
    } else {
      // No containers, check for dropped energy
      const dropped = this.creep.room.find(FIND_DROPPED_RESOURCES, {
        filter: (r: Resource) => r.resourceType === RESOURCE_ENERGY && r.amount > 0
      });

      if (dropped.length > 0) {
        const resource = this.creep.pos.findClosestByRange(dropped);
        if (resource) {
          this.creep.memory.targetId = resource.id;
          this.creep.memory.state = 'hauling';
        }
      }
    }
  }

  /**
   * Haul energy from container/dropped resource
   */
  private haulEnergy(): void {
    const targetId = this.creep.memory.targetId;
    
    if (!targetId) {
      this.creep.memory.state = 'idle';
      return;
    }

    const target = Game.getObjectById<Resource | StructureContainer>(targetId);
    
    if (!target) {
      this.creep.memory.state = 'idle';
      return;
    }

    // Pick up energy
    if ('amount' in target) {
      // Dropped resource
      const result = this.creep.pickup(target as Resource);
      
      if (result === ERR_NOT_IN_RANGE) {
        this.creep.moveTo(target, { reusePath: 5 });
      }
    } else {
      // Container
      const energy = (target as StructureContainer).store.getUsedCapacity(RESOURCE_ENERGY);
      
      if (energy > 0) {
        const result = this.creep.withdraw(target, RESOURCE_ENERGY);
        
        if (result === ERR_NOT_IN_RANGE) {
          this.creep.moveTo(target, { reusePath: 5 });
        } else if (result === OK) {
          // Successfully withdrew, now deliver
          this.creep.memory.state = 'returning';
        }
      } else {
        // Container empty
        this.creep.memory.state = 'idle';
      }
    }
  }

  /**
   * Return to storage/controller with energy
   */
  private returnToSource(): void {
    // Determine drop-off point
    const storage = this.creep.room.storage;
    const controller = this.creep.room.controller;
    
    let dropoff: Structure | StructureController | null = storage;
    
    if (!dropoff || dropoff.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
      dropoff = controller;
    }

    if (!dropoff) {
      // No drop-off, find extensions or spawns
      const extensions = this.creep.room.find(FIND_MY_STRUCTURES, {
        filter: (s: Structure) => 
          s.structureType === STRUCTURE_EXTENSION && 
          (s as StructureExtension).energy < (s as StructureExtension).energyCapacity
      });

      if (extensions.length > 0) {
        dropoff = extensions[0];
      }
    }

    if (!dropoff) {
      this.creep.memory.state = 'idle';
      return;
    }

    // Transfer energy
    if ('store' in dropoff) {
      const result = this.creep.transfer(dropoff as Structure, RESOURCE_ENERGY);
      
      if (result === ERR_NOT_IN_RANGE) {
        this.creep.moveTo(dropoff, { reusePath: 5 });
      } else if (result === OK || result === ERR_FULL) {
        // Delivered or full, go back to work
        this.creep.memory.state = 'hauling';
      }
    } else if (dropoff instanceof StructureController) {
      // Upgrade controller
      const result = this.creep.upgradeController(dropoff);
      
      if (result === ERR_NOT_IN_RANGE) {
        this.creep.moveTo(dropoff, { reusePath: 5 });
      } else if (result === OK) {
        this.creep.memory.state = 'hauling';
      }
    }
  }
}
