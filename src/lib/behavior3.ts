/**
 *
 */
export type State = number;
export let State = {
  SUCCESS: 1,
  RUNNING: 2,
  FAILURE: 3
};

export type NodeScope = { [key: number]: any }
export type TreeScope = { [key: number]: any }
export type NodeMemory = { b: NodeScope, t: TreeScope };

/**
 *
 */
export class BaseNode {
  constructor() {
  }
  id: string | number;

  execute(tick: Tick): State {
    this._enter(tick);

    // trigger open if not opened
    if (!tick.blackboard.get('isOpen', tick.tree.id, this.id)) {
      this._open(tick);
    }

    // tick node and get status
    var status = this._tick(tick);

    // if state is different than RUNNING trigger close
    if (status !== State.RUNNING) {
      this._close(tick);
    }

    this._exit(tick);

    return status;
  }
  _enter(tick: Tick): void {
    tick.enterNode(this);
    this.enter(tick);
  }
  _open(tick: Tick): void {
    tick.openNode(this);
    tick.blackboard.set('isOpen', true, tick.tree.id, this.id);
    this.open(tick);
  }
  _tick(tick: Tick): State {
    tick.tickNode(this);
    return this.tick(tick);
  }
  _close(tick: Tick): void {
    tick.closeNode(this);
    tick.blackboard.clear('isOpen', tick.tree.id, this.id);
    this.close(tick);
  }
  _exit(tick: Tick): void {
    tick.exitNode(this);
    this.exit(tick);
  }
  // to be extended
  enter(tick: Tick): void {
    if (tick === null) {
      throw "null tick"
    }
  }
  open(tick: Tick): void {
    if (tick === null) {
      throw "null tick"
    }
  }
  tick(tick: Tick): State {
    if (tick === null) {
      throw "null tick"
    }
    return State.FAILURE;
  }
  close(tick: Tick): void {
    if (tick === null) {
      throw "null tick"
    }
  }
  exit(tick: Tick): void {
    if (tick === null) {
      throw "null tick"
    }
  }
}

/**
 * BlackboardAdapter wraps an existing object (such as memory) and provides
 * blackboard functionality.
 */
export class BlackboardAdapter {
  constructor(base: NodeMemory) {
    this.base = base;
    if (!this.base.b)
      this.base.b = {};
    if (!this.base.t)
      this.base.t = {};
  }
  base: NodeMemory;

  getTreeMemory(treeScope: string | number): any {
    if (!this.base.t[treeScope]) {
      this.base.t[treeScope] = {
        nodeMemory: {},
        openNodes: []
      };
    }
    return this.base.t[treeScope];
  }


  getNodeMemory(treeMemory: TreeScope, nodeScope: string | number): NodeMemory {
    var memory = treeMemory["nodeMemory"];

    if (!memory[nodeScope]) {
      memory[nodeScope] = {};
    }
    return memory[nodeScope];
  }

  getMemory(treeScope?: string | number, nodeScope?: string | number): NodeScope {
    var memory = this.base.b;
    if (treeScope !== undefined) {
      memory = this.getTreeMemory(treeScope);
      if (nodeScope !== undefined) {
        memory = this.getNodeMemory(memory, nodeScope);
      }
    }
    return memory;
  }

  set(key: string, value: any, treeScope?: string | number, nodeScope?: string | number) {
    var memory = this.getMemory(treeScope, nodeScope);
    if (value === undefined)
      this.clear(key, treeScope, nodeScope);
    else
      memory[key] = value;
  }

  clear(key: string, treeScope?: string | number, nodeScope?: string | number) {
    var memory = this.getMemory(treeScope, nodeScope);
    delete memory[key];
  }

  get(key: string, treeScope?: string | number, nodeScope?: string | number): any {
    var memory = this.getMemory(treeScope, nodeScope);
    return memory[key];
  }

  /** call at any time to remove empty node memory */
  compact(): void {
    _.each(this.base.t, (v) => (v.nodeMemory = _.omit(v.nodeMemory, _.isEmpty)));
  }

  toString(): string {
    this.compact();
    return JSON.stringify(this.base);
  }

  static fromString(str: string): any {
    return new BlackboardAdapter(JSON.parse(str) || {});
  }
}

/**
 *
 */
export class BehaviorTree {
  constructor(root: BaseNode) {
    this.root = root;
    this.id = BehaviorTree.name
  }

  id: number | string;
  root: BaseNode

