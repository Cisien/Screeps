import * as b3 from './../lib/behavior3'
import * as defs from './../config/creepDefs'


export default class MinerNode extends b3.MemSequence implements b3.MemSequence {
  constructor() {
    super([new PathToSourceNode(), new MoveToSourceNode(), new HarvestSourceNode()]);
    this.id = MinerNode.name
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

class PathToSourceNode extends b3.BaseNode implements b3.BaseNode {
  constructor() {
    super();
    this.id = PathToSourceNode.name
  }

  tick(tick: b3.Tick): b3.State {
    let creep: Creep = tick.target as Creep;

    let existingMiners = creep.room.find<Creep>(FIND_MY_CREEPS, { filter: (c: Creep) => c.memory.role === defs.WorkerTypes.MINER });

    let workedSources: { [key: string]: number } = _.countBy<Creep>(existingMiners, (c: Creep) => c.memory.source);

    let leastUsedSource: Source | null | undefined;
    let leastUsedSourceCount: number = 1000;

    if (creep.memory.source) {
      leastUsedSource = Game.getObjectById<Source>(creep.memory.source)
    }
    else {
      let sources = creep.room.find<Source>(FIND_SOURCES);

      for (let src of sources) {
        if (!workedSources[src.id]) {
          console.log("no miners")
          leastUsedSource = src;
          leastUsedSourceCount = 0;
          break;
        }
      }
    }

    if (!leastUsedSource) {
      console.log("Unable to find source to assign to new miner, aborting!")
      return b3.State.FAILURE;
    }

    console.log("least used source is " + leastUsedSource + " with " + leastUsedSourceCount + " harvesters assigned.");

    let selectedTank: Structure | undefined | null = undefined;

    if (creep.memory.tank) {
      Game.getObjectById<Structure>(creep.memory.tank);
    }
    else {
      let tank = leastUsedSource.pos.findInRange<Structure>(FIND_STRUCTURES, 1,
        { filter: (s: Structure) => s instanceof StructureContainer });

      if (tank && tank.length > 0) {
        selectedTank = _.first<Structure>(tank);
        creep.memory.tank = selectedTank.id
      }
    }

    creep.memory.source = leastUsedSource.id;

    creep.memory.path = Room.serializePath(creep.room.findPath(creep.pos, selectedTank ? selectedTank.pos : leastUsedSource.pos))

    return b3.State.SUCCESS;
  }
}

class MoveToSourceNode extends b3.BaseNode implements b3.BaseNode {
  constructor() {
    super();
    this.id = MoveToSourceNode.name
  }

  tick(tick: b3.Tick): b3.State {
    let creep: Creep = tick.target as Creep;

    let source = Game.getObjectById<Source | Structure>(creep.memory.source);
    if (source != null) {
      if (creep.pos.inRangeTo(source.pos, 1)) {
        return b3.State.SUCCESS;
      }
    }

    if (creep.fatigue > 0) {
      return b3.State.RUNNING;
    }

    let moveStatus = creep.moveByPath(creep.memory.path);

    if (moveStatus == ERR_NOT_FOUND) {
      return b3.State.FAILURE;
    }

    return b3.State.RUNNING;
  }
}

class HarvestSourceNode extends b3.BaseNode implements b3.BaseNode {
  constructor() {
    super();
    this.id = HarvestSourceNode.name;
  }
  tick(tick: b3.Tick): b3.State {
    let creep: Creep = tick.target as Creep;

    let source = Game.getObjectById<Source>(creep.memory.source);

    if (creep.memory.tank) {
      let tank = Game.getObjectById<Container>(creep.memory.tank);

      if (tank === null || tank.store.energy === tank.storeCapacity) {
        return b3.State.RUNNING;
      }
    }

    let harvestStatus = creep.harvest(source!)

    if (harvestStatus === ERR_NOT_IN_RANGE) {
      return b3.State.FAILURE;
    }
    else {
      return b3.State.RUNNING;
    }
  }
}
