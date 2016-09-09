///<reference path="../../../typings/globals/lodash/index.d.ts" />
import * as Config from "./../../config/config";
import * as SourceManager from "./../sources/sourceManager";
import * as SpawnManager from "./../spawns/spawnManager";
import * as RoomManager from "./../rooms/roomManager";

import Harvester from "./harvester";
import Upgrader from "./upgrader";
import Builder from "./builder";
import Repairer from "./repairer";

export let creeps: { [creepName: string]: Creep };
export let creepNames: string[] = [];
export let harvesterCount: number = 0;
export let upgraderCount: number = 0;
export let builderCount: number = 0;
export let repairerCount: number = 0;
export let creepCount: number = 0;

export let harvesters: Harvester[] = [];
export let upgraders: Upgrader[] = [];
export let builders: Builder[] = [];
export let repairers: Repairer[] = []

export function loadCreeps(): void {
  creeps = Game.creeps;
  creepCount = _.size(creeps);

  this.harvesterCount = 0;
  this.upgraderCount = 0;
  this.builderCount = 0;
  this.repairerCount = 0;

  this.harvesters = [];
  this.upgraders = [];
  this.builders = [];
  this.repairers = [];

  _.forEach(creeps, (c: Creep) => {
    switch (c.memory.role) {
      case 'harvester': {
        this.harvesterCount++;
        let creep = new Harvester();
        creep.setCreep(c);
        this.harvesters.push(creep);
        break;
      }
      case 'upgrader': {
        this.upgraderCount++;
        let creep = new Upgrader();
        creep.setCreep(c);
        this.upgraders.push(creep);
      }
        break;
      case 'builder': {
        this.builderCount++;
        let creep = new Builder();
        creep.setCreep(c);
        this.repairers.push(creep);
      }
        break;
      case 'repairer': {
        this.repairerCount++;
        let creep = new Repairer();
        creep.setCreep(c);
        this.repairers.push(creep);
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
  let bodyParts: string[] = [MOVE, MOVE, CARRY, WORK];
  let properties: { [key: string]: any } = {
    renew_station_id: SpawnManager.getFirstSpawn().id,
    role: "harvester",
    target_energy_dropoff_id: SpawnManager.getFirstSpawn().id,
    target_source_id: SourceManager.getFirstSource().id,
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
  let bodyParts: string[] = [MOVE, MOVE, CARRY, WORK];

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

  if (Config.VERBOSE && !(status < 0)) {
    console.log("Started creating new Harvester");
  }

  return status;
}

export function createBuilder(): number | string {
  let bodyParts: string[] = [MOVE, MOVE, CARRY, WORK];
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
  let bodyParts: string[] = [MOVE, MOVE, CARRY, WORK];
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

export function harvestersGoToWork(): void {
  _.forEach(this.harvesters, function (creep: Harvester) {
    creep.action();
  });

  if (Config.VERBOSE) {
    console.log(harvesters.length + " harvesters reported on duty today!");
  }

}

export function upgradersGoToWork(): void {
  _.forEach(this.upgraders, function (creep: Upgrader) {
    creep.action();
  });

  if (Config.VERBOSE) {
    console.log(upgraders.length + " upgraders reported on duty today!");
  }
}

export function buildersGoToWork(): void {
  _.forEach(this.builders, function (creep: Builder) {
    creep.action();
  });

  if (Config.VERBOSE) {
    console.log(builders.length + " builders reported on duty today!");
  }
}

export function repairerGoToWork(): void {
  _.forEach(this.repairers, function (creep: Repairer) {
    creep.action();
  });

  if (Config.VERBOSE) {
    console.log(repairers.length + " repairers reported on duty today!");
  }
}

/**
 * This should have some kind of load balancing. It's not useful to create
 * all the harvesters for all source points at the start.
 */
export function isHarvesterLimitFull(): boolean {
  console.log(this.harvesterCount + ' harvesters');

  return Config.MAX_HARVESTERS_PER_SOURCE <= this.harvesterCount;
}

export function isUpgraderLimitFull(): boolean {

  console.log(this.upgraderCount + ' upgraders');

  return Config.MAX_UPGRADERS_PER_SOURCE <= this.upgraderCount;
}

export function isBuilderLimitFull(): boolean {
  console.log(this.builderCount + ' builders');

  return Config.MAX_BUILDERS_PER_SOURCE <= this.builderCount;
}

export function isRepairerLimitFull(): boolean {
  console.log(this.repairerCount + ' repairers');

  return Config.MAX_REPAIRERS_PER_SOURCE <= this.repairerCount;
}

function _loadCreepNames(): void {
  for (let creepName in creeps) {
    if (creeps.hasOwnProperty(creepName)) {
      creepNames.push(creepName);
    }
  }
}