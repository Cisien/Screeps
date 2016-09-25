import * as b3 from './../lib/behavior3'
import * as defs from './../config/creepDefs'

export class CreepTree extends b3.Sequence implements b3.Sequence {
  constructor() {
    super([new MinerBehavior(), new UpgraderBehavior()]);
    this.id = CreepTree.name
  }
  tick(tick: b3.Tick): b3.State {
    return super.tick(tick);
  }
}

export class UpgraderBehavior extends b3.MemSequence implements b3.MemSequence {
  constructor() {
    super([new PathToEnergyBehavior(), new MoveToEnergyBehavior(), new PickupEnergyBehavior(),
    new PathToControllerBehavior(), new MoveToControllerBehavior(), new UpgradeControllerBehavior()]);
    this.id = UpgraderBehavior.name;
  }

  tick(tick: b3.Tick): b3.State {
    let creep: Creep = tick.target as Creep;
    if (creep.memory.role === defs.WorkerTypes.UPGRADER) {
      return super.tick(tick);
    }
    else {
      // success means go onto the next guy, we have nothing to do
      return b3.State.SUCCESS;
    }
  }
}

export class MinerBehavior extends b3.MemSequence implements b3.MemSequence {
  constructor() {
    super([new PathToSourceBehavior(), new MoveToSourceBehavior(), new HarvestSourceBehavior()]);
    this.id = MinerBehavior.name
  }

  tick(tick: b3.Tick): b3.State {
    let creep: Creep = tick.target as Creep;
    if (creep.memory.role === defs.WorkerTypes.MINER) {
      return super.tick(tick);
    }
    else {
      // success means go onto the next guy
      return b3.State.SUCCESS;
    }
  }
}

class PathToSourceBehavior extends b3.BaseNode implements b3.BaseNode {
  constructor() {
    super();
    this.id = PathToSourceBehavior.name
  }

  tick(tick: b3.Tick): b3.State {
    let creep: Creep = tick.target as Creep;

    let existingMiners = creep.room.find<Creep>(FIND_MY_CREEPS, {filter: (c:Creep) => c.memory.role === defs.WorkerTypes.MINER});

    let workedSources: {} = _.countBy(existingMiners, (c: Creep) => c.memory.source);

    let leastUsedSource: Source | undefined;
    let leastUsedSourceCount: number = 1000;

    let sources = creep.room.find<Source>(FIND_SOURCES);

    for (let src of sources) {
      if (!workedSources[src.id]) {
        console.log("no miners")
        leastUsedSource = src;
        leastUsedSourceCount = 0;
        break;
      }
    }

    if (!leastUsedSource) {
      console.log("Unable to find source to assign to new miner, aborting!")
      return ERR_INVALID_TARGET;
    }

    console.log("least used source is " + leastUsedSource + " with " + leastUsedSourceCount + " harvesters assigned.");

    creep.memory.source = leastUsedSource.id;
    creep.memory.path = Room.serializePath(creep.room.findPath(creep.pos, leastUsedSource.pos))

    return b3.State.SUCCESS;
  }
}

class MoveToSourceBehavior extends b3.BaseNode implements b3.BaseNode {
  constructor() {
    super();
    this.id = MoveToSourceBehavior.name
  }

  tick(tick: b3.Tick): b3.State {
    let creep: Creep = tick.target as Creep;

    let source = Game.getObjectById<Source>(creep.memory.source);
    if (source != null) {
      if (creep.pos.inRangeTo(source.pos, 1)) {
        return b3.State.SUCCESS;
      }
    }

    let moveStatus = creep.moveByPath(creep.memory.path);

    if (moveStatus == ERR_NOT_FOUND) {
      return b3.State.FAILURE;
    }

    return b3.State.RUNNING;
  }
}

class HarvestSourceBehavior extends b3.BaseNode implements b3.BaseNode {
  constructor() {
    super();
    this.id = HarvestSourceBehavior.name;
  }
  tick(tick: b3.Tick): b3.State {
    let creep: Creep = tick.target as Creep;

    let harvestStatus = creep.harvest(Game.getObjectById<Source>(creep.memory.source) !)

    if (harvestStatus === ERR_NOT_IN_RANGE) {
      return b3.State.FAILURE;
    }
    else {
      return b3.State.RUNNING;
    }

  }
}

//upgrader

