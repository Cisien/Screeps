import * as Config from "./../../config/config";

import CreepAction from "./creepAction";
import Harvester from "./harvester";
import Upgrader from "./upgrader";
import Builder from "./builder";
import Repairer from "./repairer";
import EnergyMover from "./energyMover";
import Miner from "./miner";
import WallRepairer from "./wallRepairer";
import RampartRepairer from './rampartRepairer';

export let creeps: { [creepName: string]: Creep };
export let creepNames: string[] = [];
export let harvesterCount: number = 0;
export let upgraderCount: number = 0;
export let builderCount: number = 0;
export let repairerCount: number = 0;
export let energyMoverCount: number = 0;
export let minerCount: number = 0;
export let wallRepairerCount: number = 0;
export let rampartRepairerCount: number = 0;
export let creepCount: number = 0;

export let workers: CreepAction[] = [];
export let harvesters: Harvester[] = [];
export let upgraders: Upgrader[] = [];
export let builders: Builder[] = [];
export let repairers: Repairer[] = [];
export let miners: Miner[] = [];
export let wallRepairers: WallRepairer[] = [];
export let rampartRepairers: RampartRepairer[] = [];
export let energyMovers: EnergyMover[] = [];
export let song: string[] = Config.SONG.split("|");
export function loadCreeps(): void {
  creeps = Game.creeps;
  creepCount = _.size(creeps);

  this.harvesterCount = 0;
  this.upgraderCount = 0;
  this.builderCount = 0;
  this.repairerCount = 0;
  this.energyMoverCount = 0;
  this.minerCount = 0;
  this.wallRepairerCount = 0;
  this.rampartRepairerCount = 0;

  this.workers = [];
  this.harvesters = [];
  this.upgraders = [];
  this.builders = [];
  this.repairers = [];
  this.energyMovers = [];
  this.miners = [];
  this.wallRepairers = [];
  this.rampartRepairers = [];

  _.forEach(creeps, (c: Creep) => {
    switch (c.memory['role']) {
      case 'harvester': {
        this.harvesterCount++;
        let creep = new Harvester();
        creep.setCreep(c);
        this.harvesters.push(creep);
        this.workers.push(creep);
        break;
      }
      case 'upgrader': {
        this.upgraderCount++;
        let creep = new Upgrader();
        creep.setCreep(c);
        this.upgraders.push(creep);
        this.workers.push(creep);
      }
        break;
      case 'builder': {
        this.builderCount++;
        let creep = new Builder();
        creep.setCreep(c);
        this.repairers.push(creep);
        this.workers.push(creep);
      }
        break;
      case 'repairer': {
        this.repairerCount++;
        let creep = new Repairer();
        creep.setCreep(c);
        this.repairers.push(creep);
        this.workers.push(creep);
      }
        break;
      case 'energyMover': {
        this.energyMoverCount++;
        let creep = new EnergyMover();
        creep.setCreep(c);
        this.energyMovers.push(creep);
        this.workers.push(creep);
      }
        break;
      case 'miner': {
        this.minerCount++;
        let creep = new Miner();
        creep.setCreep(c);
        this.miners.push(creep);
        this.workers.push(creep);
      }
        break;
      case 'wallRepairer': {
        this.wallRepairerCount++;
        let creep = new WallRepairer();
        creep.setCreep(c);
        this.wallRepairers.push(creep);
        this.workers.push(creep);
      }
        break;
      case 'rampartRepairer': {
        this.rampartRepairerCount++;
        let creep = new RampartRepairer();
        creep.setCreep(c);
        this.rampartRepairers.push(creep);
        this.workers.push(creep);
      }
        break;
    }
  });
  _loadCreepNames();

  if (Config.VERBOSE) {
    //console.log(creepCount + " creeps found in the playground.");
  }
}
export function createHarvester(): ResponseCode | CreepName {
  return Harvester.spawn(this.harvesters);
}

export function createMiner(): ResponseCode | CreepName {
  return Miner.spawn(this.miners);
}

export function createUpgrader(): ResponseCode | CreepName {
  return Upgrader.spawn();
}

export function createBuilder(): ResponseCode | CreepName {
  return Builder.spawn();
}

export function createRepairer(): ResponseCode | CreepName {
  return Repairer.spawn();
}

export function createEnergyMover(): ResponseCode | CreepName {
  return EnergyMover.spawn();
}

export function createWallRepairer(): ResponseCode | CreepName {
  return WallRepairer.spawn();
}

export function createRampartRepairer(): ResponseCode | CreepName {
  return RampartRepairer.spawn();
}

export function doTickWork() {
  _.forEach(this.workers, (creep: CreepAction) => {
    if(Config.SING){
    creep.creep.say(this.song[Game.time % this.song.length], true);
    }
    creep.action();
  });
}

export function isHarvesterLimitFull(): boolean {
  //console.log(this.harvesterCount + ' harvesters');

  return Config.MAX_HARVESTERS <= this.harvesterCount;
}

export function isMinerLimitFull(): boolean {
  //console.log(this.minerCount + ' miners');

  return Config.MAX_MINERS <= this.minerCount;
}

export function isUpgraderLimitFull(): boolean {
  //console.log(this.upgraderCount + ' upgraders');

  return Config.MAX_UPGRADERS <= this.upgraderCount;
}

export function isBuilderLimitFull(): boolean {
  //console.log(this.builderCount + ' builders');

  return Config.MAX_BUILDERS <= this.builderCount;
}

export function isRepairerLimitFull(): boolean {
  //console.log(this.repairerCount + ' repairers');

  return Config.MAX_REPAIRERS <= this.repairerCount;
}

export function isEnergyMoverLimitFull(): boolean {
  //console.log(this.energyMoverCount + ' energyMovers');

  return Config.MAX_MOVERS <= this.energyMoverCount;
}

export function isWallRepairerLimitFull(): boolean {
  //console.log(this.wallRepairerCount + ' wallRepairers');

  return Config.MAX_WALL_REPAIRERS <= this.wallRepairerCount;
}

export function isRampartRepairerLimitFull(): boolean {
  //console.log(this.rampartRepairerCount + ' rampartRepairers');

  return Config.MAX_RAMPART_REPAIRERS <= this.rampartRepairerCount;
}


function _loadCreepNames(): void {
  for (let creepName in creeps) {
    if (creeps.hasOwnProperty(creepName)) {
      creepNames.push(creepName);
    }
  }
}
