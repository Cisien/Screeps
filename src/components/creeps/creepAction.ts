export interface ICreepAction {
  creep: Creep;

  setCreep(creep: Creep): void;

  /**
   * Wrapper for Creep.moveTo() method.
   */
  moveTo(target: RoomObject | RoomPosition): ResponseCode;

  targetStorage: Structure<StructureStorage | StructureContainer> | null;
  action(): boolean;
}

export default class CreepAction implements ICreepAction {
  public creep: Creep;

  targetStorage: Structure<StructureStorage | StructureContainer> | null;

  public setCreep(creep: Creep) {
    this.creep = creep;

  }

  public moveTo(target: RoomObject | RoomPosition) {
    if (this.creep.fatigue > 0) {
      return ERR_TIRED;
    }

    return this.creep.moveTo(target);
  }

  public tryWithdraw(): ResponseCode {
    if (this.targetStorage === null) {
      return ERR_INVALID_ARGS;
    }
    return this.creep.withdraw(this.targetStorage, RESOURCE_ENERGY);
  }

  public moveToWithdraw(): void {
    if (this.targetStorage === null) {
      return;
    }
    if (this.tryWithdraw() === ERR_NOT_IN_RANGE) {
      this.moveTo(this.targetStorage);
    }
  }

  public action(): boolean {
    return true;
  }
}