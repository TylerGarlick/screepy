## Problem
Only mines local room sources. No remote mining or hauler caravan logistics.

## Solution
Implement remote mining system with scout identification, miner/hauler pairs, profitability calculation, and haul routes.

## Implementation
1. Create src/managers/remoteMiningManager.ts
2. Remote room scoring (distance, sources, safety, path quality)
3. Assign miner/hauler pairs to profitable rooms
4. Establish cached haul routes with waypoints
5. Monitor profitability and abandon unprofitable mines

## Expected Impact
- 2-3x energy income
- Faster RCL progression
- Better creep utilization

## Profitability Formula
profitability = (energyPerTick - haulCost) / distance
haulCost = (distance * 2) / haulerSpeed * haulerCount

## Acceptance Criteria
- [ ] Scouts identify remote source rooms
- [ ] Remote rooms scored and ranked
- [ ] Miner/hauler pairs assigned to profitable rooms
- [ ] Hauler routes established and cached
- [ ] Unprofitable mines abandoned automatically
