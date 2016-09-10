import CreepAction, { ICreepAction } from "./creepAction";

export interface IEnergyMover {

  targetSource: Structure;
  targetEnergyDropOff: Structure

  isBagFull(): boolean;
  tryHarvest(): number;
  moveToHarvest(): void;
  tryEnergyDropOff(): number;
  moveToDropEnergy(): void;

  action(): boolean;
}

export default class EnergyMover extends CreepAction implements IEnergyMover, ICreepAction {

  public targetSource: Structure;
  public targetEnergyDropOff: Structure;

  public setCreep(creep: Creep) {
    super.setCreep(creep);

    this.targetSource = creep.pos.findClosestByPath<Structure>(FIND_STRUCTURES, {
      filter: (s: Container | Storage) => (s.structureType == STRUCTURE_STORAGE || s.structureType == STRUCTURE_CONTAINER)
      && s.store[RESOURCE_ENERGY] >= creep.carryCapacity
    });

    this.targetEnergyDropOff = <Structure>creep.pos
      .findClosestByPath<Structure>(FIND_STRUCTURES, {
        filter: (s: Spawn | Extension | Tower) => (s.structureType === STRUCTURE_SPAWN
          || s.structureType === STRUCTURE_EXTENSION
          || s.structureType === STRUCTURE_TOWER) && s.energy < s.energyCapacity
      });
  }

  public isBagFull(): boolean {
    return (this.creep.carry.energy === this.creep.carryCapacity);
  }

  public tryHarvest(): number {
    return this.creep.withdraw(this.targetSource, RESOURCE_ENERGY);
  }

  public moveToHarvest(): void {
    if (this.tryHarvest() === ERR_NOT_IN_RANGE) {
      this.moveTo(this.targetSource);
    }
  }

  public tryEnergyDropOff(): number {
    return this.creep.transfer(this.targetEnergyDropOff, RESOURCE_ENERGY);
  }

  public moveToDropEnergy(): void {
    if (this.tryEnergyDropOff() === ERR_NOT_IN_RANGE) {
      this.moveTo(this.targetEnergyDropOff);
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
      this.moveToDropEnergy();
    } else {
      this.moveToHarvest();
    }

    return true;
  }
}
