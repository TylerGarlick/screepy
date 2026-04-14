## Problem
Current combat is individual creep vs target. No coordination for squads, focused fire, or healing.

## Solution
Implement squad-based combat system with formations (duos, quads), coordinated targeting, and squad healing.

## Implementation
1. Create src/combat/Squad.ts
2. Implement squad types: Duo (attacker+healer), Quad (2 attackers+healer+tank), Squad (4-8 creeps)
3. Add formation logic and squad pathfinding
4. Implement focus fire targeting
5. Add squad task to task queue

## Expected Impact
- 2-3x combat effectiveness
- Better survivability with coordinated healing
- Successful room assaults

## Acceptance Criteria
- [ ] Squads maintain formation while moving
- [ ] Focus fire on same target
- [ ] Healers prioritize damaged squad members
- [ ] Retreat logic when outmatched
