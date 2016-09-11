export interface ICreepAction {
  creep: Creep;
  renewStation: Spawn;

  setCreep(creep: Creep): void;

  /**
   * Wrapper for Creep.moveTo() method.
   */
  moveTo(target: RoomObject | RoomPosition): ResponseCode;

  action(): boolean;
}

export default class CreepAction implements ICreepAction {
  public creep: Creep;
  public renewStation: Spawn;

  public setCreep(creep: Creep) {
    this.creep = creep;

  }

  public moveTo(target: RoomObject | RoomPosition) {
    return this.creep.moveTo(target);
  }

  public action(): boolean {
    return true;
  }
}