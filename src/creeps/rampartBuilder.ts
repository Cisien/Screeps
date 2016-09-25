import * as b3 from './../lib/behavior3'
import * as defs from './../config/creepDefs'
import * as common from './common'
import * as repairCommon from './repairerCommon'

export default class RampartBuilderNode extends b3.MemSequence implements b3.MemSequence {
  constructor() {
    super([new common.PathToEnergyNode(), new common.MoveToEnergyNode(), new common.PickupEnergyNode(),
    new PathToRepairSiteNode(), new repairCommon.MoveToRepairSiteNode(), new repairCommon.RepairNode()]);
    this.id = RampartBuilderNode.name;

    Game['profiler'].registerObject(common.PathToEnergyNode, common.PathToEnergyNode.name);
    Game['profiler'].registerObject(common.MoveToEnergyNode, common.MoveToEnergyNode.name);
    Game['profiler'].registerObject(common.PickupEnergyNode, common.PickupEnergyNode.name);
    Game['profiler'].registerObject(PathToRepairSiteNode, PathToRepairSiteNode.name);
    Game['profiler'].registerObject(repairCommon.MoveToRepairSiteNode, repairCommon.MoveToRepairSiteNode.name);
    Game['profiler'].registerObject(repairCommon.RepairNode, repairCommon.RepairNode.name);
  }

  tick(tick: b3.Tick): b3.State {
    let creep: Creep = tick.target as Creep;
    if (creep.memory.role === defs.WorkerTypes.RAMPART_BUILDER) {
      return super.tick(tick);
    }
    else {
      // success means go onto the next guy, we have nothing to do
      return b3.State.SUCCESS;
    }
  }
}


class PathToRepairSiteNode extends b3.BaseNode implements b3.BaseNode {
  constructor() {
    super();
    this.id = PathToRepairSiteNode.name;
  }

  tick(tick: b3.Tick): b3.State {
    let creep: Creep = tick.target as Creep;

    let sites = creep.room.find<Structure>(FIND_STRUCTURES, {
      filter: (s: Structure) => s.hits < s.hitsMax && (s.structureType == STRUCTURE_RAMPART)
    });

    if(!sites || sites.length === 0) {
      return b3.State.FAILURE
    }

    sites = _.sortBy(sites, (r: StructureRampart) => r.hits);

    let selected = _.first(sites);
    if (!selected) {
      return b3.State.FAILURE
    }

    creep.memory.site = selected.id;
    creep.memory.path = Room.serializePath(creep.room.findPath(creep.pos, selected.pos))

    return b3.State.SUCCESS;
  }
}
