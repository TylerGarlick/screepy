## Problem
Codebase has TypeScript compilation errors preventing clean build.

## Issues
- Memory interface missing properties (uuid, colony, stats, rooms)
- Missing TaskType import
- CreepMemory missing properties (role, state, targetId, sourceId, working, homeRoom)
- RoomMemory missing properties (taskQueue, lastUpdate, spawnQueue)
- Room.parseRoomName typing issues
- Structure type guards needed

## Solution
Fix all TypeScript type definitions:

1. Memory Interface (src/types/memory.ts): Add uuid, colony, stats, rooms
2. CreepMemory: Add role, state, targetId, sourceId, working, homeRoom
3. RoomMemory: Add taskQueue, lastUpdate, spawnQueue
4. Fix Imports: Export TaskType, fix circular dependencies
5. Add Type Guards: isStructureWithStore, isSpawn

## Acceptance Criteria
- [ ] npm run build completes without errors
- [ ] All TypeScript types match runtime usage
- [ ] No implicit any types
- [ ] Strict mode enabled and passing

## Priority
P0 - Blocking deployment
