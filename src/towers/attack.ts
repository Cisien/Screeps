import * as b3 from './../lib/behavior3';

let allies = [
  "MrMcStabby",
  "Robohamburger"
];

export default class TowerAttackNode extends b3.MemSequence implements b3.MemSequence {
  constructor() {
    super([new SearchHostilesNode(), new FilterOutAlliesNode(), new SelectTargetNode(), new AttackTargetNode()])
    this.id = TowerAttackNode.name
  }

  tick(tick: b3.Tick): b3.State {
    return super.tick(tick);
  }
}

class SearchHostilesNode extends b3.BaseNode implements b3.BaseNode {
  constructor() {
    super();
    this.id = SearchHostilesNode.name;
  }

  tick(tick: b3.Tick): b3.State {
    let tower: Tower = tick.target;

    let hostiles = tower.room.find(FIND_HOSTILE_CREEPS);
    if (hostiles.length === 0) {
      return b3.State.FAILURE;
    }

    Memory["_bt"][tower.id].hostiles = [];
    _.forEach(hostiles, (h: Creep) =>
      Memory["_bt"][tower.id].hostiles.push(h.id));
    return b3.State.SUCCESS;
  }
}

class FilterOutAlliesNode extends b3.BaseNode implements b3.BaseNode {
  constructor() {
    super();
    this.id = FilterOutAlliesNode.name;
  }

  tick(tick: b3.Tick): b3.State {
    let tower: Tower = tick.target;

    Memory["_bt"][tower.id].hostiles = _.filter(Memory["_bt"][tower.id].hostiles,
      (c: string) => {
        let creep = Game.getObjectById<Creep>(c)
        if (creep === null) {
          return false;
        }

        return allies.indexOf(creep.owner.username) === -1;
      });

    if (Memory["_bt"][tower.id].hostiles.length === 0) {
      return b3.State.FAILURE;
    }

    return b3.State.SUCCESS;
  }
}

class SelectTargetNode extends b3.BaseNode implements b3.BaseNode {
  constructor() {
    super();
    this.id = SelectTargetNode.name;
  }
  //todo: smarter target selection (total parts, distance from healers, etc), range from tower, etc.
  tick(tick: b3.Tick): b3.State {
    let tower: Tower = tick.target;

    let hostiles: Creep[] = [];
    for (let creep of Memory["_bt"][tower.id].hostiles) {
      let hostileCreep = Game.getObjectById<Creep>(creep);
      if (hostileCreep != null) {
        hostiles.push(hostileCreep);
      }
    }

    Memory["_bt"][tower.id].hostile = tower.pos.findClosestByRange<Creep>(hostiles).id;
    delete Memory["_bt"][tower.id].hostiles;
    return b3.State.SUCCESS;
  }
}

class AttackTargetNode extends b3.BaseNode implements b3.BaseNode {
  constructor() {
    super();
    this.id = AttackTargetNode.name
  }

  tick(tick: b3.Tick): b3.State {
    let tower: Tower = tick.target;

    let target = Game.getObjectById<Creep>(Memory["_bt"][tower.id].hostile);

    if (target === null) {
      delete Memory["_bt"][tower.id].hostile;
      return b3.State.FAILURE;
    }

    tower.attack(target);
    return b3.State.RUNNING;
  }
}