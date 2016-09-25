import * as b3 from './../lib/behavior3'
import * as defs from './../config/creepDefs'
import * as common from './common'


export default class UpgraderBehavior extends b3.MemSequence implements b3.MemSequence {
  constructor() {
    super([new common.PathToEnergyNode(), new common.MoveToEnergyNode(), new common.PickupEnergyNode(),
    new PathToControllerBehavior(), new MoveToControllerBehavior(), new UpgradeControllerBehavior()]);
    this.id = UpgraderBehavior.name;

    Game['profiler'].registerObject(common.PathToEnergyNode, common.PathToEnergyNode.name);
    Game['profiler'].registerObject(common.MoveToEnergyNode, common.MoveToEnergyNode.name);
    Game['profiler'].registerObject(common.PickupEnergyNode, common.PickupEnergyNode.name);
    Game['profiler'].registerObject(PathToControllerBehavior, PathToControllerBehavior.name);
    Game['profiler'].registerObject(MoveToControllerBehavior, MoveToControllerBehavior.name);
    Game['profiler'].registerObject(UpgradeControllerBehavior, UpgradeControllerBehavior.name);
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
      return b3.State.RUNNING;
    }

    if (!creep.memory.lastPos) {
      creep.memory.lastPos = { x: creep.pos.x, y: creep.pos.y, ticks: 0 };
    }
    let moveStatus = creep.moveByPath(creep.memory.path);

    if (moveStatus == ERR_NOT_FOUND) {
      return b3.State.FAILURE;
    }
    if (moveStatus == ERR_TIRED) {
      return b3.State.RUNNING;
    }


    if (creep.pos.x === creep.memory.lastPos.x && creep.pos.y === creep.memory.lastPos.y) {
      if(creep.memory.lastPos.ticks >= 5) {
      delete creep.memory.path;
      return b3.State.FAILURE;
      } else {
        creep.memory.lastPos.ticks++;
        return b3.State.RUNNING;
      }
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
