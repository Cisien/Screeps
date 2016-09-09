import CreepAction, { ICreepAction } from "./creepAction";

export interface IBuilder {

  targetSource: Source;
  buildTarget: ConstructionSite;

  isBagFull(): boolean;
  tryHarvest(): number;
  moveToHarvest(): void;
  tryBuild(): number;
  moveToBuild(): void;

  action(): boolean;
}

export default class Builder extends CreepAction implements IBuilder, ICreepAction {

  public targetSource: Source;
  public buildTarget: ConstructionSite

  public setCreep(creep: Creep) {
    super.setCreep(creep);

    this.targetSource = <Source>Game.getObjectById<Source>(this.creep.memory.target_source_id);
    this.buildTarget = <ConstructionSite>creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
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

  public tryBuild(): number {
    return this.creep.build(this.buildTarget);
  }

  public moveToBuild(): void {
    if (this.tryBuild() === ERR_NOT_IN_RANGE) {
      this.moveTo(this.buildTarget);
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
      this.moveToBuild();
    } else {
      this.moveToHarvest();
    }
    return true;
  }

}
