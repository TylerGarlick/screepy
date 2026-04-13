# Screepy - Winning Screeps AI Bot

## Overview

Screepy is a TypeScript-based Screeps AI bot designed to compete and win. This bot implements a **task-based management system** with dynamic creep spawning, automated base building, and intelligent combat logic.

## Architecture

### Core Philosophy

Following the **Maturity Matrix** best practices, this bot implements:

1. **Queue-based task management** - Creeps pull tasks from a global queue
2. **Dynamic part generation** - Creep bodies adapt to available energy and needs
3. **Room-level autonomy** - Each room manages its own operations
4. **Colony-level coordination** - Multi-room resource balancing and expansion

### Directory Structure

```
src/
├── main.ts                 # Entry point, game loop
├── types/                  # TypeScript type definitions
│   ├── index.ts           # Type exports
│   ├── memory.ts          # Memory interface
│   ├── role.ts            # Role definitions
│   └── task.ts            # Task queue types
├── roles/                  # Creep role implementations
│   ├── index.ts           # Role registry
│   ├── harvester.ts       # Energy harvesting
│   ├── upgrader.ts        # Controller upgrading
│   ├── builder.ts         # Construction
│   ├── repairer.ts        # Structure repair
│   ├── hauler.ts          # Resource transport
│   ├── miner.ts           # Source mining
│   ├── scout.ts           # Room scouting
│   └── guard.ts           # Room defense
├── tasks/                  # Task definitions
│   ├── index.ts           # Task registry
│   ├── harvest.ts         # Harvesting task
│   ├── upgrade.ts         # Upgrading task
│   ├── build.ts           # Building task
│   ├── repair.ts          # Repair task
│   ├── haul.ts            # Hauling task
│   └── combat.ts          # Combat task
├── managers/               # High-level management
│   ├── index.ts           # Manager exports
│   ├── spawnManager.ts    # Creep spawning logic
│   ├── taskManager.ts     # Task queue management
│   ├── roomManager.ts     # Room operations
│   ├── colonyManager.ts   # Multi-room coordination
│   └── defenseManager.ts  # Combat & defense
├── utils/                  # Utility functions
│   ├── ErrorMapper.ts     # Stack trace mapping
│   ├── pathfinder.ts      # Custom pathfinding
│   ├── logger.ts          # Logging utilities
│   └── profiler.ts        # CPU profiling
└── constants/              # Game constants
    ├── index.ts           # Constant exports
    ├── roles.ts           # Role configurations
    └── priorities.ts      # Task priorities
```

## Game Loop Architecture

### Tick Execution Flow

```
1. Error wrapper (ErrorMapper.wrapLoop)
2. Memory cleanup (remove dead creeps)
3. Room manager iteration
   └─ For each owned room:
      a. Task manager: Generate tasks based on room state
      b. Spawn manager: Queue creeps based on task demand
      c. Role executor: Assign creeps to tasks
      d. Task executor: Execute assigned tasks
4. Colony manager: Multi-room coordination
5. Defense manager: Combat operations
```

### CPU Budget Allocation

- **Room Operations**: 50% (harvesting, building, upgrading)
- **Task Management**: 20% (task generation, assignment)
- **Spawning Logic**: 15% (creep creation, body composition)
- **Combat/Defense**: 10% (tower targeting, guard logic)
- **Logging/Profiling**: 5%

## Creep Roles

### Economic Roles

| Role | Purpose | Body Composition | Priority |
|------|---------|------------------|----------|
| **Miner** | Extract energy from sources | [WORK×3, MOVE×2, CARRY×1] | Highest |
| **Harvester** | Early-game energy collection | [WORK×2, CARRY×2, MOVE×2] | High |
| **Hauler** | Transport energy to storage | [CARRY×5, MOVE×5] | High |
| **Upgrader** | Upgrade room controller | [WORK×3, CARRY×2, MOVE×2] | Medium |
| **Builder** | Construct buildings | [WORK×3, CARRY×2, MOVE×2] | Medium |
| **Repairer** | Maintain structures | [WORK×3, CARRY×2, MOVE×2] | Low |
| **Scout** | Explore adjacent rooms | [MOVE×10] | Low |

