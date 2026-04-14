// Type guards for Screeps structures

/**
 * Type guard to check if structure has a store property
 */
export function hasStore(structure: Structure): structure is Structure & { store: StoreDefinition } {
  return 'store' in structure;
}

/**
 * Type guard to check if structure is a spawn
 */
export function isSpawn(structure: Structure): structure is StructureSpawn {
  return structure.structureType === STRUCTURE_SPAWN;
}

/**
 * Helper to get energy from any structure that might have it
 */
export function getEnergy(structure: Structure): number {
  if (structure.structureType === STRUCTURE_SPAWN || structure.structureType === STRUCTURE_EXTENSION) {
    return (structure as StructureSpawn | StructureExtension).energy;
  }
  if (hasStore(structure)) {
    return structure.store.getUsedCapacity(RESOURCE_ENERGY);
  }
  return 0;
}
