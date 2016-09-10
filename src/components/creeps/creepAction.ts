export interface ICreepAction {
  creep: Creep;
  renewStation: Spawn;

  setCreep(creep: Creep): void;

  /**
   * Wrapper for Creep.moveTo() method.
   */
  moveTo(target: RoomPosition | { pos: RoomPosition }): number;

  action(): boolean;
}

export default class CreepAction implements ICreepAction {
  public creep: Creep;
  public renewStation: Spawn;

  public setCreep(creep: Creep) {
    this.creep = creep;
    this.renewStation = <Spawn>Game.getObjectById<Spawn>(this.creep.memory.renew_station_id);
  }

  public moveTo(target: RoomPosition | { pos: RoomPosition }) {
    return this.creep.moveTo(target);
  }

  public action(): boolean {
    return true;
  }
}