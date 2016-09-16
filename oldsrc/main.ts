console.log('<span style="color: red;">reload at ' + Game.time + '</span>');
let restarts: number = 1;
Memory["stats"]['game.reloadTime'] = Game.time;
console.log(Memory["stats"]['game.reloadTime'])
import * as Config from "./config/config";
import * as MemoryManager from "./shared/memoryManager";
import * as RoomManager from "./components/rooms/roomManager";
import * as SpawnManager from "./components/spawns/spawnManager";
import * as SourceManager from "./components/sources/sourceManager";
import * as CreepManager from "./components/creeps/creepManager";
import * as TowerManager from "./components/towers/towerManager";


export function loop() {
  if (Config.USE_PATHFINDER) {
    PathFinder.use(true);
  }

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
  this.logTelemetry(restarts);

  if (Game.time % 2 === 0) {
    restarts = 0;
  }
}

export function logTelemetry(restarts: number) {

  var rooms = Game.rooms
  var spawns = Game.spawns
  for (let roomKey in rooms) {
    let room = Game.rooms[roomKey]
    var isMyRoom = (room.controller ? room.controller.my : 0)
    if (isMyRoom) {
      Memory["stats"]['room.' + room.name + '.myRoom'] = 1
      Memory["stats"]['room.' + room.name + '.energyAvailable'] = room.energyAvailable;
      Memory["stats"]['room.' + room.name + '.energyCapacityAvailable'] = room.energyCapacityAvailable;
      if (room.controller) {
        Memory["stats"]['room.' + room.name + '.controllerProgress'] = room.controller.progress;
        Memory["stats"]['room.' + room.name + '.controllerProgressTotal'] = room.controller.progressTotal;
      }
      var stored = 0
      var storedTotal = 0

      if (room.storage) {
        stored = room.storage.store.energy;
        storedTotal = room.storage.storeCapacity;
      } else {
        stored = 0
        storedTotal = 0
      }
      Memory['stats']['room.' + room.name + '.creeps'] = room.find(FIND_MY_CREEPS).length;
      Memory['stats']['room.' + room.name + '.enemyCreeps'] = room.find(FIND_HOSTILE_CREEPS).length;
      Memory["stats"]['room.' + room.name + '.storedEnergy'] = stored;
    } else {
      Memory["stats"]['room.' + room.name + '.myRoom'] = undefined
    }
  }
  Memory["stats"]["global.creeps"] = _.size(Game.creeps);
  Memory["stats"]['gcl.progress'] = Game.gcl.progress;
  Memory["stats"]['gcl.progressTotal'] = Game.gcl.progressTotal;
  Memory["stats"]['gcl.level'] = Game.gcl.level;
  for (let spawnKey in spawns) {
    let spawn = Game.spawns[spawnKey];
    Memory["stats"]['spawn.' + spawn.name + '.defenderIndex'] = spawn.memory['defenderIndex'];
  }

  Memory["stats"]['memory.used'] = RawMemory.get().length;
  Memory["stats"]['memory.max'] = 2048 * 1024
  Memory["stats"]['cpu.CreepManagers'] = 0
  Memory["stats"]['cpu.Towers'] = 0
  Memory["stats"]['cpu.Links'] = 0
  Memory["stats"]['cpu.SetupRoles'] = 0
  Memory["stats"]['cpu.Creeps'] = 0
  Memory["stats"]['cpu.SumProfiling'] = 0
  Memory["stats"]['cpu.Start'] = 0
  Memory["stats"]['cpu.bucket'] = Game.cpu.bucket
  Memory["stats"]['cpu.limit'] = Game.cpu.limit
  Memory["stats"]['cpu.stats'] = Game.cpu.getUsed() - Game.time
  Memory["stats"]['cpu.getUsed'] = Game.cpu.getUsed()
  Memory["stats"]['game.time'] = Game.time;
  Memory["stats"]['game.restarts'] = restarts;
  console.log(Memory["stats"]['game.reloadTime']);
}
