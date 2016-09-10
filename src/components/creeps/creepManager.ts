///<reference path="../../../typings/globals/lodash/index.d.ts" />
import * as Config from "./../../config/config";
import * as SourceManager from "./../sources/sourceManager";
import * as SpawnManager from "./../spawns/spawnManager";
import * as RoomManager from "./../rooms/roomManager";

import CreepAction from "./creepAction";
import Harvester from "./harvester";
import Upgrader from "./upgrader";
import Builder from "./builder";
import Repairer from "./repairer";
import EnergyMover from "./energyMover";

export let creeps: { [creepName: string]: Creep };
export let creepNames: string[] = [];
export let harvesterCount: number = 0;
export let upgraderCount: number = 0;
export let builderCount: number = 0;
export let repairerCount: number = 0;
export let energyMoverCount: number = 0;
export let creepCount: number = 0;

export let workers: CreepAction[] = [];
export let harvesters: Harvester[] = [];
export let upgraders: Upgrader[] = [];
export let builders: Builder[] = [];
export let repairers: Repairer[] = [];
export let energyMovers: EnergyMover[] = [];

export function loadCreeps(): void {
  creeps = Game.creeps;
  creepCount = _.size(creeps);

  this.harvesterCount = 0;
  this.upgraderCount = 0;
  this.builderCount = 0;
  this.repairerCount = 0;
  this.energyMoverCount = 0;

  this.workers = [];
  this.harvesters = [];
  this.upgraders = [];
  this.builders = [];
  this.repairers = [];
  this.energyMovers = [];

  _.forEach(creeps, (c: Creep) => {
    switch (c.memory.role) {
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
    }
  });
  _loadCreepNames();

  if (Config.VERBOSE) {
    console.log(creepCount + " creeps found in the playground.");
  }
}
export function createHarvester(): number | string {
  let bodyParts: string[] = Config.HARVESTER_PARTS;

  let workedSources: {} = _.countBy(this.harvesters, (c: Harvester) => c.creep.memory.target_source_id);

  let leastUsedSource: string = '';
  let leastUsedSourceCount: number = 1000;


  for (let src of SourceManager.sources) {
    if (!workedSources[src.id]) {
      console.log("no harvesters")
      leastUsedSource = src.id;
      leastUsedSourceCount = 0;
      break;
    }
  }

  if (!leastUsedSource || leastUsedSource === '') {
    console.log("Unable to find source to assign to new harvester, aborting!")
    return -1;
  }

  console.log("least used source is " + leastUsedSource + " with " + leastUsedSourceCount + " harvesters assigned.");
  let properties: { [key: string]: any } = {
    role: "harvester",
    target_source_id: leastUsedSource,
    working: false
  };

  let status: number | string = SpawnManager.getFirstSpawn().canCreateCreep(bodyParts, undefined);
  if (status === OK) {
    status = SpawnManager.getFirstSpawn().createCreep(bodyParts, undefined, properties);

    if (Config.VERBOSE && !(status < 0)) {
      console.log("Started creating new Harvester");
    }
  }

  return status;
}

export function createUpgrader(): number | string {
  let bodyParts: string[] = Config.UPGRADER_PARTS;

  let room: Room = RoomManager.getFirstRoom();
  let dropOffId: any;

  if (room) {
    var controller: any = room.controller
    if (controller) {
      dropOffId = controller.id;
    }
  }

  let properties: { [key: string]: any } = {
    renew_station_id: SpawnManager.getFirstSpawn().id,
    role: "upgrader",
    target_energy_dropoff_id: dropOffId,
    target_source_id: SourceManager.getFirstSource().id,
    working: false
  };

  let status: number | string = SpawnManager.getFirstSpawn().canCreateCreep(bodyParts, undefined);

  if (status === OK) {
    status = SpawnManager.getFirstSpawn().createCreep(bodyParts, undefined, properties);
  }
  else {
    console.log("Couldnt's spawn new Upgrader code: " + status);
  }

  if (Config.VERBOSE && !(status < 0)) {
    console.log("Started creating new Upgrader");
  }

  return status;
}

export function createBuilder(): number | string {
  let bodyParts: string[] = Config.BUILDER_PARTS;
  let properties: { [key: string]: any } = {
    renew_station_id: SpawnManager.getFirstSpawn().id,
    role: "builder",
    target_source_id: SourceManager.sources[SourceManager.sourceCount - 1].id,
    working: false
  }

  let status: number | string = SpawnManager.getFirstSpawn().canCreateCreep(bodyParts, undefined);

  if (status == OK) {
    status = SpawnManager.getFirstSpawn().createCreep(bodyParts, undefined, properties);
  }

  if (Config.VERBOSE && !(status < 0)) {
    console.log("Started creating new Builder");
  }

  return status;
}

export function createRepairer(): number | string {
  let bodyParts: string[] = Config.REPAIRER_PARTS;
  let properties: { [key: string]: any } = {
    renew_station_id: SpawnManager.getFirstSpawn().id,
    role: "repairer",
    target_source_id: SourceManager.sources[SourceManager.sourceCount - 1].id,
    working: false
  }

  let status: number | string = SpawnManager.getFirstSpawn().canCreateCreep(bodyParts, undefined);

  if (status == OK) {
    status = SpawnManager.getFirstSpawn().createCreep(bodyParts, undefined, properties);
  }

  if (Config.VERBOSE && !(status < 0)) {
    console.log("Started creating new Repairer");
  }

  return status;
}


export function createEnergyMover(): number | string {
  let bodyParts: string[] = Config.MOVER_PARTS;
  let properties: { [key: string]: any } = {
    role: "energyMover",
    working: false
  };
  let status: number | string = SpawnManager.getFirstSpawn().canCreateCreep(bodyParts, undefined);
  if (status === OK) {
    status = SpawnManager.getFirstSpawn().createCreep(bodyParts, undefined, properties);

    if (Config.VERBOSE && !(status < 0)) {
      console.log("Started creating new EnergyMover");
    }
  }

  return status;
}


export function doTickWork() {
  for(let creep of this.workers) {
    creep.action();
  }
}

export function isHarvesterLimitFull(): boolean {
  console.log(this.harvesterCount + ' harvesters');

  return Config.MAX_HARVESTERS <= this.harvesterCount;
}

export function isUpgraderLimitFull(): boolean {

  console.log(this.upgraderCount + ' upgraders');

  return Config.MAX_UPGRADERS <= this.upgraderCount;
}

export function isBuilderLimitFull(): boolean {
  console.log(this.builderCount + ' builders');

  return Config.MAX_BUILDERS <= this.builderCount;
}

export function isRepairerLimitFull(): boolean {
  console.log(this.repairerCount + ' repairers');

  return Config.MAX_REPAIRERS <= this.repairerCount;
}

export function isEnergyMoverLimitFull(): boolean {
  console.log(this.energyMoverCount + ' energyMovers');

  return Config.MAX_MOVERS <= this.energyMoverCount;
}

function _loadCreepNames(): void {
  for (let creepName in creeps) {
    if (creeps.hasOwnProperty(creepName)) {
      creepNames.push(creepName);
    }
  }
}
