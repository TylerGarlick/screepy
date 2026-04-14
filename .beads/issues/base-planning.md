## Problem
Structure placement is manual or basic. No optimization for tower coverage, link networks, roads, or defense.

## Solution
Implement automated base planning with stamp templates, tower coverage analysis, and optimal structure positioning.

## Implementation
1. Create src/planning/BasePlanner.ts
2. Implement stamp system for room templates
3. Tower coverage maximization algorithm
4. Link network optimization
5. Road network generation between high-traffic points
6. Defensive wall planning

## Expected Impact
- Optimal structure placement
- Better defense coverage (≥90% tower coverage)
- Efficient resource flow
- Reduced manual planning

## Planning Priorities
1. Spawn hub (RCL 2-3)
2. Tower ring (RCL 3-4)
3. Container mining (RCL 4-5)
4. Link network (RCL 5-6)
5. Lab cluster (RCL 6-7)
6. Factory + Nuker (RCL 8)