### Combat Roles

| Role | Purpose | Body Composition | Priority |
|------|---------|------------------|----------|
| **Guard** | Room defense | [TOUGH×5, ATTACK×5, MOVE×5, HEAL×2] | Variable |
| **RangedAttacker** | Ranged combat | [RANGED_ATTACK×5, MOVE×5, HEAL×2] | Variable |
| **Healer** | Support healing | [HEAL×10, MOVE×10] | Variable |
| **Dismantler** | Structure destruction | [WORK×10, MOVE×10] | Variable |

## Task System

### Task Queue Architecture

Tasks are generated each tick based on room needs:

```typescript
interface Task {
  id: string;
  type: TaskType;
  priority: number;
  roomId: string;
  targetId?: string;
  data: any;
  assignedTo?: string;
  createdAt: number;
}
```

### Task Generation Logic

1. **Energy Tasks** (Priority 10)
   - Harvest from sources
   - Haul to storage/controller

2. **Infrastructure Tasks** (Priority 5)
   - Build planned structures
   - Repair damaged buildings

3. **Upgrade Tasks** (Priority 3)
   - Upgrade controller (when energy surplus)

4. **Defense Tasks** (Priority 15)
   - Guard threatened positions
   - Attack enemy creeps

## Spawning System

### Dynamic Body Generation

Creep bodies are generated based on:

1. **Available Energy** - Current spawn + extensions energy
2. **Task Requirements** - What work needs to be done
3. **Room Layout** - Distance calculations for MOVE parts
4. **Enemy Presence** - Combat body composition if threatened

### Spawning Priority Queue

```typescript
const spawnQueue = [
  { role: 'miner', count: 2, priority: 10 },      // Always need miners
  { role: 'hauler', count: 2, priority: 9 },       // Energy transport
  { role: 'upgrader', count: 1, priority: 5 },     // Controller upgrades
  { role: 'builder', count: 1, priority: 5 },      // Construction
  { role: 'repairer', count: 1, priority: 3 },     // Maintenance
  { role: 'scout', count: 1, priority: 2 },        // Exploration
  { role: 'guard', count: 0, priority: 15 }        // Defense (as needed)
];
```

## Memory Management

### Memory Structure

```typescript
interface Memory {
  uuid: number;              // Unique identifier
  log: any;                  // Log messages
  rooms: {                   // Room-specific memory
    [roomId: string]: RoomMemory;
  };
  tasks: Task[];             // Global task queue
  colony: {                  // Colony-wide data
    ownedRooms: string[];
    expansionTargets: RoomPosition[];
  };
}

interface RoomMemory {
  roleCount: { [role: string]: number };
  spawnQueue: SpawnRequest[];
  taskQueue: Task[];
  sources: SourceInfo[];
  constructionPlan: ConstructionSite[];
  defensePlan: DefensePosition[];
}
```

### Memory Optimization

- Use compression for large data structures
- Remove stale task references
- Cache frequently accessed Game objects
- Use IDs instead of full object references

## Base Planning

### Automated Structure Placement

1. **Spawn/Extension Cluster** - Central hub for spawning
2. **Storage Position** - Near spawn for easy access
3. **Tower Ring** - Defensive perimeter (RCL 3+)
4. **Link Network** - Energy transport (RCL 5+)
5. **Lab Cluster** - Boosting operations (RCL 6+)
6. **Factory** - Resource processing (RCL 7+)
7. **Nuker** - Strategic offense (RCL 8)

### Road Network

- Connect spawn to sources
- Connect spawn to controller
- Connect storage to key structures
- Minimize road count for efficiency

## Combat Strategy

### Defensive Posture

1. **Tower Targeting Priority**:
   - Enemy attackers targeting my structures
   - Enemy healers supporting attackers
   - Enemy ranged attackers
   - Enemy melee attackers
   - Invader creeps

