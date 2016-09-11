export const VERBOSE: boolean = true;

export const USE_PATHFINDER: boolean = true;

export const MAX_HARVESTERS: number = 0;

export const MAX_MINERS: number = 2;

export const MAX_UPGRADERS: number = 4;

export const MAX_BUILDERS: number = 2;

export const MAX_REPAIRERS: number = 2;

export const MAX_MOVERS: number = 2;

export const MAX_WALL_REPAIRERS: number = 2

export const HARVESTER_PARTS: BodyPartType[] = [MOVE, MOVE, CARRY, CARRY, WORK, WORK, WORK];

export const MINER_PARTS: BodyPartType[] = [MOVE, WORK, WORK, WORK, WORK, WORK];

export const BUILDER_PARTS: BodyPartType[] = [MOVE, MOVE, CARRY, CARRY, WORK, WORK, WORK];

export const UPGRADER_PARTS: BodyPartType[] = [MOVE, MOVE, CARRY, CARRY, WORK, WORK, WORK];

export const REPAIRER_PARTS: BodyPartType[] = [MOVE, MOVE, CARRY, CARRY, WORK, WORK, WORK, WORK];

export const WALL_REPAIRER_PARTS: BodyPartType[] = [MOVE, MOVE, CARRY, CARRY, WORK, WORK, WORK];

export const MOVER_PARTS: BodyPartType[] = [MOVE, MOVE, CARRY, CARRY, WORK, WORK, WORK];
