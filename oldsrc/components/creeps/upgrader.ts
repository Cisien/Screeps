import CreepAction, { ICreepAction } from "./creepAction";
import * as SpawnManager from '../spawns/spawnManager';
import * as Config from '../../config/config';
import * as RoomManager from '../rooms/roomManager';

export interface IUpgrader {
  tryEnergyDropOff(): ResponseCode;
  moveToDropEnergy(): void;

  action(): boolean;
}

export default class Upgrader extends CreepAction implements IUpgrader, ICreepAction {

  public targetEnergyDropOff: StructureController | null

  public static spawn(): ResponseCode | CreepName {
    let bodyParts = Config.UPGRADER_PARTS;

    let room: Room = RoomManager.getFirstRoom();
    let dropOffId: any;

    if (room) {
      var controller: any = room.controller
      if (controller) {
        dropOffId = controller.id;
      }
    }

    let properties: { [key: string]: any } = {
      role: "upgrader",
      target_energy_dropoff_id: dropOffId,
      working: false
    };

    let status = SpawnManager.getFirstSpawn().createCreep(bodyParts, undefined, properties);
    console.log(status);
    if (Config.VERBOSE && !(status < 0)) {
      console.log("Started creating new Upgrader");
    }

    return status;
  }

  public setCreep(creep: Creep) {
    super.setCreep(creep);

    //this.targetSource = <Source>Game.getObjectById<Source>('579faa780700be0674d31086');

    this.targetStorage = creep.pos.findClosestByPath<Structure<StructureStorage | StructureContainer>>(FIND_STRUCTURES, {
      filter: (s: Structure<StructureStorage | StructureContainer>) => (s instanceof StructureStorage || s instanceof StructureContainer)
        && s.store.energy >= creep.carryCapacity
    });

    this.targetEnergyDropOff = Game.getObjectById<StructureController>(this.creep.memory["target_energy_dropoff_id"]);
  }

  public tryEnergyDropOff(): ResponseCode {
    if (this.targetEnergyDropOff === null) {
      return ERR_INVALID_TARGET;
    }
    return this.creep.upgradeController(this.targetEnergyDropOff);
  }

  public moveToDropEnergy(): void {
    if (this.targetEnergyDropOff === null) {
      return;
    }

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
      this.moveToWithdraw();
    }
    return true;
  }
}
