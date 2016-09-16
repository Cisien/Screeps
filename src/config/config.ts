export const VERBOSE: boolean = true;

export const USE_PATHFINDER: boolean = true;

export const MAX_HARVESTERS: number = 0;

export const MAX_MINERS: number = 2;

export const MAX_UPGRADERS: number = 2;

export const MAX_BUILDERS: number = 0;

export const MAX_REPAIRERS: number = 1;

export const MAX_MOVERS: number = 3;

export const MAX_WALL_REPAIRERS: number = 0;

export const MAX_RAMPART_REPAIRERS: number = 2;

export var minerDef: Object = {
  parts: {
    300: [MOVE, WORK, WORK],
    550: [MOVE, WORK, WORK, WORK, WORK, WORK],
    800: [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK]
  },
  memory: {
    role: 'harvester'
  }
}

export const HARVESTER_PARTS: BodyPartType[] = [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK];

export const MINER_PARTS: BodyPartType[] = [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK];

export const BUILDER_PARTS: BodyPartType[] = [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK];

export const UPGRADER_PARTS: BodyPartType[] = [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK];

export const REPAIRER_PARTS: BodyPartType[] = [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK];

export const WALL_REPAIRER_PARTS: BodyPartType[] = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK];

export const MOVER_PARTS: BodyPartType[] = [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK];

export const SING: boolean = false;
export const SONG: string = "Hooh! aah!|hooh! aah!|Hooh! aah!|hooh! aah!|That's the|sound of|the" +
  "men|working on|the chain|ga-a-ang|That's the|sound of|the men|working on|the chain|gang";