2. **Wall/Rampart Strategy**:
   - Outer wall delays enemies
   - Inner ramparts protect key structures
   - Repair priority: ramparts > walls > other

3. **Guard Positioning**:
   - Station at choke points
   - Patrol perimeter when no threat
   - Retreat to towers when overwhelmed

### Offensive Operations

1. **Target Scoring**:
   - Room controller (claim/destroy)
   - Spawns (prevent respawns)
   - Towers (reduce defense)
   - Storage/Terminal (economic damage)
   - Extensions/Spawns (reduce spawn capacity)

2. **Attack Composition**:
   - Ranged attackers for structure damage
   - Healers for sustainability
   - Dismantlers for walls/ramparts
   - Minimum 4-creep squad for effectiveness

## Multi-Room Operations

### Expansion Criteria

Expand when:
- Current room RCL ≥ 6
- Energy surplus > 500/tick
- Have spare CPU for management
- Adjacent room has ≥2 sources

### Resource Balancing

- Terminal transfers between rooms
- Link network for energy transport
- Hauler caravans for remote mining
- Market trading for surplus resources

## Configuration

### Setup Instructions

1. **Install Dependencies**
   ```bash
   cd /root/.openclaw/workspace/projects/screepy
   npm install
   ```

2. **Configure Server Connection**
   ```bash
   cp screeps.sample.json screeps.json
   # Edit screeps.json with your credentials
   ```

3. **Build and Upload**
   ```bash
   npm run push-main    # Push to main server
   npm run push-sim     # Push to simulation
   npm run watch-main   # Watch and auto-upload
   ```

### Environment Variables

- `DEST` - Target server (main, pserver, sim)
- `EMAIL` - Screeps account email
- `PASSWORD` - Screeps account password
- `BRANCH` - Code branch name

## Performance Targets

### CPU Usage

- **RCL 1-3**: < 5 CPU/tick
- **RCL 4-6**: < 15 CPU/tick
- **RCL 7-8**: < 25 CPU/tick

### Efficiency Metrics

- Energy income: 100% of source capacity
- Upgrade rate: 100-500/tick (surplus)
- Build queue: Always processing
- Death rate: < 5% (non-combat)

## Development Workflow

### Testing

```bash
npm test           # Run unit tests
npm run test:watch # Watch mode
```

### Linting

```bash
npm run lint       # ESLint check
```

### Debugging

- Use `console.log()` for room visuals
- Check Memory tab for state inspection
- Use profiler for CPU bottleneck identification

## Winning Strategy Timeline

### Phase 1: Establishment (Ticks 1-5000)
- Spawn harvester, secure energy
- Build spawn extensions
- Upgrade to RCL 2-3
- Scout adjacent rooms

### Phase 2: Growth (Ticks 5000-15000)
- Container mining setup
- Tower defense (RCL 3)
- Begin room expansion
- Establish remote mining

### Phase 3: Expansion (Ticks 15000-30000)
- Claim 2nd room
- Link network setup
- Terminal trading
- Lab boosting (RCL 6)

### Phase 4: Dominance (Ticks 30000+)
- Multi-room coordination
- Offensive operations
- Market manipulation
- RCL 8 optimization

## Troubleshooting

### Common Issues

**Creeps not spawning:**
- Check energy availability
- Verify spawn queue in memory
- Ensure spawn is not blocked

**High CPU usage:**
- Run profiler to identify bottlenecks
- Reduce logging frequency
- Cache Game object lookups

**Memory bloat:**
- Clear dead creep memory (automatic)
- Remove completed tasks
- Compress large data structures

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## License

Unlicense - See [LICENSE](LICENSE)

## Resources

- [Official Screeps Docs](https://docs.screeps.com/)
- [Screeps Wiki](https://wiki.screepspl.us/)
- [Typed-Screeps](https://github.com/screepers/typed-screeps)
- [Screeps Discord](https://discord.gg/screeps)
