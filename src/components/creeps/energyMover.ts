import CreepAction, { ICreepAction } from "./creepAction";

export interface IEnergyMover {

  targetSource: Structure<Storage | Container> | null;
  targetEnergyDropOff: Structure<any>

  isBagFull(): boolean;
  tryHarvest(): ResponseCode;
  moveToHarvest(): void;
  tryEnergyDropOff(): ResponseCode;
  moveToDropEnergy(): void;

  action(): boolean;
}


export default class EnergyMover extends CreepAction implements IEnergyMover, ICreepAction {

  public targetSource: Structure<StructureStorage | StructureContainer> | null;
  public targetEnergyDropOff: Structure<any>;

  public setCreep(creep: Creep) {
    super.setCreep(creep);

    this.targetSource = creep.pos.findClosestByPath<Structure<StructureStorage | StructureContainer>>(FIND_STRUCTURES, {
      filter: (s: Structure<StructureStorage | StructureContainer>) => (s instanceof StructureStorage || s instanceof StructureContainer)
        && s.store.energy >= creep.carryCapacity
    });

    this.targetEnergyDropOff = <Structure<any>>creep.pos
      .findClosestByPath<Structure<any>>(FIND_STRUCTURES, {
        filter: (s: Spawn | Extension | Tower) => (s instanceof StructureSpawn
          || s instanceof StructureExtension
          || s instanceof StructureTower) && s.energy < s.energyCapacity
      });
  }

  public isBagFull(): boolean {
    return (this.creep.carry.energy === this.creep.carryCapacity);
  }

  public tryHarvest(): ResponseCode {
    if (this.targetSource === null) {
      return ERR_INVALID_ARGS;
    }
    return this.creep.withdraw(this.targetSource, RESOURCE_ENERGY);
  }

  public moveToHarvest(): void {
    if (this.targetSource === null) {
      return;
    }
    if (this.tryHarvest() === ERR_NOT_IN_RANGE) {
      this.moveTo(this.targetSource);
    }
  }

  public tryEnergyDropOff(): ResponseCode {
    return this.creep.transfer(this.targetEnergyDropOff, RESOURCE_ENERGY);
  }

  public moveToDropEnergy(): void {
    if (this.tryEnergyDropOff() === ERR_NOT_IN_RANGE) {
      this.moveTo(this.targetEnergyDropOff);
    }
  }

  public action(): boolean {
    if (this.creep.memory['working'] && this.creep.carry.energy == 0) {
      this.creep.memory['working'] = false;
    }
    if (!this.creep.memory['working'] && this.creep.carry.energy == this.creep.carryCapacity) {
      this.creep.memory['working'] = true;
    }

    if (this.creep.memory['working']) {
      this.moveToDropEnergy();
    } else {
      this.moveToHarvest();
    }

    return true;
  }
}
