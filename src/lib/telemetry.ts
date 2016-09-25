import ScreepStats from './screepsstats'

export let restarts: number;

declare var global: any;
export function initialize() {

  if (!Memory["stats"]) {
    Memory["stats"] = {};
  }

  this.restarts = 1;
  Memory["stats"]['game.reloadTime'] = Game.time;

  if (Memory["stats"]['game.reloadCount'] === undefined) {
    Memory["stats"]['game.reloadCount'] = 0;
  }
  Memory["stats"]['game.reloadCount']++;
  console.log('<span style="color: red;">reload at ' + Game.time + '. reloaded ' + Memory["stats"]['game.reloadCount'] + ' times.</span>');

  global.Stats = new ScreepStats();
}

export class Metrics {
  globalStart: number = 0;
  globalEnd: number = 0;
  towerStart: number = 0;
  towerEnd: number = 0;
  creepStart: number = 0;
  creepEnd: number = 0;
  spawnStart: number = 0;
  spawnEnd: number = 0;
}

export function logTelemetry(metrics: Metrics) {
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
      var stored: number | undefined = 0
      var storedTotal: number | undefined = 0

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

  //Memory["stats"]['memory.used'] = RawMemory.get().length;
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
  Memory["stats"]['cpu.mainLoopTime'] = metrics.globalEnd - metrics.globalEnd;
  Memory["stats"]['cpu.creepTime'] = metrics.creepEnd - metrics.creepStart;
  Memory["stats"]['cpu.spawnTime'] = metrics.spawnEnd - metrics.spawnStart;
  Memory["stats"]['cpu.towerTime'] = metrics.towerEnd - metrics.towerStart;
  Memory["stats"]['cpu.getUsed'] = Game.cpu.getUsed()
  Memory["stats"]['game.time'] = Game.time;
  Memory["stats"]['game.restarts'] = restarts;

  global.Stats.runBuiltinStats()
}
