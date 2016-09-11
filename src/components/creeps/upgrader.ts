import CreepAction, { ICreepAction } from "./creepAction";
import * as SpawnManager from '../spawns/spawnManager';
import * as SourceManager from '../sources/sourceManager';
import * as Config from '../../config/config';
import * as RoomManager from '../rooms/roomManager';

export interface IUpgrader {

  targetSource: Structure<StructureStorage | StructureContainer> | null;
  targetEnergyDropOff: Controller;

  isBagFull(): boolean;
  tryHarvest(): ResponseCode;
  moveToHarvest(): void;
  tryEnergyDropOff(): ResponseCode;
  moveToDropEnergy(): void;

  action(): boolean;
}

export default class Upgrader extends CreepAction implements IUpgrader, ICreepAction {

  public targetSource: Structure<StructureStorage | StructureContainer> | null;
  public targetEnergyDropOff: Controller

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
      renew_station_id: SpawnManager.getFirstSpawn().id,
      role: "upgrader",
      target_energy_dropoff_id: dropOffId,
      target_source_id: SourceManager.getFirstSource().id,
      working: false
    };

    let status: ResponseCode | CreepName = SpawnManager.getFirstSpawn().canCreateCreep(bodyParts, undefined);

    if (status === OK) {
      status = SpawnManager.getFirstSpawn().createCreep(bodyParts, undefined, properties);
    }
    else {
      console.log("Couldnt's spawn new Upgrader code: " + status);
    }

    if (Config.VERBOSE && !(status < 0)) {
      console.log("Started creating new Upgrader");
    }

    return status;
  }

  public setCreep(creep: Creep) {
    super.setCreep(creep);

    //this.targetSource = <Source>Game.getObjectById<Source>('579faa780700be0674d31086');

    this.targetSource = creep.pos.findClosestByPath<Structure<StructureStorage | StructureContainer>>(FIND_STRUCTURES, {
      filter: (s: Structure<StructureStorage | StructureContainer>) => (s instanceof StructureStorage || s instanceof StructureContainer)
        && s.store.energy >= creep.carryCapacity
    });

    this.targetEnergyDropOff = <StructureController>Game.getObjectById<StructureController>(this.creep.memory["target_energy_dropoff_id"]);
  }

  public isBagFull(): boolean {
    return (this.creep.carry.energy === this.creep.carryCapacity);
  }

  public tryHarvest(): ResponseCode {
    if (this.targetSource === null) {
      return ERR_INVALID_TARGET;
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
    return this.creep.upgradeController(this.targetEnergyDropOff);
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
