import * as b3 from './../lib/behavior3'
import MinerNode from './miner';
import UpgraderNode from './upgrader';
import HaulerNode from './hauler';
import BuilderNode from './builder';
import RepairNode from './repairer';
import RampartBuildNode from './rampartBuilder'

export class CreepTree extends b3.Sequence implements b3.Sequence {
  constructor() {
    super([
      new MinerNode(),
      new HaulerNode(),
      new UpgraderNode(),
      new BuilderNode(),
      new RepairNode(),
      new RampartBuildNode()
    ]);
    this.id = CreepTree.name
  }
  tick(tick: b3.Tick): b3.State {
    return super.tick(tick);
  }
}

