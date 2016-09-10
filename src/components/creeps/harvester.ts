import CreepAction, { ICreepAction } from "./creepAction";

export interface IHarvester {

  targetSource: Source;

  isBagFull(): boolean;
  tryHarvest(): number;
  moveToHarvest(): void;

  action(): boolean;
}

export default class Harvester extends CreepAction implements IHarvester, ICreepAction {

  public targetSource: Source;
  public storage: Storage[] | Container[];

  public setCreep(creep: Creep) {
    super.setCreep(creep);

    this.targetSource = <Source>Game.getObjectById<Source>(this.creep.memory.target_source_id);
    this.storage = <Storage[] | Container[]>this.creep.pos.findInRange<Storage | Container>(FIND_STRUCTURES, 0, {
      filter: (s: Storage | Container) => s.structureType === STRUCTURE_STORAGE || s.structureType == STRUCTURE_CONTAINER
    })
  }

  public isBagFull(): boolean {
    return (this.creep.carry.energy === this.creep.carryCapacity);
  }

  public tryHarvest(): number {
    if (this.storage && this.storage[0] && this.storage[0].store[RESOURCE_ENERGY] === this.storage[0].storeCapacity) {
      return ERR_FULL;
    }

    if (Game.time % 2 === 0) {
      this.creep.say('tick');
    } else {
      this.creep.say('tock')
    }
    return this.creep.harvest(this.targetSource);
  }

  public moveToHarvest(): void {
    if (this.tryHarvest() === ERR_NOT_IN_RANGE) {
      this.moveTo(this.targetSource);
    }
  }

  public action(): boolean {
    if (this.creep.memory.working && this.creep.carry.energy == 0) {
      this.creep.memory.working = false;
    }
    if (!this.creep.memory.working && this.creep.carry.energy == this.creep.carryCapacity) {
      this.creep.memory.working = true;
    }

    this.moveToHarvest();

    return true;
  }
}
