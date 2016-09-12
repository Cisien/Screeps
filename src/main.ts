import * as Config from "./config/config";
import * as MemoryManager from "./shared/memoryManager";
import * as RoomManager from "./components/rooms/roomManager";
import * as SpawnManager from "./components/spawns/spawnManager";
import * as SourceManager from "./components/sources/sourceManager";
import * as CreepManager from "./components/creeps/creepManager";
import * as TowerManager from "./components/towers/towerManager";


if (Config.USE_PATHFINDER) {
  PathFinder.use(true);
}

export function loop() {
  RoomManager.loadRooms();
  SpawnManager.loadSpawns();
  SourceManager.loadSources();
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
  } else if (!CreepManager.isRampartRepairerLimitFull()) {
    CreepManager.createRampartRepairer();

    if (Config.VERBOSE) {
      console.log("Need more rampartRepairers!")
    }
  } else if (!CreepManager.isWallRepairerLimitFull()) {
    CreepManager.createWallRepairer();

    if (Config.VERBOSE) {
      console.log("Need more wallRepairers!")
    }

  }

  CreepManager.doTickWork();
  TowerManager.doTickWork();
}
