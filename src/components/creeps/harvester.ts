import CreepAction, { ICreepAction } from "./creepAction";

export interface IHarvester {

  targetSource: Source;
  targetEnergyDropOff: Structure

  isBagFull(): boolean;
  tryHarvest(): number;
  moveToHarvest(): void;
  tryEnergyDropOff(): number;
  moveToDropEnergy(): void;

  action(): boolean;
}

export default class Harvester extends CreepAction implements IHarvester, ICreepAction {

  public targetSource: Source;
  public targetEnergyDropOff: Structure;

  public setCreep(creep: Creep) {
    super.setCreep(creep);

    this.targetSource = <Source>Game.getObjectById<Source>(this.creep.memory.target_source_id);

    this.targetEnergyDropOff = <Structure>creep.pos
      .findClosestByPath<Structure>(FIND_STRUCTURES, {
        filter: (s: Structure) => (s.structureType === STRUCTURE_EXTENSION
          || s.structureType === STRUCTURE_SPAWN
          || s.structureType === STRUCTURE_TOWER)
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
