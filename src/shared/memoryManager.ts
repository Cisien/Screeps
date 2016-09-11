export let memory: Memory;

export function loadMemory(): void {
  for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }
  this.memory = Memory;
}

