import * as b3 from './../lib/behavior3';
import TowerAttackNode from './attack';

export class TowerTree extends b3.MemSequence implements b3.MemSequence {
  constructor() {
    super([new TowerAttackNode()]); // heal, repair, rampart repair, etc.
    this.id = TowerTree.name;
  }

  tick(tick: b3.Tick): b3.State {
    let tower: Tower = tick.target;
    if (tower.energy === 0) {
      return b3.State.FAILURE;
    }

    return super.tick(tick);
  }
}
