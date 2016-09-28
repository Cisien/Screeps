import * as b3 from './../lib/behavior3'
import * as defs from './../config/creepDefs'
import * as common from './common'


export default class HaulerNode extends b3.MemSequence implements b3.MemSequence {
  constructor() {
    super([new PathToEnergyNode(), new common.MoveToEnergyNode(), new common.PickupEnergyNode(),
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

export class PathToEnergyNode extends b3.BaseNode implements b3.BaseNode {
  constructor() {
    super();
    this.id = PathToEnergyNode.name
  }
  tick(tick: b3.Tick): b3.State {
    let creep: Creep = tick.target as Creep;

    if (creep.carry.energy > 0) {
      return b3.State.SUCCESS
    }

    let energyStuff: (Resource | Structure)[] = [];

    let resources = creep.room.find<Resource>(FIND_DROPPED_ENERGY, {
      filter: (r: Resource) => r.amount >= creep.carryCapacity * .5
    });

    for (let obj of resources) {
      energyStuff.push(obj);
    }

    let storage = creep.room.find<Structure>(FIND_STRUCTURES)
    let selectedStorage: Structure[] = [];

    if (Memory.rooms[creep.room.name].storageLinkId != undefined) {
      let storageLink = Game.getObjectById<StructureLink>(Memory.rooms[creep.room.name].storageLinkId)
      if (storageLink != null && storageLink.energy > 0) {
        selectedStorage.push(storageLink);
      }
    }

    if (selectedStorage.length === 0) {
      selectedStorage = _.filter<Structure>(storage, (s: Structure) => (s instanceof StructureContainer && s.store.energy >= creep.carryCapacity));
    }

    if (selectedStorage == undefined || selectedStorage.length === 0) {
      selectedStorage = _.filter<Structure>(storage, (s: Structure) => (s instanceof StructureStorage && s.store.energy >= creep.carryCapacity));
    }

    if (selectedStorage == undefined || selectedStorage.length === 0) {
      return b3.State.FAILURE;
    }

    for (let obj of selectedStorage) {
      energyStuff.push(obj);
    }

    let resource = creep.pos.findClosestByRange<Resource | Structure>(energyStuff);
    if (!resource) {
      return b3.State.FAILURE;
    }

    creep.memory.resource = resource.id;
    creep.memory.path = Room.serializePath(creep.room.findPath(creep.pos, resource.pos))

    return b3.State.SUCCESS;
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
      if (creep.memory.lastPos.ticks === 5) {
        delete creep.memory.path;
        delete creep.memory.lastPos.ticks
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
