import * as telemetry from './lib/telemetry';
import * as creeps from './creeps/creeps'
import * as spawns from './spawns/spawns';
import * as towers from './towers/towers';
import * as b3 from './lib/behavior3';
import Profiler from './lib/profiling';

let profiler = new Profiler();
//profiler.enable();
Game["profiler"] = profiler;
profiler.registerObject(b3.BehaviorTree, b3.BehaviorTree.name);
profiler.registerObject(creeps.CreepTree, creeps.CreepTree.name);
profiler.registerObject(spawns.SpawnTree, spawns.SpawnTree.name);
profiler.registerObject(towers.TowerTree, towers.TowerTree.name);

telemetry.initialize();

// clean up misc. things with behavior trees assigned that no longer exist in the game
if (Memory["_bt"] && Game.time % 1000) {
  for (let bt in Memory["_bt"]) {
    if (Game.getObjectById(bt) === null) {
      delete Memory["_bt"][bt];
    }
  }
}

let creepBehaviorTree = new b3.BehaviorTree(new creeps.CreepTree());
let spawnBehaviorTree = new b3.BehaviorTree(new spawns.SpawnTree());
let towerBehaviorTree = new b3.BehaviorTree(new towers.TowerTree());

export function loop() {
  profiler.wrap(mainloop);
}

function mainloop() {

  PathFinder.use(true);

  let metrics: telemetry.Metrics = new telemetry.Metrics();

  for (let name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
    }
  }

  let creepLoopTimes: number[] = [];
  let spawnLoopTimes: number[] = [];
  let towerLoopTimes: number[] = [];
  let linkLoopTimes: number[] = [];

  let loopStart = Game.cpu.getUsed();
  for (let room in Game.rooms) {
    let gameRoom = Game.rooms[room];

    if (!Memory.rooms[room]) {
      Memory.rooms[room] = {};
    }

    learnStorageLinks(gameRoom);
    learnSources(gameRoom);
    learnSourceLinks(gameRoom);

    let creepStart = Game.cpu.getUsed();
    let myCreeps = gameRoom.find<Creep>(FIND_MY_CREEPS);
    for (let c of myCreeps) {
      creepBehaviorTree.screepsTick(c);
    }
    let creepEnd = Game.cpu.getUsed();
    creepLoopTimes.push(creepEnd - creepStart);

    let spawnStart = Game.cpu.getUsed();
    let spawns = gameRoom.find<Spawn>(FIND_MY_SPAWNS);
    for (let spawn of spawns) {
      spawnBehaviorTree.screepsTick(spawn);
    }
    let spawnEnd = Game.cpu.getUsed();
    spawnLoopTimes.push(spawnEnd - spawnStart);

    let towerStart = Game.cpu.getUsed();
    let towers = gameRoom.find<Tower>(FIND_STRUCTURES, { filter: (s: Structure) => s.structureType === STRUCTURE_TOWER });
    for (let tower of towers) {
      towerBehaviorTree.screepsTick(tower);
    }
    let towerEnd = Game.cpu.getUsed();
    towerLoopTimes.push(towerEnd - towerStart);

    let linkStart = Game.cpu.getUsed();
    let linkIds = Memory.rooms[room].sourceLinkIds;
    let storageLinkId = Memory.rooms[room].storageLinkId;

    if (linkIds && linkIds.length > 0 && storageLinkId) {
      let storageLink = Game.getObjectById<StructureLink>(storageLinkId);
      if (storageLink != null) {
        for (let l of linkIds) {

          let link = Game.getObjectById<StructureLink>(l);

          if (link == null || link.cooldown > 0 || link.energy < link.energyCapacity) {
            return true; //continue;
          }

          if (storageLink.energy > 0) {
            return true; //continue;
          }

          link.transferEnergy(storageLink);
        }
      }
    }
    let linkEnd = Game.cpu.getUsed();
    linkLoopTimes.push(linkEnd - linkStart);
  }

  let loopEnd = Game.cpu.getUsed();

  metrics.mainLoopTime = loopEnd - loopStart;
  metrics.creepLoopTime = _.sum(creepLoopTimes);
  metrics.spawnLoopTime = _.sum(spawnLoopTimes);
  metrics.towerLoopTime = _.sum(towerLoopTimes);
  metrics.linkLoopTime = _.sum(linkLoopTimes);

  telemetry.logTelemetry(metrics);
}

function learnStorageLinks(room: Room): void {
  if (!room.controller || !room.controller.my) {
    return;
  }

  if (!Memory.rooms) {
    Memory.rooms = {};
  }
  if (!Memory.rooms[room.name]) {
    Memory.rooms[room.name] = {};
  }

  if (Memory.rooms[room.name].storageLinkId) {
    return;
  }

  let storages = room.find<StructureStorage>(FIND_STRUCTURES, {
    filter: (s: Structure) => s instanceof StructureStorage
  })

  if (storages == null || storages.length === 0) {
    return;
  }
  let storage = storages[0];
  let links = storage.pos.findInRange<StructureLink>(FIND_STRUCTURES, 1, {
    filter: (s: Structure) => s instanceof StructureLink
  });

  if (links == null || links.length === 0) {
    return;
  }

  Memory.rooms[room.name].storageLinkId = links[0].id;
}

function learnSources(room: Room) {
  if (!room.controller || !room.controller.my) {
    return;
  }

  if (!Memory.rooms[room.name]) {
    Memory.rooms[room.name] = {};
  }

  if (Memory.rooms[room.name].sourceIds
    && Memory.rooms[room.name].sourceIds.length > 0) {
    return;
  }

  Memory.rooms[room.name].sourceIds = [];
  let sources = room.find<Source>(FIND_SOURCES);

  if (sources == null || sources.length === 0) {
    return;
  }

  _.forEach(sources, (s: Source) => {
    Memory.rooms[room.name].sourceIds.push(s.id);
  });
}

function learnSourceLinks(room: Room): void {
  if (!room.controller || !room.controller.my) {
    return;
  }

  if (!Memory.rooms) {
    Memory.rooms = {};
  }
  if (!Memory.rooms[room.name]) {
    Memory.rooms[room.name] = {};
  }

  if (Memory.rooms[room.name].sourceLinkIds
    && Memory.rooms[room.name].sourceLinkIds.length === Memory.rooms[room.name].sourceIds.length) {
    return;
  }

  Memory.rooms[room.name].sourceLinkIds = [];

  _.forEach(Memory.rooms[room.name].sourceIds, (s: string) => {
    let source = Game.getObjectById<Source>(s);

    if (source === null) {
      return true;
    }

    let links = source.pos.findInRange<StructureLink>(FIND_STRUCTURES, 2, {
      filter: (s: Structure) => s instanceof StructureLink
    });

    if (links == null || links.length === 0) {
      return;
    }

    Memory.rooms[room.name].sourceLinkIds.push(links[0].id);
  })
}