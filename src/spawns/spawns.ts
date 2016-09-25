import * as b3 from './../lib/behavior3';
import * as defs from './../config/creepDefs'

export class SpawnTree extends b3.MemSequence implements b3.MemSequence {
  constructor() {
    super([
      new SelectPartsForTierNode(),
      new SpawnMinerNode(),
      new SpawnHaulerNode(),
      new SpawnUpgraderNode(),
      new SpawnRepairerNode(),
      new SpawnBuilderNode(),
      new SpawnRampartRepairerNode(),
      new SpawnWallRepairerNode(),
    ]);
    this.id = SpawnTree.name;
  }

  tick(tick: b3.Tick): b3.State {
    let spawn: Spawn = tick.target;

    if (spawn.spawning !== null) {
      return b3.State.RUNNING;
    }

    if (spawn.room.energyAvailable < 300) {
      return b3.State.FAILURE;
    }

    let sources = spawn.room.find<Source>(FIND_SOURCES);
    spawn.memory.sourceCount = sources.length;

    return super.tick(tick);
  }
}

class SelectPartsForTierNode extends b3.BaseNode implements b3.BaseNode {
  constructor() {
    super();
    this.id = SelectPartsForTierNode.name
  }

  tick(tick: b3.Tick): b3.State {
    let spawn: Spawn = tick.target;

    let creeps = spawn.room.find(FIND_MY_CREEPS);
    // spawn at 300 to recover from full loss
    if (creeps.length === 0) {
      spawn.memory.forceSpawnType = defs.WorkerTypes.MINER;
      spawn.memory.tier = 300;
      return b3.State.SUCCESS;
    }

    let haulers = _.filter(creeps, (c: Creep) => c.memory.role === defs.WorkerTypes.HAULER);
    if (haulers.length === 0 && spawn.room.energyAvailable <= 300) {
      // no haulers, force spawn at 300 tier;
      spawn.memory.forceSpawnType = defs.WorkerTypes.HAULER;
      spawn.memory.tier = 300;
      b3.State.SUCCESS;
    }

    let cap = spawn.room.energyCapacityAvailable;

    let lastCap = 0;
    for (let parts in defs.PartDefinition) {
      let key = parseInt(parts);
      if (key <= cap && key > lastCap) {
        lastCap = key;
      } else {
        break;
      }
    }

    spawn.memory.tier = lastCap;
    return b3.State.SUCCESS;
  }
}

class SpawnNodeBase extends b3.BaseNode implements b3.BaseNode {
  _doSpawn(parts: string[], type: string, spawn: Spawn): b3.State {
    if (spawn.room.energyAvailable >= spawn.memory.tier) {
      let spawnResult = spawn.createCreep(parts, undefined, { role: type });

      if (spawnResult == OK) {
        return b3.State.RUNNING;
      } else {
        return b3.State.FAILURE;
      }
    }
    return b3.State.FAILURE;
  }
}

class SpawnMinerNode extends SpawnNodeBase implements SpawnNodeBase {
  constructor() {
    super();
    this.id = SpawnMinerNode.name;
  }

  tick(tick: b3.Tick): b3.State {
    super.tick(tick);
    let spawn: Spawn = tick.target;

    let parts = defs.MINER_PARTS[spawn.memory.tier];
    let type = defs.WorkerTypes.MINER;

    if (parts.length === 0) {
      return b3.State.FAILURE;
    }

    if (spawn.memory.forceSpawnType === type) {
      return this._doSpawn(parts, type, spawn);
    }

    let miners = spawn.room.find<Creep>(FIND_MY_CREEPS, { filter: (c: Creep) => c.memory.role === type });

    if (miners.length <= spawn.memory.sourceCount) {
      return this._doSpawn(parts, type, spawn);
    }

    return b3.State.SUCCESS
  }
}

class SpawnUpgraderNode extends SpawnNodeBase implements SpawnNodeBase {
  constructor() {
    super();
    this.id = SpawnUpgraderNode.name
  }

  tick(tick: b3.Tick): b3.State {
    let spawn: Spawn = tick.target;

    let type = defs.WorkerTypes.UPGRADER;
    let parts = defs.WORKER_PARTS[spawn.memory.tier];

    if (parts.length === 0) {
      return b3.State.FAILURE;
    }

    if (spawn.memory.forceSpawnType === type) {
      return this._doSpawn(parts, type, spawn);
    }

    let upgraders = spawn.room.find<Creep>(FIND_MY_CREEPS, { filter: (c: Creep) => c.memory.role === type });

    if (upgraders.length <= spawn.memory.sourceCount * defs.Counts.UPGRADER) {
      return this._doSpawn(parts, type, spawn);
    }

    return b3.State.SUCCESS
  }
}

class SpawnHaulerNode extends SpawnNodeBase implements SpawnNodeBase {
  constructor() {
    super();
    this.id = SpawnHaulerNode.name
  }