  // automanage blackboard for objects with memory
  screepsTick(target: any) {
    let b: BlackboardAdapter | undefined = undefined;

    if (!target.memory) {
      if(!Memory['_bt']) {
        Memory['_bt'] = {};
      }
      if (!Memory['_bt'][target.id]) {
        Memory['_bt'][target.id] = {};
      }
      if (!Memory['_bt'][target.id]._bt) {
        Memory['_bt'][target.id]._bt = {};
      }
      b = new BlackboardAdapter(Memory['_bt'][target.id]._bt);
    } else if (!target.memory._bt) {
      target.memory._bt = {};
    }

    if (!b) {
      b = new BlackboardAdapter(target.memory._bt);
    }

    this.tick(target, b);
    b.compact();
  }

  tick(target: any, blackboard: BlackboardAdapter) {
    var tick = new Tick(this, target, blackboard);

    // execute the whole tree
    this.root.execute(tick);

    var lastOpenNodes = blackboard.get('openNodes', this.id);
    var currOpenNodes = tick.openNodes.slice(0);

    var start = 0;
    var max = Math.min(lastOpenNodes.length, currOpenNodes.length);

    // does not close if still open in this tick
    for (var i = 0; i < max; i += 1) {
      start = i + 1;
      if (lastOpenNodes[i] !== currOpenNodes[i]) {
        break;
      }
    }

    blackboard.set('openNodes', currOpenNodes, this.id);
    blackboard.set('nodeCount', tick.nodeCount, this.id);
  }
}

/**
 * Tick
 */
export class Tick {
  constructor(tree: BehaviorTree, target: any, blackboard: BlackboardAdapter) {
    this.tree = tree;
    this.openNodes = [];
    this.nodeCount = 0;
    this.target = target;
    this.blackboard = blackboard;
  }

  tree: BehaviorTree;
  openNodes: any;
  nodeCount: number;
  target: any;
  blackboard: BlackboardAdapter;

  enterNode(node: BaseNode) {
    this.nodeCount += 1;
    this.openNodes.push(node.id);
  }

  closeNode(node: BaseNode) {
    if (node != null) {
      this.openNodes.pop();
      //this.nodeCount -= 1;
    }
  }

  // may be extended for debug
  openNode(node: BaseNode) {
    if (node === null) {
      throw "node is null"
    }
  }
  tickNode(node: BaseNode) {
    if (node === null) {
      throw "node is null"
    }
  }
  exitNode(node: BaseNode) {
    if (node === null) {
      throw "node is null"
    }
  }
}

export class MemSequence extends BaseNode {
  constructor(childs: BaseNode[]) {
    super();
    this.id = MemSequence.name;
    this.name = 'MemSequence';
    this.childs = [];
    _.each(childs, c => this.childs.push(c));
  }
  name: string;
  childs: BaseNode[];

  open(tick: Tick) {
    tick.blackboard.set('runningChild', 0, tick.tree.id, this.id);
  }

  tick(tick: Tick): State {
    var child = tick.blackboard.get('runningChild', tick.tree.id, this.id);

    for (var i = child; i < this.childs.length; i += 1) {
      var status = this.childs[i].execute(tick);

      if (status !== State.SUCCESS) {
        if (status === State.RUNNING) {
          tick.blackboard.set('runningChild', i, tick.tree.id, this.id);
        }
        return status;
      }
    }
    return State.SUCCESS;
  }
}

/**
 *
 */
export class Sequence extends BaseNode {
  constructor(childs: BaseNode[]) {
    super();
    this.id = Sequence.name;
    this.name = 'Sequence';
    this.childs = [];
    _.each(childs, c => this.childs.push(c));
  }
  name: string;
  childs: BaseNode[];

  tick(tick: Tick): State {

    for (var i = 0; i < this.childs.length; i += 1) {
      let status = this.childs[i].execute(tick);

      if (status !== State.SUCCESS) {
        return status;
      }
    }
    return State.SUCCESS;
  }

}

export class Decorator extends BaseNode {
  constructor(child: BaseNode) {
    super();
    this.child = child;
  }
  child: BaseNode;
}

/**
 *
 */
export class Wait extends BaseNode {
  constructor(ticks: number) {
    super();

    this.name = 'Wait';
    this.endTime = ticks || 0;
  }
  name: string;
  endTime: number;

  open(tick: Tick) {
    var startTime = Game.time;
    tick.blackboard.set('startTime', startTime, tick.tree.id, this.id);
  }
  tick(tick: Tick): State {
    var currTime = Game.time;
    var startTime = tick.blackboard.get('startTime', tick.tree.id, this.id);

    if (currTime - startTime >= this.endTime) {
      return State.SUCCESS;
    }

    return State.RUNNING;
  }
}
