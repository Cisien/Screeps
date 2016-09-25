export type WorkerType = string;
export class PartDefinition {
  300: string[];
  550: string[];
  800: string[];
  1050: string[];
  1300: string[];
  1550: string[];
  1800: string[];
  2050: string[];
};
export type State = number;

export let States = {
  SUCCESS: 1,
  RUNNING: 2,
  FAILURE: 3
};

export let Counts = {
  UPGRADER: 2, // multiply sources
  HAULER: 2, // additive sources
  REPAIRER: 1, // direct count
  BUILDER: 1, // direct count
  WALL_REPAIRER: 0, // direct count
  RAMPART_REPAIRER: 1 // direct count
}

export let WorkerTypes = {
  NONE: '',
  MINER: 'miner',
  BUILDER: 'builder',
  UPGRADER: 'upgrader',
  HAULER: 'hauler',
  REPAIRER: 'repairer',
  WALL_BUILDER: 'wallBuilder',
  RAMPART_BUILDER: 'rampartBuilder',
  HEALER: 'healer',
  CLAIMER: 'claimer',
  ATTACKER: 'attacker',
  DISMANTLER: 'dismantler'
}

export const WORKER_PARTS: PartDefinition = {
  300: [MOVE, MOVE, CARRY, CARRY, WORK],
  550: [MOVE, MOVE, CARRY, CARRY, CARRY, WORK, WORK],
  800: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK],
  1050: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK],
  1300: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK],
  1550: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK],
  1800: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK],
  2050: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK]
};

export const HAULER_PARTS: PartDefinition = {
  300: [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY],
  550: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY],
  800: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
  1050: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
  1300: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
  1550: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
  1800: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
  2050: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
};

export const MINER_PARTS: PartDefinition = {
  300: [MOVE, WORK, WORK],
  550: [MOVE, WORK, WORK, WORK, WORK, WORK],
  800: [MOVE, MOVE, WORK, WORK, WORK, WORK, WORK],
  1050: [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK],
  1300: [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK],
  1550: [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK],
  1800: [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK],
  2050: [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK]
}

export const HEALER_PARTS: PartDefinition = {
  300: [MOVE, HEAL],
  550: [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, HEAL],
  800: [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, HEAL, HEAL],
  1050: [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, HEAL, HEAL, MOVE, MOVE, HEAL],
  1300: [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, HEAL, HEAL, MOVE, MOVE, HEAL, HEAL],
  1550: [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, HEAL, HEAL, MOVE, MOVE, HEAL, HEAL],
  1800: [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
    TOUGH, TOUGH, MOVE, MOVE, HEAL, HEAL, MOVE, MOVE, HEAL, HEAL, MOVE, MOVE, HEAL],
  2050: [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
    TOUGH, TOUGH, MOVE, MOVE, HEAL, HEAL, MOVE, MOVE, HEAL, HEAL, MOVE, MOVE, HEAL, HEAL]
}

export const ATTACKER_PARTS: PartDefinition = {
  300: [TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, ATTACK, ATTACK],
  550: [TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, ATTACK, ATTACK],
  800: [TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, ATTACK, ATTACK, MOVE, MOVE, ATTACK, ATTACK],
  1050: [TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, ATTACK, ATTACK, MOVE, MOVE, ATTACK, ATTACK],
  1300: [TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, ATTACK, ATTACK, MOVE, MOVE, ATTACK, ATTACK],
  1550: [TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, ATTACK, ATTACK, MOVE, MOVE, ATTACK, ATTACK, MOVE, MOVE, ATTACK, ATTACK],
  1800: [TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, ATTACK, ATTACK, MOVE, MOVE, ATTACK, ATTACK, MOVE, MOVE, ATTACK, ATTACK],
  2050: [TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, ATTACK, ATTACK, MOVE, MOVE, ATTACK, ATTACK, MOVE, MOVE, ATTACK, ATTACK]
}

export const CLAIMER_PARTS: PartDefinition = {
  300: [],
  550: [],
  800: [MOVE, MOVE, CLAIM],
  1050: [MOVE, MOVE, MOVE, MOVE, CLAIM],
  1300: [MOVE, MOVE, MOVE, MOVE, CLAIM],
  1550: [MOVE, MOVE, MOVE, MOVE, CLAIM, CLAIM],
  1800: [MOVE, MOVE, MOVE, MOVE, CLAIM, CLAIM],
  2050: [MOVE, MOVE, MOVE, MOVE, CLAIM, CLAIM]
}
