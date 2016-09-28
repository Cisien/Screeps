import * as b3 from './../lib/behavior3'

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
      filter: (r: Resource) => r.amount >= creep.carryCapacity * 1.25
    });

    for (let obj of resources) {
      energyStuff.push(obj);
    }

    let storage = creep.room.find<Structure>(FIND_STRUCTURES)

    storage = _.filter<Structure>(storage, (s) => (s instanceof StructureStorage && s.store.energy >= creep.carryCapacity));

    if (storage == undefined || storage.length === 0) {
      storage = _.filter<Structure>(storage, (s) => (s instanceof StructureContainer && s.store.energy >= creep.carryCapacity));
    }

    if (storage == undefined || storage.length === 0) {
      return b3.State.FAILURE;
    }

    for (let obj of storage) {
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

export class MoveToEnergyNode extends b3.BaseNode implements b3.BaseNode {
  constructor() {
    super();
    this.id = MoveToEnergyNode.name;
  }

  tick(tick: b3.Tick): b3.State {
    let creep: Creep = tick.target as Creep;

    if (creep.carry.energy > 0) {
      return b3.State.SUCCESS
    }


    let resource = Game.getObjectById<RoomObject>(creep.memory.resource);
    if (resource === null) {
      return b3.State.FAILURE;
    }

    if (creep.pos.inRangeTo(resource.pos, 1)) {
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

export class PickupEnergyNode extends b3.BaseNode implements b3.BaseNode {
  constructor() {
    super();
    this.id = PickupEnergyNode.name;
  }

  tick(tick: b3.Tick): b3.State {
    let creep: Creep = tick.target as Creep;
    if (creep.carry.energy > 0) {
      return b3.State.SUCCESS
    }


    let resource = Game.getObjectById<Resource | Structure>(creep.memory.resource);
    if (resource === null) {
      return b3.State.FAILURE;
    }


    let pickupStatus = OK;
    if (resource instanceof Resource) {
      pickupStatus = creep.pickup(resource)
    } else if (resource instanceof Structure) {
      pickupStatus = creep.withdraw(resource, RESOURCE_ENERGY);
    }

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