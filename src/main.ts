import * as telemetry from './lib/telemetry';
import * as behaviors from './creeps/behaviors'
import * as spawns from './spawns/spawns';
import * as towers from './towers/towers';
import * as b3 from './lib/behavior3';

telemetry.initialize();

// clean up misc. things with behavior trees assigned that no longer exist in the game
if (Memory["_bt"] && Game.time % 1000) {
  for (let bt in Memory["_bt"]) {
    if (Game.getObjectById(bt) === null) {
      delete Memory["_bt"][bt];
    }
  }
}

let creepBehaviorTree = new b3.BehaviorTree(new behaviors.CreepTree());
let spawnBehaviorTree = new b3.BehaviorTree(new spawns.SpawnTree());
let towerBehaviorTree = new b3.BehaviorTree(new towers.TowerTree());

export function loop() {
  PathFinder.use(true);

  let metrics: telemetry.Metrics = new telemetry.Metrics();

  for (let name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
    }
  }

  metrics.globalStart = Game.cpu.getUsed();
  for (let room in Game.rooms) {
    let gameRoom = Game.rooms[room];
    let myCreeps = gameRoom.find<Creep>(FIND_MY_CREEPS);
    for (let c of myCreeps) {
      creepBehaviorTree.screepsTick(c);
    }

    let spawns = gameRoom.find<Spawn>(FIND_MY_SPAWNS);
    for (let spawn of spawns) {
      spawnBehaviorTree.screepsTick(spawn);
    }

    let towers = gameRoom.find<Tower>(FIND_STRUCTURES, { filter: (s: Structure) => s.structureType === STRUCTURE_TOWER });
    for (let tower of towers) {
      towerBehaviorTree.screepsTick(tower);
    }

  }
  metrics.globalEnd = Game.cpu.getUsed();

  telemetry.logTelemetry(metrics);
}
