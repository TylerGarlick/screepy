// Harvester Role - Early game energy collection (simpler than miner)
// Priority: High - basic energy income for new rooms

import { CreepMemory } from '../types/memory';

export class HarvesterRole {
  private creep: Creep;

  constructor(creep: Creep) {
    this.creep = creep;
  }

  /**
   * Execute harvester role logic
   */
  public run(): void {
    const state = this.creep.memory.state || 'harvesting';

    switch (state) {
      case 'harvesting':
        this.harvestEnergy();
        break;
      case 'returning':
        this.returnEnergy();
        break;
      case 'idle':
        this.findSource();
        break;
    }
  }

  /**
   * Harvest energy from source
   */
  private harvestEnergy(): void {
    const sourceId = this.creep.memory.sourceId;
    
    if (!sourceId) {
      this.findSource();
      return;
    }

    const source = Game.getObjectById<Source>(sourceId);
    
    if (!source) {
      this.creep.memory.state = 'idle';
      return;
    }

    // Harvest
    const result = this.creep.harvest(source);
    
    if (result === ERR_NOT_IN_RANGE) {
      this.creep.moveTo(source, { reusePath: 5, ignoreCreeps: true });
    } else if (result === OK) {
      this.creep.memory.working = true;
    }

    // Check if we should return
    if (this.creep.store.getFreeCapacity() === 0) {
      this.creep.memory.state = 'returning';
    }
  }

  /**
   * Return energy to storage/controller
   */
  private returnEnergy(): void {
    // Determine drop-off
    const storage = this.creep.room.storage;
    const controller = this.creep.room.controller;
    
    let dropoff: Structure | StructureController | null = storage || null;
    
    if (!dropoff && controller) {
      dropoff = controller;
    } else if (dropoff && 'store' in dropoff && dropoff.store.getFreeCapacity(RESOURCE_ENERGY) === 0 && controller) {
      dropoff = controller;
    }

    if (!dropoff) {
      // Try extensions
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
      this.creep.memory.state = 'harvesting';
      return;
    }

    // Transfer/upgrade
    if ('store' in dropoff) {
      const result = this.creep.transfer(dropoff as Structure, RESOURCE_ENERGY);
      
      if (result === ERR_NOT_IN_RANGE) {
        this.creep.moveTo(dropoff, { reusePath: 5 });
      } else if (result === OK || result === ERR_FULL) {
        this.creep.memory.state = 'harvesting';
      }
    } else if (dropoff instanceof StructureController) {
      const result = this.creep.upgradeController(dropoff);
      
      if (result === ERR_NOT_IN_RANGE) {
        this.creep.moveTo(dropoff, { reusePath: 5 });
      } else if (result === OK || result === ERR_NOT_ENOUGH_RESOURCES) {
        this.creep.memory.state = 'harvesting';
      }
    }
  }

  /**
   * Find an energy source
   */
  private findSource(): void {
    const sources = this.creep.room.find(FIND_SOURCES);
    
    if (sources.length === 0) {
      this.creep.memory.state = 'idle';
      return;
    }

    // Pick first available source
    const source = sources[0];
    this.creep.memory.sourceId = source.id;
    this.creep.memory.state = 'harvesting';
    this.creep.memory.working = true;
    
    console.log(`[${this.creep.name}] Found source ${source.id}`);
  }
}
