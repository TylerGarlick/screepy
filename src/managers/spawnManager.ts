// Spawn Manager - Dynamic creep spawning with body composition optimization
// Following maturity matrix: Dynamic Part Generation best practices

import { SpawnRequest } from '../types/task';
import { Role } from '../types/role';
import { CreepMemory } from '../types/memory';

export class SpawnManager {
  private room: Room;
  private spawn: StructureSpawn | null;

  constructor(room: Room) {
    this.room = room;
    this.spawn = this.getAvailableSpawn();
  }

  /**
   * Get available spawn structure
   */
  private getAvailableSpawn(): StructureSpawn | null {
    const spawns = this.room.find(FIND_MY_SPAWNS);
    return spawns.length > 0 ? spawns[0] : null;
  }

  /**
   * Process spawn queue and create creeps
   */
  public processSpawnQueue(requests: SpawnRequest[]): void {
    if (!this.spawn) return;

    // Sort by priority (highest first)
    requests.sort((a, b) => b.priority - a.priority);

    for (const request of requests) {
      const count = request.count || 1;
      
      for (let i = 0; i < count; i++) {
        if (!this.spawn || this.spawn.spawning) break;
        
        this.spawnCreep(request);
      }
    }
  }

  /**
   * Spawn a single creep based on request
   */
  private spawnCreep(request: SpawnRequest): void {
    if (!this.spawn) return;

    // Generate optimal body
    const body = request.body || this.generateBody(request.role);
    const energyCost = this.getBodyCost(body);

    // Check if we have enough energy
    if (energyCost > this.spawn.room.energyAvailable) {
      // Try to spawn a smaller version
      const reducedBody = this.reduceBody(body, this.spawn.room.energyAvailable);
      if (reducedBody.length < 3) {
        // Too small to be useful, skip
        return;
      }
      this.spawnCreepWithBody(reducedBody, request.role);
    } else {
      this.spawnCreepWithBody(body, request.role);
    }
  }

  /**
   * Spawn creep with specific body
   */
  private spawnCreepWithBody(body: BodyPartConstant[], role: Role): void {
    if (!this.spawn) return;

    const name = `${role.substr(0, 1).toUpperCase()}${role.substr(1)}-${Game.time}-${Math.random().toString(36).substr(2, 5)}`;
    
    const memory: CreepMemory = {
      role,
      room: this.room.name,
      working: false,
      state: 'idle',
      bodyValue: this.getBodyCost(body)
    };

    const result = this.spawn.spawnCreep(body, name, { memory });
    
    if (result === OK) {
      console.log(`[${this.room.name}] Spawning ${role} (${body.length} parts)`);
    }
  }

  /**
   * Generate optimal body for a role
   */
  private generateBody(role: Role): BodyPartConstant[] {
    switch (role) {
      case Role.Miner:
        return this.generateMinerBody();
      case Role.Harvester:
        return this.generateHarvesterBody();
      case Role.Hauler:
        return this.generateHaulerBody();
      case Role.Upgrader:
        return this.generateUpgraderBody();
      case Role.Builder:
        return this.generateBuilderBody();
      case Role.Repairer:
        return this.generateRepairerBody();
      case Role.Scout:
        return this.generateScoutBody();
      case Role.Guard:
        return this.generateGuardBody();
      case Role.RangedAttacker:
        return this.generateRangedAttackerBody();
      case Role.Healer:
        return this.generateHealerBody();
      case Role.Dismantler:
        return this.generateDismantlerBody();
      default:
        return [WORK, CARRY, MOVE];
    }
  }

  /**
   * Generate miner body - optimized for source mining
   */
  private generateMinerBody(): BodyPartConstant[] {
    // Standard miner: 3 WORK, 2 MOVE, 1 CARRY
    // Can be scaled up with more energy
    const baseBody: BodyPartConstant[] = [WORK, WORK, WORK, MOVE, MOVE, CARRY];
    return this.optimizeBody(baseBody, 300);
  }

  /**
   * Generate harvester body - early game energy collection
   */
  private generateHarvesterBody(): BodyPartConstant[] {
    // Balanced harvester: 2 WORK, 2 CARRY, 2 MOVE
    const baseBody: BodyPartConstant[] = [WORK, WORK, CARRY, CARRY, MOVE, MOVE];
    return this.optimizeBody(baseBody, 200);
  }

  /**
   * Generate hauler body - optimized for carrying capacity
   */
  private generateHaulerBody(): BodyPartConstant[] {
    // Maximize CARRY with enough MOVE
    const baseBody: BodyPartConstant[] = [];
    const maxEnergy = this.getMaxSpawnEnergy();
    
    // Each CARRY+MOVE pair costs 100 energy and carries 50 units
    const pairs = Math.floor(maxEnergy / 100);
    
    for (let i = 0; i < Math.min(pairs, 25); i++) {
      baseBody.push(CARRY, MOVE);
    }
    
    return baseBody.length > 0 ? baseBody : [CARRY, MOVE];
  }

