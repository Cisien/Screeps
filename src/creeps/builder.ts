import * as b3 from './../lib/behavior3'
import * as defs from './../config/creepDefs'
import * as common from './common'


export default class BuilderNode extends b3.MemSequence implements b3.MemSequence {
  constructor() {
    super([new common.PathToEnergyNode(), new common.MoveToEnergyNode(), new common.PickupEnergyNode(),
    new PathToConstructionSiteNode(), new MoveToConstructionSiteNode(), new BuildNode()]);
    this.id = BuilderNode.name;
  }

  tick(tick: b3.Tick): b3.State {
    let creep: Creep = tick.target as Creep;
    if (creep.memory.role === defs.WorkerTypes.BUILDER) {
      return super.tick(tick);
    }
    else {
      // success means go onto the next guy, we have nothing to do
      return b3.State.SUCCESS;
    }
  }
}

class PathToConstructionSiteNode extends b3.BaseNode implements b3.BaseNode {
  constructor() {
    super();
    this.id = PathToConstructionSiteNode.name;
  }

  tick(tick: b3.Tick): b3.State {
    let creep: Creep = tick.target as Creep;

    let sites = creep.room.find<ConstructionSite>(FIND_CONSTRUCTION_SITES);

    if(!sites || sites.length === 0) {
      return b3.State.FAILURE
    }

    let closest = creep.pos.findClosestByRange<ConstructionSite>(sites);
    if (!closest) {
      return b3.State.FAILURE
    }

    creep.memory.constructionSite = closest.id;
    creep.memory.path = Room.serializePath(creep.room.findPath(creep.pos, closest.pos))

    return b3.State.SUCCESS;
  }
}

class MoveToConstructionSiteNode extends b3.BaseNode implements b3.BaseNode {
  constructor() {
    super();
    this.id = MoveToConstructionSiteNode.name;
  }

  tick(tick: b3.Tick): b3.State {
    let creep: Creep = tick.target as Creep;

    let storage = Game.getObjectById<ConstructionSite>(creep.memory.constructionSite);
    if (storage === null) {
      return b3.State.FAILURE;
    }

    if (creep.pos.inRangeTo(storage.pos, 3)) {
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

class BuildNode extends b3.BaseNode implements b3.BaseNode {
  constructor() {
    super();
    this.id = BuildNode.name;
  }

  tick(tick: b3.Tick): b3.State {
    let creep: Creep = tick.target as Creep;
    let site = Game.getObjectById<ConstructionSite>(creep.memory.constructionSite);
    if (site === null) {
      return b3.State.FAILURE;
    }

    let transferStatus = creep.build(site);

    if (transferStatus === ERR_NOT_IN_RANGE) {
      return b3.State.FAILURE;
    }

    if (transferStatus === ERR_NOT_ENOUGH_ENERGY) {
      return b3.State.FAILURE;
    }

    return b3.State.RUNNING;
  }
}
