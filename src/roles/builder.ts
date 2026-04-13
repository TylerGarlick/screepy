// Builder Role - Construction of buildings
// Priority: Medium - infrastructure development

import { CreepMemory } from '../types/memory';

export class BuilderRole {
  private creep: Creep;

  constructor(creep: Creep) {
    this.creep = creep;
  }

  /**
   * Execute builder role logic
   */
  public run(): void {
    const state = this.creep.memory.state || 'idle';

    switch (state) {
      case 'idle':
        this.findConstructionSite();
        break;
      case 'building':
        this.build();
        break;
      case 'withdrawing':
        this.withdrawEnergy();
        break;
    }
  }

  /**
   * Find construction site to work on
   */
  private findConstructionSite(): void {
    // Find construction sites
    const sites = this.creep.room.find(FIND_CONSTRUCTION_SITES);
    
    if (sites.length === 0) {
      this.creep.memory.state = 'idle';
      this.creep.memory.working = false;
      return;
    }

    // Find closest site
    const site = this.creep.pos.findClosestByRange(sites);
    
    if (site) {
      this.creep.memory.targetId = site.id;
      this.creep.memory.state = 'building';
      this.creep.memory.working = true;
    }
  }

  /**
   * Build construction site
   */
  private build(): void {
    const targetId = this.creep.memory.targetId;
    
    if (!targetId) {
      this.creep.memory.state = 'idle';
      return;
    }

    const site = Game.getObjectById<ConstructionSite>(targetId);
    
    if (!site) {
      this.creep.memory.state = 'idle';
      return;
    }

    // Check if site is complete
    if (site.progress === site.progressTotal) {
      this.creep.memory.state = 'idle';
      return;
    }

    // Build
    const result = this.creep.build(site);
    
    if (result === ERR_NOT_IN_RANGE) {
      this.creep.moveTo(site, { reusePath: 5 });
    } else if (result === ERR_NOT_ENOUGH_RESOURCES) {
      this.creep.memory.state = 'withdrawing';
    } else if (result === OK) {
      this.creep.memory.working = true;
    }
  }

  /**
   * Withdraw energy for building
   */
  private withdrawEnergy(): void {
    // Priority: storage > spawn > extensions > controller
    const storage = this.creep.room.storage;
    
    if (storage && storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
      const result = this.creep.withdraw(storage, RESOURCE_ENERGY);
      
      if (result === ERR_NOT_IN_RANGE) {
        this.creep.moveTo(storage, { reusePath: 5 });
      } else if (result === OK) {
        this.creep.memory.state = 'building';
      }
      return;
    }

    // Try spawn
    const spawns = this.creep.room.find(FIND_MY_SPAWNS, {
      filter: (s: Structure) => s.energy > 0
    });

    if (spawns.length > 0) {
      const spawn = spawns[0];
      const result = this.creep.withdraw(spawn, RESOURCE_ENERGY);
      
      if (result === ERR_NOT_IN_RANGE) {
        this.creep.moveTo(spawn, { reusePath: 5 });
      } else if (result === OK) {
        this.creep.memory.state = 'building';
      }
    }
  }
}
