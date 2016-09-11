import * as Config from "./config/config";
import * as MemoryManager from "./shared/memoryManager";
import * as RoomManager from "./components/rooms/roomManager";
import * as SpawnManager from "./components/spawns/spawnManager";
import * as SourceManager from "./components/sources/sourceManager";
import * as CreepManager from "./components/creeps/creepManager";

RoomManager.loadRooms();
SpawnManager.loadSpawns();
SourceManager.loadSources();

if (Config.USE_PATHFINDER) {
  PathFinder.use(true);
}

export function loop() {

  MemoryManager.loadMemory();
  CreepManager.loadCreeps();

  if (!CreepManager.isHarvesterLimitFull()) {
    CreepManager.createHarvester();

    if (Config.VERBOSE) {
      console.log("Need more harvesters!");
    }
  } else if (!CreepManager.isMinerLimitFull()) {
    CreepManager.createMiner();

    if (Config.VERBOSE) {
      console.log("Need more miners!");
    }
  } else if (!CreepManager.isEnergyMoverLimitFull()) {
    CreepManager.createEnergyMover();

    if (Config.VERBOSE) {
      console.log("Need more energyMovers!");
    }
  } else if (!CreepManager.isUpgraderLimitFull()) {
    CreepManager.createUpgrader();

    if (Config.VERBOSE) {
      console.log("Need more upgraders!")
    }

  } else if (!CreepManager.isBuilderLimitFull()) {
    CreepManager.createBuilder();

    if (Config.VERBOSE) {
      console.log("Need more builders!")
    }
  } else if (!CreepManager.isRepairerLimitFull()) {
    CreepManager.createRepairer();

    if (Config.VERBOSE) {
      console.log("Need more repairers!")
    }
  }

  CreepManager.doTickWork();
}
