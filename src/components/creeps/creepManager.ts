///<reference path="../../../typings/globals/lodash/index.d.ts" />
import * as Config from "./../../config/config";
import * as SourceManager from "./../sources/sourceManager";
import * as SpawnManager from "./../spawns/spawnManager";
import * as RoomManager from "./../rooms/roomManager";

import Harvester from "./harvester";
import Upgrader from "./upgrader";
import Builder from "./builder";

export let creeps: { [creepName: string]: Creep };
export let creepNames: string[] = [];
export let harvesterCount: number;
export let upgraderCount: number;
export let builderCount: number;
export let creepCount: number;

export function loadCreeps(): void {
  creeps = Game.creeps;
  creepCount = _.size(creeps);

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

    if (Config.VERBOSE && !(status < 0) ) {
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

  if (Config.VERBOSE && !(status < 0) ) {
    console.log("Started creating new Harvester");
  }

  return status;
}

export function createBuilder(): number | string {
  let bodyParts: string[] = [MOVE, MOVE, CARRY, WORK];
  let properties: { [key: string]: any } = {
    renew_station_id: SpawnManager.getFirstSpawn().id,
    role: "builder",
    target_source_id: SourceManager.sources[SourceManager.sourceCount -1].id,
    working: false
  }

  let status: number | string = SpawnManager.getFirstSpawn().canCreateCreep(bodyParts, undefined);

  if (status == OK) {
    status = SpawnManager.getFirstSpawn().createCreep(bodyParts, undefined, properties);
  }

  if(Config.VERBOSE && !(status < 0) ) {
    console.log("Started creating new Builder");
  }

  return status;
}


export function harvestersGoToWork(): void {

  let harvesters: Harvester[] = [];
  _.forEach(this.creeps, function (creep: Creep) {
    if (creep.memory.role === "harvester") {
      let harvester = new Harvester();
      harvester.setCreep(creep);
      // Next move for harvester
      harvester.action();

      // Save harvester to collection
      harvesters.push(harvester);
    }
  });
  this.harvesterCount = harvesters.length;

  if (Config.VERBOSE) {
    console.log(harvesters.length + " harvesters reported on duty today!");
  }

}

export function upgradersGoToWork(): void {
  let upgraders: Upgrader[] = [];
  _.forEach(this.creeps, function (creep: Creep) {
    if (creep.memory.role === 'upgrader') {
      let upgrader = new Upgrader();
      upgrader.setCreep(creep);
      upgrader.action();

      upgraders.push(upgrader);
    }
  });
  this.upgraderCount = upgraders.length;

  if (Config.VERBOSE) {
    console.log(upgraders.length + " upgraders reported on duty today!");
  }
}

export function buildersGoToWork(): void {
  let builders: Builder[] = [];
  _.forEach(this.creeps, function(creep: Creep) {
    if(creep.memory.role === 'builder') {
      let builder = new Builder();
      builder.setCreep(creep);
      builder.action();
      builders.push(builder);
    }
  });
  this.builderCount = builders.length;

  if(Config.VERBOSE) {
    console.log(builders.length + " builders reported on duty today!");
  }
}

/**
 * This should have some kind of load balancing. It's not useful to create
 * all the harvesters for all source points at the start.
 */
export function isHarvesterLimitFull(): boolean {
  return Config.MAX_HARVESTERS_PER_SOURCE <= this.harvesterCount;
}

export function isUpgraderLimitFull(): boolean {
  return Config.MAX_UPGRADERS_PER_SOURCE <= this.upgraderCount;
}

export function isBuilderLimitFull(): boolean {
  return Config.MAX_BUILDERS_PER_SOURCE <= this.builderCount;
}

function _loadCreepNames(): void {
  for (let creepName in creeps) {
    if (creeps.hasOwnProperty(creepName)) {
      creepNames.push(creepName);
    }
  }
}