  /**
   * Generate upgrader body - balanced for controller upgrading
   */
  private generateUpgraderBody(): BodyPartConstant[] {
    // 3 WORK, 2 CARRY, 2 MOVE
    const baseBody: BodyPartConstant[] = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];
    return this.optimizeBody(baseBody, 350);
  }

  /**
   * Generate builder body - similar to upgrader
   */
  private generateBuilderBody(): BodyPartConstant[] {
    // 3 WORK, 2 CARRY, 2 MOVE
    const baseBody: BodyPartConstant[] = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];
    return this.optimizeBody(baseBody, 350);
  }

  /**
   * Generate repairer body - similar to builder
   */
  private generateRepairerBody(): BodyPartConstant[] {
    // 3 WORK, 2 CARRY, 2 MOVE
    const baseBody: BodyPartConstant[] = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];
    return this.optimizeBody(baseBody, 350);
  }

  /**
   * Generate scout body - maximum movement
   */
  private generateScoutBody(): BodyPartConstant[] {
    // All MOVE parts for maximum speed
    const maxEnergy = this.getMaxSpawnEnergy();
    const moveCount = Math.floor(maxEnergy / 50);
    
    const body: BodyPartConstant[] = [];
    for (let i = 0; i < Math.min(moveCount, 50); i++) {
      body.push(MOVE);
    }
    
    return body.length > 0 ? body : [MOVE];
  }

  /**
   * Generate guard body - defensive combat
   */
  private generateGuardBody(): BodyPartConstant[] {
    // Balanced: TOUGH, ATTACK, MOVE, HEAL
    // Prioritize TOUGH for damage absorption
    const baseBody: BodyPartConstant[] = [
      TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
      ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,
      MOVE, MOVE, MOVE, MOVE, MOVE,
      HEAL, HEAL
    ];
    return this.optimizeBody(baseBody, 750);
  }

  /**
   * Generate ranged attacker body
   */
  private generateRangedAttackerBody(): BodyPartConstant[] {
    // Ranged combat with mobility
    const baseBody: BodyPartConstant[] = [
      RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK,
      MOVE, MOVE, MOVE, MOVE, MOVE,
      HEAL, HEAL
    ];
    return this.optimizeBody(baseBody, 600);
  }

  /**
   * Generate healer body
   */
  private generateHealerBody(): BodyPartConstant[] {
    // Maximum healing with mobility
    const baseBody: BodyPartConstant[] = [];
    const maxEnergy = this.getMaxSpawnEnergy();
    
    // Each HEAL+MOVE pair costs 100 energy
    const pairs = Math.floor(maxEnergy / 100);
    
    for (let i = 0; i < Math.min(pairs, 25); i++) {
      baseBody.push(HEAL, MOVE);
    }
    
    return baseBody.length > 0 ? baseBody : [HEAL, MOVE];
  }

  /**
   * Generate dismantler body - structure destruction
   */
  private generateDismantlerBody(): BodyPartConstant[] {
    // Maximum WORK parts for dismantling
    const baseBody: BodyPartConstant[] = [];
    const maxEnergy = this.getMaxSpawnEnergy();
    
    // Each WORK+MOVE pair costs 100 energy
    const pairs = Math.floor(maxEnergy / 100);
    
    for (let i = 0; i < Math.min(pairs, 25); i++) {
      baseBody.push(WORK, MOVE);
    }
    
    return baseBody.length > 0 ? baseBody : [WORK, MOVE];
  }

  /**
   * Optimize body to fit energy constraints
   */
  private optimizeBody(baseBody: BodyPartConstant[], targetEnergy: number): BodyPartConstant[] {
    const maxEnergy = this.getMaxSpawnEnergy();
    const energy = Math.min(targetEnergy, maxEnergy);
    
    const cost = this.getBodyCost(baseBody);
    
    if (cost <= energy) {
      return baseBody;
    }
    
    // Scale down proportionally
    return this.reduceBody(baseBody, energy);
  }

  /**
   * Reduce body to fit energy constraint
   */
  private reduceBody(body: BodyPartConstant[], maxEnergy: number): BodyPartConstant[] {
    const reduced: BodyPartConstant[] = [];
    let currentCost = 0;
    
    for (const part of body) {
      const partCost = BODYPART_COST[part];
      if (currentCost + partCost <= maxEnergy && reduced.length < 50) {
        reduced.push(part);
        currentCost += partCost;
      }
    }
    
    return reduced;
  }

  /**
   * Calculate total energy cost of a body
   */
  private getBodyCost(body: BodyPartConstant[]): number {
    return body.reduce((sum, part) => sum + BODYPART_COST[part], 0);
  }

  /**
   * Get maximum energy available for spawning
   */
  private getMaxSpawnEnergy(): number {
    if (!this.spawn) return 300;
    
    let energy = this.spawn.room.energyAvailable;
    const extensions = this.spawn.room.find(FIND_MY_STRUCTURES, {
      filter: (s: Structure) => s.structureType === STRUCTURE_EXTENSION
    });
    
    // Can use extension energy for spawning
    for (const ext of extensions) {
      energy += (ext as StructureExtension).energy;
    }
    
    return Math.min(energy, 300 + extensions.length * 50);
  }
}
