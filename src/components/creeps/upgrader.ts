import CreepAction, { ICreepAction } from "./creepAction";

export interface IUpgrader {

  targetSource: Structure;
  targetEnergyDropOff: Controller;

  isBagFull(): boolean;
  tryHarvest(): number;
  moveToHarvest(): void;
  tryEnergyDropOff(): number;
  moveToDropEnergy(): void;

  action(): boolean;
}

export default class Upgrader extends CreepAction implements IUpgrader, ICreepAction {

  public targetSource: Structure;
  public targetEnergyDropOff: Controller

  public setCreep(creep: Creep) {
    super.setCreep(creep);


    this.targetSource = <Structure>creep.pos.findClosestByPath<Container | Storage>(FIND_STRUCTURES, {
      filter: (s: Container | Storage) => (s.structureType == STRUCTURE_STORAGE || s.structureType == STRUCTURE_CONTAINER)
        && s.store[RESOURCE_ENERGY] >= creep.carryCapacity
    });

    this.targetEnergyDropOff = <Controller>Game.getObjectById<Controller>(this.creep.memory.target_energy_dropoff_id);
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
    return this.creep.upgradeController(this.targetEnergyDropOff);
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
