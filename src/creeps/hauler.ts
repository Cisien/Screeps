import * as b3 from './../lib/behavior3'
import * as defs from './../config/creepDefs'
import * as common from './common'


export default class HaulerNode extends b3.MemSequence implements b3.MemSequence {
  constructor() {
    super([new common.PathToEnergyNode(), new common.MoveToEnergyNode(), new common.PickupEnergyNode(),
    new PathToStorageNode(), new MoveToStorageNode(), new TransferToStorageNode()]);
    this.id = HaulerNode.name;

    Game['profiler'].registerObject(common.PathToEnergyNode, common.PathToEnergyNode.name);
    Game['profiler'].registerObject(common.MoveToEnergyNode, common.MoveToEnergyNode.name);
    Game['profiler'].registerObject(common.PickupEnergyNode, common.PickupEnergyNode.name);
    Game['profiler'].registerObject(PathToStorageNode, PathToStorageNode.name);
    Game['profiler'].registerObject(MoveToStorageNode, MoveToStorageNode.name);
    Game['profiler'].registerObject(TransferToStorageNode, TransferToStorageNode.name);
  }

  tick(tick: b3.Tick): b3.State {
    let creep: Creep = tick.target as Creep;
    if (creep.memory.role === defs.WorkerTypes.HAULER) {
      return super.tick(tick);
    }
    else {
      // success means go onto the next guy, we have nothing to do
      return b3.State.SUCCESS;
    }
  }
}

class PathToStorageNode extends b3.BaseNode implements b3.BaseNode {
  constructor() {
    super();
    this.id = PathToStorageNode.name;
  }

  tick(tick: b3.Tick): b3.State {
    let creep: Creep = tick.target as Creep;

    let storage = creep.room.find<Structure>(FIND_STRUCTURES);

    let allStorage = _.filter<Structure>(storage, (s) =>
        (s instanceof StructureSpawn
          || s instanceof StructureExtension
          || s instanceof StructureTower)
        && s.energy < s.energyCapacity
    )

    if (!allStorage || allStorage.length === 0) {
      allStorage = _.filter(storage, (s) => s instanceof StructureStorage && s.store.energy < s.storeCapacity);
    }

    let closest = creep.pos.findClosestByRange<Structure>(allStorage);
    if (!closest) {
      return b3.State.FAILURE
    }

    creep.memory.storage = closest.id;
    creep.memory.path = Room.serializePath(creep.room.findPath(creep.pos, closest.pos))

    return b3.State.SUCCESS;
  }
}

class MoveToStorageNode extends b3.BaseNode implements b3.BaseNode {
  constructor() {
    super();
    this.id = MoveToStorageNode.name;
  }

  tick(tick: b3.Tick): b3.State {
    let creep: Creep = tick.target as Creep;

    let storage = Game.getObjectById<Structure>(creep.memory.storage);
    if (storage === null) {
      return b3.State.FAILURE;
    }

    if (creep.pos.inRangeTo(storage.pos, 1)) {
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

class TransferToStorageNode extends b3.BaseNode implements b3.BaseNode {
  constructor() {
    super();
    this.id = TransferToStorageNode.name;
  }

  tick(tick: b3.Tick): b3.State {
    let creep: Creep = tick.target as Creep;

    let storage = Game.getObjectById<Structure>(creep.memory.storage);
    if (storage === null) {
      return b3.State.FAILURE;
    }
    if ((storage instanceof StructureExtension || storage instanceof StructureSpawn || storage instanceof StructureTower)
      && storage.energy == storage.energyCapacity) {
      delete creep.memory.storage;
      return b3.State.SUCCESS;
    } else if (storage instanceof StructureStorage && storage.store.energy === storage.storeCapacity) {
      delete creep.memory.storage;
      return b3.State.SUCCESS
    }


    let transferStatus = creep.transfer(storage, RESOURCE_ENERGY);

    if (transferStatus === ERR_NOT_IN_RANGE) {
      return b3.State.FAILURE;
    }

    if (transferStatus === ERR_NOT_ENOUGH_ENERGY) {
      return b3.State.FAILURE;
    }

    return b3.State.RUNNING;
  }
}