  tick(tick: b3.Tick): b3.State {
    let spawn: Spawn = tick.target;

    let type = defs.WorkerTypes.HAULER;
    let parts = defs.HAULER_PARTS[spawn.memory.tier];
    if (parts.length === 0) {
      return b3.State.FAILURE;
    }

    if (spawn.memory.forceSpawnType === type) {
      return this._doSpawn(parts, type, spawn);
    }

    let haulers = spawn.room.find<Creep>(FIND_MY_CREEPS, { filter: (c: Creep) => c.memory.role === type });

    if (haulers.length <= spawn.memory.sourceCount + defs.Counts.HAULER) {
      return this._doSpawn(parts, type, spawn);
    }

    return b3.State.SUCCESS
  }
}

class SpawnBuilderNode extends SpawnNodeBase implements SpawnNodeBase {
  constructor() {
    super();
    this.id = SpawnBuilderNode.name
  }

  tick(tick: b3.Tick): b3.State {
    let spawn: Spawn = tick.target;

    let type = defs.WorkerTypes.BUILDER;
    let parts = defs.WORKER_PARTS[spawn.memory.tier];
    if (parts.length === 0) {
      return b3.State.FAILURE;
    }

    if (spawn.memory.forceSpawnType === type) {
      return this._doSpawn(parts, type, spawn);
    }

    let builders = spawn.room.find<Creep>(FIND_MY_CREEPS, { filter: (c: Creep) => c.memory.role === type });
    let constructionSites = spawn.room.find<ConstructionSite>(FIND_CONSTRUCTION_SITES);

    if (builders.length <= defs.Counts.BUILDER && constructionSites.length > 0) {
      return this._doSpawn(parts, type, spawn);
    }

    return b3.State.SUCCESS
  }
}

class SpawnRepairerNode extends SpawnNodeBase implements SpawnNodeBase {
  constructor() {
    super();
    this.id = SpawnRepairerNode.name
  }

  tick(tick: b3.Tick): b3.State {
    let spawn: Spawn = tick.target;

    let type = defs.WorkerTypes.REPAIRER;
    let parts = defs.WORKER_PARTS[spawn.memory.tier];
    if (parts.length === 0) {
      return b3.State.FAILURE;
    }

    if (spawn.memory.forceSpawnType === type) {
      return this._doSpawn(parts, type, spawn);
    }

    let repairers = spawn.room.find<Creep>(FIND_MY_CREEPS, { filter: (c: Creep) => c.memory.role === type });

    if (repairers.length <= defs.Counts.REPAIRER) {
      return this._doSpawn(parts, type, spawn);
    }

    return b3.State.SUCCESS
  }
}

class SpawnRampartRepairerNode extends SpawnNodeBase implements SpawnNodeBase {
  constructor() {
    super();
    this.id = SpawnRampartRepairerNode.name
  }

  tick(tick: b3.Tick): b3.State {
    let spawn: Spawn = tick.target;

    let type = defs.WorkerTypes.RAMPART_BUILDER;
    let parts = defs.WORKER_PARTS[spawn.memory.tier];
    if (parts.length === 0) {
      return b3.State.FAILURE;
    }

    if (spawn.memory.forceSpawnType === type) {
      return this._doSpawn(parts, type, spawn);
    }

    let repairers = spawn.room.find<Creep>(FIND_MY_CREEPS, { filter: (c: Creep) => c.memory.role === type });
    let ramparts = spawn.room.find<Rampart>(FIND_STRUCTURES, { filter: (s: Structure) => s.structureType === STRUCTURE_RAMPART });
    if (repairers.length <= defs.Counts.RAMPART_REPAIRER && ramparts.length > 0) {
      return this._doSpawn(parts, type, spawn);
    }

    return b3.State.SUCCESS
  }
}

class SpawnWallRepairerNode extends SpawnNodeBase implements SpawnNodeBase {
  constructor() {
    super();
    this.id = SpawnWallRepairerNode.name
  }

  tick(tick: b3.Tick): b3.State {
    let spawn: Spawn = tick.target;

    let type = defs.WorkerTypes.WALL_BUILDER;
    let parts = defs.WORKER_PARTS[spawn.memory.tier];
    if (parts.length === 0) {
      return b3.State.FAILURE;
    }

    if (spawn.memory.forceSpawnType === type) {
      return this._doSpawn(parts, type, spawn);
    }

    let repairers = spawn.room.find<Creep>(FIND_MY_CREEPS, { filter: (c: Creep) => c.memory.role === type });
    let ramparts = spawn.room.find<StructureWall>(FIND_STRUCTURES, { filter: (s: Structure) => s.structureType === STRUCTURE_WALL });
    if (repairers.length <= defs.Counts.WALL_REPAIRER && ramparts.length > 0) {
      return this._doSpawn(parts, type, spawn);
    }

    return b3.State.SUCCESS
  }
}
