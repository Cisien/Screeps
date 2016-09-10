/**
 * Enable this if you want a lot of text to be logged to console.
 * @type {boolean}
 */
export const VERBOSE: boolean = true;

/**
 * @type {number}
 */
export const MAX_HARVESTERS: number = 2;

/**
 * Enable this to use the experimental PathFinder class.
 */
export const USE_PATHFINDER: boolean = true;

export const MAX_UPGRADERS: number = 5;

export const MAX_BUILDERS: number = 3;

export const MAX_REPAIRERS: number = 2;

export const MAX_MOVERS: number = 3

export const HARVESTER_PARTS: string[] = [MOVE, WORK, WORK, WORK, WORK];

export const BUILDER_PARTS: string[] = [MOVE, CARRY, CARRY, WORK];

export const UPGRADER_PARTS: string[] = [MOVE, CARRY, CARRY, WORK];

export const REPAIRER_PARTS: string[] = [MOVE, CARRY, CARRY, WORK];

export const MOVER_PARTS: string[] = [MOVE, CARRY, CARRY, WORK];