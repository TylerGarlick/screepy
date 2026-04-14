## Problem
No visibility into CPU usage by system. Hard to identify bottlenecks.

## Solution
Implement comprehensive CPU profiling with per-system tracking, tick-by-tick graphs, and bottleneck detection.

## Implementation
1. Create src/utils/profiler.ts
2. Add profiling wrappers around all major systems
3. Track metrics: CPU per system, memory usage, task execution time
4. Log to console and Memory every 100 ticks
5. Optional: Export to Grafana dashboard

## Expected Impact
- Identify CPU bottlenecks quickly
- Data-driven optimization
- Performance regression detection

## Metrics to Track
- Task generation CPU
- Spawn logic CPU
- Pathfinding CPU
- Combat calculations CPU
- Total CPU per tick
