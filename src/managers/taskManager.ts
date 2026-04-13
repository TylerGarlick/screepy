// Task Manager - Generates and manages task queue for each room
// Following maturity matrix: Queue System best practices

import { Task, TaskType, TaskData, SpawnRequest } from '../types/task';
import { Role, Priority } from '../types/role';

export class TaskManager {
  private roomId: string;
  private room: Room;

  constructor(room: Room) {
    this.roomId = room.name;
    this.room = room;
  }

  /**
   * Generate tasks for the current tick based on room state
   */
  public generateTasks(): Task[] {
    const tasks: Task[] = [];

    // Energy harvesting tasks (Priority: High)
    tasks.push(...this.generateHarvestTasks());

    // Hauling tasks (Priority: High)
    tasks.push(...this.generateHaulTasks());

    // Construction tasks (Priority: Medium)
    tasks.push(...this.generateBuildTasks());

    // Repair tasks (Priority: Medium-Low)
    tasks.push(...this.generateRepairTasks());

    // Upgrade tasks (Priority: Low, when surplus)
    tasks.push(...this.generateUpgradeTasks());

    // Defense tasks (Priority: Critical)
    tasks.push(...this.generateDefenseTasks());

    // Scouting tasks (Priority: Low)
    tasks.push(...this.generateScoutTasks());

    return tasks;
  }

  /**
   * Generate harvest tasks for each source
   */
  private generateHarvestTasks(): Task[] {
    const tasks: Task[] = [];
    const sources = this.room.find(FIND_SOURCES);

    for (const source of sources) {
      // Check if source has a container (drop-mining setup)
      const container = source.pos.findInRange(FIND_STRUCTURES, 1, {
        filter: (s: Structure) => s.structureType === STRUCTURE_CONTAINER
      })[0];

      const taskData: TaskData = {
        sourceId: source.id,
        amount: source.energyCapacity
      };

      tasks.push({
        id: `harvest-${source.id}`,
        type: TaskType.Harvest,
        priority: Priority.High,
        roomId: this.roomId,
        targetId: source.id,
        data: taskData,
        createdAt: Game.time
      });
    }

    return tasks;
  }

  /**
   * Generate haul tasks for energy transport
   */
  private generateHaulTasks(): Task[] {
    const tasks: Task[] = [];
    const storage = this.room.storage;
    const controller = this.room.controller;

    // Find containers with energy
    const containers = this.room.find(FIND_STRUCTURES, {
      filter: (s: Structure) => 
        s.structureType === STRUCTURE_CONTAINER && 
        (s as StructureContainer).store.getUsedCapacity(RESOURCE_ENERGY) > 0
    });

    for (const container of containers) {
      const energy = (container as StructureContainer).store.getUsedCapacity(RESOURCE_ENERGY);
      
      // Determine drop-off point
      const dropoff = storage || controller;
      if (!dropoff) continue;

      tasks.push({
        id: `haul-${container.id}`,
        type: TaskType.Haul,
        priority: Priority.High,
        roomId: this.roomId,
        targetId: container.id,
        data: {
          fromId: container.id,
          toId: dropoff.id,
          resourceType: RESOURCE_ENERGY,
          amount: energy
        } as TaskData,
        createdAt: Game.time
      });
    }

    return tasks;
  }

  /**
   * Generate build tasks from construction sites
   */
  private generateBuildTasks(): Task[] {
    const tasks: Task[] = [];
    const sites = this.room.find(FIND_CONSTRUCTION_SITES);

    for (const site of sites) {
      const remainingWork = site.progressTotal - site.progress;
      
      tasks.push({
        id: `build-${site.id}`,
        type: TaskType.Build,
        priority: Priority.Medium,
        roomId: this.roomId,
        targetId: site.id,
        data: {
          structureId: site.id,
          structureType: site.structureType,
          remainingWork
        } as TaskData,
        createdAt: Game.time
      });
    }

    return tasks;
  }

  /**
   * Generate repair tasks for damaged structures
   */
  private generateRepairTasks(): Task[] {
    const tasks: Task[] = [];
    
    // Find damaged structures (exclude walls/ramparts unless critical)
    const damaged = this.room.find(FIND_STRUCTURES, {
      filter: (s: Structure) => s.hits < s.hitsMax && s.hitsMax > 0
    });

    // Priority: spawn > extensions > towers > storage > links > labs > terminal > roads > containers
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

    for (const structure of damaged) {
      const damage = structure.hitsMax - structure.hits;
      const priority = priorityOrder[structure.structureType] || 1;
      
      // Only repair if damage is significant (>10% or >1000 hits)
      if (damage > Math.max(structure.hitsMax * 0.1, 1000)) {
        tasks.push({
          id: `repair-${structure.id}`,
          type: TaskType.Repair,
          priority: priority,
          roomId: this.roomId,
          targetId: structure.id,
          data: {
            structureId: structure.id,
            remainingWork: damage
          } as TaskData,
          createdAt: Game.time
        });
      }
    }

    return tasks;
  }

  /**
   * Generate upgrade tasks (only when energy surplus)
   */
  private generateUpgradeTasks(): Task[] {
    const tasks: Task[] = [];
    const controller = this.room.controller;

    if (!controller) return tasks;

    // Check if we have energy surplus
    const storage = this.room.storage;
    const energyAvailable = storage ? storage.store.getUsedCapacity(RESOURCE_ENERGY) : 0;
    const spawns = this.room.find(FIND_MY_SPAWNS);
    const totalEnergy = spawns.reduce((sum, s) => sum + s.energy, 0) + energyAvailable;

    // Only upgrade if we have surplus (>1500 energy)
    if (totalEnergy > 1500 && controller.level < 8) {
      tasks.push({
        id: `upgrade-${controller.id}`,
        type: TaskType.Upgrade,
        priority: Priority.Low,
        roomId: this.roomId,
        targetId: controller.id,
        data: {},
        createdAt: Game.time
      });
    }

    return tasks;
  }

