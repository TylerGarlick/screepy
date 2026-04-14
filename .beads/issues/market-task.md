## Problem
No automated resource trading. Excess resources sit in storage while other rooms starve.

## Solution
Implement market system with:
- Automatic surplus detection
- Price-aware buying/selling
- Inter-room resource balancing
- Terminal logistics integration

## Implementation
1. Create src/managers/marketManager.ts
2. Track resource surplus/deficit per room
3. Implement trading strategies:
   - Surplus selling (energy > 500k)
   - Deficit buying (energy < 100k)
   - Price threshold alerts
   - Arbitrage opportunities
4. Integrate with Terminal for transfers
5. Add market orders to task queue

## Expected Impact
- Better resource distribution
- Credit generation from surplus
- Emergency resource acquisition
- Optimized terminal usage

## Priority Levels
- P3: Basic buy/sell automation
- P2: Price optimization
- P1: Arbitrage and advanced strategies
