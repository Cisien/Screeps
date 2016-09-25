import * as b3 from './../lib/behavior3'

export class MoveToRepairSiteNode extends b3.BaseNode implements b3.BaseNode {
  constructor() {
    super();
    this.id = MoveToRepairSiteNode.name;
  }

  tick(tick: b3.Tick): b3.State {
    let creep: Creep = tick.target as Creep;

    let site = Game.getObjectById<Structure>(creep.memory.site);
    if (site === null) {
      return b3.State.FAILURE;
    }

    if (creep.pos.inRangeTo(site.pos, 3)) {
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

export class RepairNode extends b3.BaseNode implements b3.BaseNode {
  constructor() {
    super();
    this.id = RepairNode.name;
  }

  tick(tick: b3.Tick): b3.State {
    let creep: Creep = tick.target as Creep;

    let site = Game.getObjectById<Structure>(creep.memory.site);
    if (site === null) {
      return b3.State.FAILURE;
    }

    if(site.hits == site.hitsMax) {
      delete creep.memory.site
      return b3.State.SUCCESS;
    }

    let transferStatus = creep.repair(site);

    if (transferStatus === ERR_NOT_IN_RANGE) {
      return b3.State.FAILURE;
    }

    if (transferStatus === ERR_NOT_ENOUGH_ENERGY) {
      return b3.State.FAILURE;
    }

    return b3.State.RUNNING;
  }
}