class PathToEnergyBehavior extends b3.BaseNode implements b3.BaseNode {
  constructor() {
    super();
    this.id = PathToEnergyBehavior.name
  }
  tick(tick: b3.Tick): b3.State {
    let creep: Creep = tick.target as Creep;

    let resource = creep.room.find<Resource>(FIND_DROPPED_ENERGY, { filter: (r: Resource) => r.amount >= creep.carryCapacity })[0];
    if (resource === undefined) {
      return b3.State.FAILURE;
    }

    creep.memory.resource = resource.id;
    creep.memory.path = Room.serializePath(creep.room.findPath(creep.pos, resource.pos))

    return b3.State.SUCCESS;
  }
}


class MoveToEnergyBehavior extends b3.BaseNode implements b3.BaseNode {
  constructor() {
    super();
    this.id = MoveToEnergyBehavior.name;
  }

  tick(tick: b3.Tick): b3.State {
    let creep: Creep = tick.target as Creep;

    let resource = Game.getObjectById<Resource>(creep.memory.resource);
    if (resource === null) {
      return b3.State.FAILURE;
    }

    if (creep.pos.inRangeTo(resource.pos, 1)) {
      return b3.State.SUCCESS;
    }

    let moveStatus = creep.moveByPath(creep.memory.path);

    if (moveStatus == ERR_NOT_FOUND) {
      return b3.State.FAILURE;
    }

    return b3.State.RUNNING;
  }
}

class PickupEnergyBehavior extends b3.BaseNode implements b3.BaseNode {
  constructor() {
    super();
    this.id = PickupEnergyBehavior.name;
  }

  tick(tick: b3.Tick): b3.State {
    let creep: Creep = tick.target as Creep;

    let resource = Game.getObjectById<Resource>(creep.memory.resource);
    if (resource === null) {
      return b3.State.FAILURE;
    }

    let pickupStatus = creep.pickup(resource)

    if (pickupStatus === ERR_NOT_IN_RANGE) {
      return b3.State.FAILURE;
    }
    else if (creep.carry.energy === creep.carryCapacity) {
      return b3.State.SUCCESS;
    }
    else {
      return b3.State.RUNNING;
    }
  }
}

class PathToControllerBehavior extends b3.BaseNode implements b3.BaseNode {
  constructor() {
    super();
    this.id = PathToControllerBehavior.name;
  }

  tick(tick: b3.Tick): b3.State {
    let creep: Creep = tick.target as Creep;

    let controller = creep.room.controller
    if (controller === undefined || !controller.my) {
      return b3.State.FAILURE;
    }

    creep.memory.controller = controller.id;
    creep.memory.path = Room.serializePath(creep.room.findPath(creep.pos, controller.pos))

    return b3.State.SUCCESS;
  }
}

class MoveToControllerBehavior extends b3.BaseNode implements b3.BaseNode {
  constructor() {
    super();
    this.id = MoveToControllerBehavior.name;
  }

  tick(tick: b3.Tick): b3.State {
    let creep: Creep = tick.target as Creep;

    let controller = Game.getObjectById<Controller>(creep.memory.controller);
    if (controller === null) {
      return b3.State.FAILURE;
    }

    if (creep.pos.inRangeTo(controller.pos, 3)) {

      return b3.State.SUCCESS;
    }

    if (creep.fatigue > 0) {
      return b3.State.RUNNING
    }

    let moveStatus = creep.moveByPath(creep.memory.path);

    if (moveStatus == ERR_NOT_FOUND) {
      return b3.State.FAILURE;
    }

    return b3.State.RUNNING;
  }
}

class UpgradeControllerBehavior extends b3.BaseNode implements b3.BaseNode {
  constructor() {
    super();
    this.id = UpgradeControllerBehavior.name;
  }

  tick(tick: b3.Tick): b3.State {
    let creep: Creep = tick.target as Creep;

    let controller = Game.getObjectById<Controller>(creep.memory.controller);
    if (controller === null) {
      return b3.State.FAILURE;
    }

    let upgradeStatus = creep.upgradeController(controller);

    if (upgradeStatus === ERR_NOT_IN_RANGE) {
      return b3.State.FAILURE;
    }

    if (upgradeStatus === ERR_NOT_ENOUGH_ENERGY) {
      return b3.State.FAILURE;
    }

    return b3.State.RUNNING;
  }
}
