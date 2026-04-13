// Miner Role - Source mining with container support
// Priority: Highest - ensures energy income

import { CreepMemory } from '../types/memory';

export class MinerRole {
  private creep: Creep;

  constructor(creep: Creep) {
    this.creep = creep;
  }

  /**
   * Execute miner role logic
   */
  public run(): void {
    const sourceId = this.creep.memory.sourceId;
    
    if (!sourceId) {
      // Find and claim a source
      this.claimSource();
      return;
    }

    const source = Game.getObjectById<Source>(sourceId);
    
    if (!source) {
      // Source no longer exists, find new one
      delete this.creep.memory.sourceId;
      this.claimSource();
      return;
    }

    // Check if we need a container
    this.ensureContainer(source);

    // Harvest the source
    const result = this.creep.harvest(source);
    
    if (result === ERR_NOT_IN_RANGE) {
      this.creep.moveTo(source, { reusePath: 5, ignoreCreeps: true });
    } else if (result === OK) {
      this.creep.memory.working = true;
    }

    // Drop energy at container if full
    if (this.creep.store.getFreeCapacity() === 0) {
      this.dropEnergyAtContainer(source);
    }
  }

  /**
   * Claim an unreserved source
   */
  private claimSource(): void {
    const sources = this.creep.room.find(FIND_SOURCES);
    
    for (const source of sources) {
      // Check if source is already claimed
      const existingMiner = this.creep.room.find(FIND_MY_CREEPS, {
        filter: (c: Creep) => 
          c.memory.role === 'miner' && 
          c.memory.sourceId === source.id &&
          c.id !== this.creep.id
      });

      if (existingMiner.length === 0) {
        this.creep.memory.sourceId = source.id;
        this.creep.memory.state = 'working';
        console.log(`[${this.creep.name}] Claimed source ${source.id}`);
        return;
      }
    }

    // No available source, idle
    this.creep.memory.state = 'idle';
  }

  /**
   * Ensure container exists at source
   */
  private ensureContainer(source: Source): void {
    const container = source.pos.findInRange(FIND_STRUCTURES, 1, {
      filter: (s: Structure) => s.structureType === STRUCTURE_CONTAINER
    })[0];

    if (container) {
      return; // Container exists
    }

    // Check if construction site exists
    const site = source.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
      filter: (s: ConstructionSite) => s.structureType === STRUCTURE_CONTAINER
    })[0];

    if (!site) {
      // Place construction site for container
      this.creep.room.createConstructionSite(source.pos, STRUCTURE_CONTAINER);
      console.log(`[${this.creep.name}] Placed container site at source`);
    }
  }

  /**
   * Drop energy at container when full
   */
  private dropEnergyAtContainer(source: Source): void {
    const container = source.pos.findInRange(FIND_STRUCTURES, 1, {
      filter: (s: Structure) => s.structureType === STRUCTURE_CONTAINER
    })[0];

    if (container) {
      const result = this.creep.transfer(container, RESOURCE_ENERGY);
      
      if (result === ERR_NOT_IN_RANGE) {
        this.creep.moveTo(container, { reusePath: 5 });
      }
    } else {
      // No container, drop energy on ground
      this.creep.drop(RESOURCE_ENERGY);
    }
  }
}
