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

  let loopStart = Game.cpu.getUsed();
  for (let room in Game.rooms) {
    let gameRoom = Game.rooms[room];

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
  }

  let loopEnd = Game.cpu.getUsed();

  metrics.mainLoopTime = loopEnd - loopStart;
  metrics.creepLoopTime = _.sum(creepLoopTimes);
  metrics.spawnLoopTime = _.sum(spawnLoopTimes);
  metrics.towerLoopTime = _.sum(towerLoopTimes);

  telemetry.logTelemetry(metrics);
}
