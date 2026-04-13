// Upgrader Role - Controller upgrading (uses energy surplus)
// Priority: Medium-Low - only when energy needs are met

import { CreepMemory } from '../types/memory';

export class UpgraderRole {
  private creep: Creep;

  constructor(creep: Creep) {
    this.creep = creep;
  }

  /**
   * Execute upgrader role logic
   */
  public run(): void {
    const controller = this.creep.room.controller;
    
    if (!controller) {
      this.creep.memory.state = 'idle';
      return;
    }

    // Check if we should be upgrading (energy surplus check)
    if (!this.shouldUpgrade()) {
      // Withdraw from storage if needed
      this.withdrawEnergy();
      return;
    }

    // Upgrade controller
    const result = this.creep.upgradeController(controller);
    
    if (result === ERR_NOT_IN_RANGE) {
      this.creep.moveTo(controller, { reusePath: 5 });
    } else if (result === ERR_NOT_ENOUGH_RESOURCES) {
      // Need more energy
      this.withdrawEnergy();
    } else if (result === OK) {
      this.creep.memory.working = true;
    }
  }

  /**
   * Check if we should upgrade (energy surplus)
   */
  private shouldUpgrade(): boolean {
    const storage = this.creep.room.storage;
    const energyInStorage = storage ? storage.store.getUsedCapacity(RESOURCE_ENERGY) : 0;
    
    // Only upgrade if we have surplus (>1000 in storage)
    return energyInStorage > 1000;
  }

  /**
   * Withdraw energy from storage
   */
  private withdrawEnergy(): void {
    const storage = this.creep.room.storage;
    
    if (!storage) {
      this.creep.memory.state = 'idle';
      return;
    }

    const energy = storage.store.getUsedCapacity(RESOURCE_ENERGY);
    
    if (energy > 0) {
      const result = this.creep.withdraw(storage, RESOURCE_ENERGY);
      
      if (result === ERR_NOT_IN_RANGE) {
        this.creep.moveTo(storage, { reusePath: 5 });
      }
    } else {
      this.creep.memory.state = 'idle';
    }
  }
}
