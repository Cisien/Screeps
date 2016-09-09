import CreepAction, { ICreepAction } from "./creepAction";

export interface IRepairer {

  targetSource: Source;
  repairTarget: Structure;

  isBagFull(): boolean;
  tryHarvest(): number;
  moveToHarvest(): void;
  tryRepair(): number;
  moveToRepair(): void;

  action(): boolean;
}

export default class Repairer extends CreepAction implements IRepairer, ICreepAction {

  public targetSource: Source;
  public repairTarget: Structure

  public setCreep(creep: Creep) {
    super.setCreep(creep);

    this.targetSource = <Source>Game.getObjectById<Source>(this.creep.memory.target_source_id);
    this.repairTarget = creep.pos.findClosestByPath<Structure>(FIND_STRUCTURES, {
      filter: (s: Structure) => s.hits < s.hitsMax && (s.structureType != STRUCTURE_WALL || s.structureType != STRUCTURE_RAMPART)
    });
  }

  public isBagFull(): boolean {
    return (this.creep.carry.energy === this.creep.carryCapacity);
  }

  public tryHarvest(): number {
    return this.creep.harvest(this.targetSource);
  }

  public moveToHarvest(): void {
    if (this.tryHarvest() === ERR_NOT_IN_RANGE) {
      this.moveTo(this.targetSource);
    }
  }

  public tryRepair(): number {
    return this.creep.repair(this.repairTarget);
  }

  public moveToRepair(): void {
    if (this.tryRepair() === ERR_NOT_IN_RANGE) {
      this.moveTo(this.repairTarget);
    }
  }

  public action(): boolean {
    if (this.creep.memory.working && this.creep.carry.energy == 0) {
      this.creep.memory.working = false;
    }
    if (!this.creep.memory.working && this.creep.carry.energy == this.creep.carryCapacity) {
      this.creep.memory.working = true;
    }
    if (this.creep.memory.working) {
      this.moveToRepair();
    } else {
      this.moveToHarvest();
    }
    return true;
  }
}
