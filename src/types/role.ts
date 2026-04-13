// Enhanced role definitions based on maturity matrix best practices

export enum Role {
  // Economic roles
  Miner = 'miner',           // Source mining (highest priority)
  Harvester = 'harvester',   // Early-game energy collection
  Hauler = 'hauler',         // Resource transport
  Upgrader = 'upgrader',     // Controller upgrading
  Builder = 'builder',       // Construction
  Repairer = 'repairer',     // Structure repair
  Scout = 'scout',           // Room exploration
  
  // Combat roles
  Guard = 'guard',           // Room defense
  RangedAttacker = 'rangedAttacker',  // Ranged combat
  Healer = 'healer',         // Support healing
  Dismantler = 'dismantler', // Structure destruction
  Claimer = 'claimer',       // Room claiming
}

export enum TaskType {
  Harvest = 'harvest',
  Haul = 'haul',
  Upgrade = 'upgrade',
  Build = 'build',
  Repair = 'repair',
  Combat = 'combat',
  Scout = 'scout',
  Claim = 'claim',
}

export enum Priority {
  Critical = 15,  // Defense, survival
  High = 10,      // Energy income
  Medium = 5,     // Infrastructure
  Low = 3,        // Upgrades
  Background = 1, // Scouting, optimization
}