  /**
   * Generate defense tasks based on threats
   */
  private generateDefenseTasks(): Task[] {
    const tasks: Task[] = [];

    // Check for enemy creeps in room
    const enemies = this.room.find(FIND_HOSTILE_CREEPS);
    
    if (enemies.length > 0) {
      // Generate combat tasks for each enemy
      for (const enemy of enemies) {
        const threatLevel = this.calculateThreatLevel(enemy);
        
        tasks.push({
          id: `combat-${enemy.id}`,
          type: TaskType.Combat,
          priority: Priority.Critical,
          roomId: this.roomId,
          targetId: enemy.id,
          data: {
            targetCreepId: enemy.id,
            threatLevel
          } as TaskData,
          createdAt: Game.time
        });
      }
    }

    return tasks;
  }

  /**
   * Generate scout tasks for exploration
   */
  private generateScoutTasks(): Task[] {
    const tasks: Task[] = [];

    // Scout adjacent rooms if we have CPU surplus
    const exits = this.room.find(FIND_EXIT);
    
    if (exits.length > 0 && Game.time % 100 === 0) {
      // Periodically scout adjacent rooms
      const adjacentRooms = this.getAdjacentRooms();
      
      for (const roomName of adjacentRooms) {
        if (!Memory.colony?.ownedRooms?.includes(roomName)) {
          tasks.push({
            id: `scout-${roomName}`,
            type: TaskType.Scout,
            priority: Priority.Background,
            roomId: this.roomId,
            data: {
              exploreRoom: roomName
            } as TaskData,
            createdAt: Game.time,
            expiresAt: Game.time + 500
          });
        }
      }
    }

    return tasks;
  }

  /**
   * Calculate threat level of an enemy creep
   */
  private calculateThreatLevel(creep: Creep): number {
    let threat = 0;
    
    // Count attack parts
    threat += creep.getActiveBodyparts(ATTACK) * 30;
    threat += creep.getActiveBodyparts(RANGED_ATTACK) * 10;
    threat += creep.getActiveBodyparts(WORK) * 50; // Can dismantle
    
    // Reduce threat by heal parts (they heal damage)
    threat -= creep.getActiveBodyparts(HEAL) * 12;
    
    // Increase threat if targeting our structures
    if (creep.ticksToLive && creep.ticksToLive < 100) {
      threat *= 1.5; // Desperate enemy
    }

    return threat;
  }

  /**
   * Get list of adjacent room names
   */
  private getAdjacentRooms(): string[] {
    const adjacent: string[] = [];
    const coords = Room.parseRoomName(this.roomId);
    
    if (!coords) return adjacent;

    const [x, y] = coords;
    const directions = [
      [x-1, y], [x+1, y], [x, y-1], [x, y+1],
      [x-1, y-1], [x+1, y+1], [x-1, y+1], [x+1, y-1]
    ];

    for (const [dx, dy] of directions) {
      if (dx >= 0 && dx <= 60 && dy >= 0 && dy <= 60) {
        adjacent.push(`${dx >= 10 ? dx : '0'+dx}${dy >= 10 ? dy : '0'+dy}`);
      }
    }

    return adjacent;
  }

  /**
   * Get spawn requests based on task demand
   */
  public getSpawnRequests(): SpawnRequest[] {
    const requests: SpawnRequest[] = [];
    const tasks = this.generateTasks();
    const creeps = this.room.find(FIND_MY_CREEPS);
    
    // Count creeps by role
    const roleCount: { [role: string]: number } = {};
    for (const creep of creeps) {
      const role = creep.memory.role;
      roleCount[role] = (roleCount[role] || 0) + 1;
    }

    // Count tasks by type
    const taskCount: { [type: string]: number } = {};
    for (const task of tasks) {
      if (!task.assignedTo) {
        taskCount[task.type] = (taskCount[task.type] || 0) + 1;
      }
    }

    // Generate spawn requests based on unmet demand
    const roleMapping: { [taskType: string]: Role } = {
      [TaskType.Harvest]: Role.Miner,
      [TaskType.Haul]: Role.Hauler,
      [TaskType.Build]: Role.Builder,
      [TaskType.Repair]: Role.Repairer,
      [TaskType.Upgrade]: Role.Upgrader,
      [TaskType.Combat]: Role.Guard,
      [TaskType.Scout]: Role.Scout
    };

    for (const [taskType, count] of Object.entries(taskCount)) {
      const role = roleMapping[taskType];
      const currentCount = roleCount[role] || 0;
      
      // Spawn if we have more tasks than creeps
      if (count > currentCount) {
        requests.push({
          role,
          priority: Priority[taskType === TaskType.Combat ? 'Critical' : 'High'],
          count: count - currentCount
        });
      }
    }

    // Always maintain minimum economic base
    if (!roleCount[Role.Miner]) {
      requests.push({ role: Role.Miner, priority: Priority.High, count: 1 });
    }
    if (!roleCount[Role.Hauler]) {
      requests.push({ role: Role.Hauler, priority: Priority.High, count: 1 });
    }

    return requests;
  }
}
