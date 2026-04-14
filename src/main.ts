import { ErrorMapper } from './utils/ErrorMapper'
import { RoleRegistry } from './roles'
import { TaskManager } from './managers/taskManager'
import { SpawnManager } from './managers/spawnManager'

// Initialize memory if needed
function initializeMemory(): void {
  if (!Memory.uuid) {
    Memory.uuid = Game.time
  }
  
  if (!Memory.rooms) {
    Memory.rooms = {}
  }
  
  if (!Memory.colony) {
    Memory.colony = {
      ownedRooms: [],
      expansionTargets: [],
      marketOrders: [],
      remoteRooms: []
    }
  }
  
  if (!Memory.stats) {
    Memory.stats = {
      cpuUsed: 0,
      gcl: Game.gcl.level,
      gpl: Game.gpl ? Game.gpl.level : 0
    }
  }
}

// Process each owned room
function processRooms(): void {
  const cpuStart = Game.cpu.getUsed()
  
  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName]
    
    // Only process rooms we control
    if (!room.controller || room.controller.owner?.username !== Game.spawns.MySpawn?.owner.username) {
      continue
    }
    
    try {
      // Initialize room memory
      if (!Memory.rooms[roomName]) {
        Memory.rooms[roomName] = {
          roleCount: {},
          spawnQueue: [],
          taskQueue: [],
          sources: [],
          constructionPlan: { sites: [], priority: 'spawn' },
          defensePlan: { ramparts: [], walls: [], towerPositions: [], guardPositions: [] },
          lastUpdate: Game.time
        }
      }
      
      // Task management
      const taskManager = new TaskManager(room)
      const tasks = taskManager.generateTasks()
      
      // Store tasks in memory
      Memory.rooms[roomName].taskQueue = tasks
      Memory.rooms[roomName].lastUpdate = Game.time
      
      // Spawn management
      const spawnRequests = taskManager.getSpawnRequests()
      Memory.rooms[roomName].spawnQueue = spawnRequests
      
      const spawnManager = new SpawnManager(room)
      spawnManager.processSpawnQueue(spawnRequests)
      
      // Execute creep roles
      RoleRegistry.executeAll(room)
      
      // Update room memory in colony
      if (!Memory.colony.ownedRooms.includes(roomName)) {
        Memory.colony.ownedRooms.push(roomName)
        console.log(`[Colony] Claimed room ${roomName}`)
      }
    } catch (e) {
      console.log(`[Room ${roomName}] Error: ${e}`)
    }
  }
  
  const cpuEnd = Game.cpu.getUsed()
  Memory.stats.cpuUsed = cpuEnd - cpuStart
}

// Clean up dead creep memory
function cleanupMemory(): void {
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name]
    }
  }
}

// Main game loop
export const loop = ErrorMapper.wrapLoop(() => {
  // Initialize
  initializeMemory()
  
  // Cleanup
  cleanupMemory()
  
  // Process rooms
  processRooms()
  
  // Log stats
  if (Game.time % 100 === 0) {
    console.log(`[Stats] Tick ${Game.time}, CPU: ${Memory.stats.cpuUsed.toFixed(2)}, GCL: ${Memory.stats.gcl}`)
  }
})
