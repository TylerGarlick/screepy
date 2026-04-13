// Role Registry - Maps role names to role classes

import { MinerRole } from './miner';
import { HaulerRole } from './hauler';
import { HarvesterRole } from './harvester';
import { UpgraderRole } from './upgrader';
import { BuilderRole } from './builder';
import { RepairerRole } from './repairer';
import { GuardRole } from './guard';
import { ScoutRole } from './scout';
import { Role } from '../types/role';

export interface RoleExecutor {
  run(): void;
}

export class RoleRegistry {
  /**
   * Get role executor for a creep
   */
  public static getExecutor(creep: Creep): RoleExecutor {
    const role = creep.memory.role as Role;

    switch (role) {
      case Role.Miner:
        return new MinerRole(creep);
      case Role.Harvester:
        return new HarvesterRole(creep);
      case Role.Hauler:
        return new HaulerRole(creep);
      case Role.Upgrader:
        return new UpgraderRole(creep);
      case Role.Builder:
        return new BuilderRole(creep);
      case Role.Repairer:
        return new RepairerRole(creep);
      case Role.Guard:
        return new GuardRole(creep);
      case Role.Scout:
        return new ScoutRole(creep);
      default:
        // Default behavior: idle
        return {
          run: () => {
            creep.memory.state = 'idle';
          }
        };
    }
  }

  /**
   * Execute role logic for all creeps in room
   */
  public static executeAll(room: Room): void {
    const creeps = room.find(FIND_MY_CREEPS);

    for (const creep of creeps) {
      try {
        const executor = this.getExecutor(creep);
        executor.run();
      } catch (e) {
        console.log(`[RoleRegistry] Error executing ${creep.name}: ${e}`);
      }
    }
  }
}
