# Screepy Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
cd /root/.openclaw/workspace/projects/screepy
npm install
```

### 2. Configure Server Connection

Copy the sample configuration and edit it:

```bash
cp screeps.sample.json screeps.json
```

Edit `screeps.json` with your credentials:

**For Official Server:**
```json
{
  "main": {
    "token": "YOUR_STEAM_TOKEN",
    "protocol": "https",
    "hostname": "screeps.com",
    "port": 443,
    "path": "/",
    "branch": "main"
  }
}
```

**For Private Server:**
```json
{
  "pserver": {
    "email": "your@email.com",
    "password": "your_password",
    "protocol": "http",
    "hostname": "your.server.com",
    "port": 21025,
    "path": "/",
    "branch": "main"
  }
}
```

### 3. Build and Upload

```bash
# Build only (dry run)
npm run build

# Push to main server
npm run push-main

# Push to simulation
npm run push-sim

# Watch mode (auto-upload on changes)
npm run watch-main
```

## Architecture Overview

### Core Systems

1. **Task Manager** (`src/managers/taskManager.ts`)
   - Generates tasks based on room needs
   - Priority-based task queue
   - Dynamic task assignment

2. **Spawn Manager** (`src/managers/spawnManager.ts`)
   - Dynamic creep body generation
   - Energy-optimized spawning
   - Role-based creep creation

3. **Role System** (`src/roles/`)
   - Modular creep behavior
   - State machine execution
   - Easy to extend

### Creep Roles

| Role | Purpose | Priority |
|------|---------|----------|
| Miner | Source mining | Highest |
| Harvester | Early-game energy | High |
| Hauler | Resource transport | High |
| Builder | Construction | Medium |
| Upgrader | Controller upgrades | Low |
| Repairer | Maintenance | Low |
| Guard | Defense | Variable |
| Scout | Exploration | Low |

## Development Workflow

### Testing Changes

1. **Edit source files** in `src/`
2. **Build**: `npm run build`
3. **Upload to sim**: `npm run push-sim`
4. **Test in simulation room**
5. **Upload to main**: `npm run push-main`

### Debugging

**Console Logging:**
```typescript
console.log(`[${creep.name}] Building ${site.id}`)
```

**Room Visuals:**
```typescript
room.visual.text('Building', pos, {color: 'green'})
```

**Memory Inspection:**
- Open Memory tab in game UI
- Check `Memory.rooms[roomName].taskQueue`
- Check `Memory.creeps[creepName]`

### CPU Profiling

Check CPU usage in game UI or add to main loop:

```typescript
const cpuStart = Game.cpu.getUsed()
// ... your code
const cpuUsed = Game.cpu.getUsed() - cpuStart
console.log(`CPU used: ${cpuUsed}`)
```

## Winning Strategy

### Phase 1: Establishment (RCL 1-3)
- Spawn 2-3 harvesters
- Build 5+ extensions
- Upgrade controller
- Scout adjacent rooms

### Phase 2: Growth (RCL 4-5)
- Container mining setup
- Add haulers
- Build towers for defense
- Start remote mining

### Phase 3: Expansion (RCL 6-7)
- Claim second room
- Link network
- Terminal trading
- Lab boosting

### Phase 4: Dominance (RCL 8)
- Multi-room coordination
- Offensive operations
- Market manipulation
- Factory production

## Troubleshooting

### Creeps Not Spawning

**Check:**
- Energy availability: `room.energyAvailable`
- Spawn queue: `Memory.rooms[roomName].spawnQueue`
- Spawn status: `spawn.spawning`

**Fix:**
```bash
# Clear spawn queue
> Memory.rooms.W10S10.spawnQueue = []
```

### High CPU Usage

**Common Causes:**
- Too many path calculations
- Excessive `find()` calls
- Unoptimized loops

**Solutions:**
- Use `reusePath` option in `moveTo()`
- Cache `find()` results
- Add CPU limits to roles

### Memory Bloat

**Clean up:**
```bash
# Remove dead creep memory (automatic, but can force)
> for (name in Memory.creeps) { if (!Game.creeps[name]) delete Memory.creeps[name] }

# Clear old tasks
> Memory.rooms.W10S10.taskQueue = []
```

## Advanced Configuration

### Custom Role Bodies

Edit `src/managers/spawnManager.ts`:

```typescript
private generateMinerBody(): BodyPartConstant[] {
  // Custom body composition
  return [WORK, WORK, WORK, MOVE, MOVE, CARRY]
}
```

### Task Priority Adjustment

Edit `src/types/role.ts`:

```typescript
export enum Priority {
  Critical = 15,
  High = 10,
  Medium = 5,
  Low = 3,
  Background = 1,
}
```

### Adding New Roles

1. Create `src/roles/newRole.ts`
2. Implement `RoleExecutor` interface
3. Add to `src/roles/index.ts` registry
4. Add to `src/types/role.ts` enum

## Performance Targets

| RCL | Target CPU | Creeps | Operations |
|-----|------------|--------|------------|
| 1-3 | < 5 CPU | 5-10 | Basic |
| 4-6 | < 15 CPU | 15-25 | Advanced |
| 7-8 | < 25 CPU | 30-50 | Full |

## Resources

- [Screeps Docs](https://docs.screeps.com/)
- [Screeps Wiki](https://wiki.screepspl.us/)
- [Typed-Screeps](https://github.com/screepers/typed-screeps)
- [Screeps Discord](https://discord.gg/screeps)
- [Screepy README](README.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

---

**Good luck, and may your code be bug-free!** 🚀
