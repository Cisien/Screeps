import CreepAction, { ICreepAction } from "./creepAction";
import * as SpawnManager from '../spawns/spawnManager';
import * as Config from '../../config/config';

export interface IEnergyMover {

  targetEnergyDropOff: Structure<any>

  tryEnergyDropOff(): ResponseCode;
  moveToDropEnergy(): void;

  action(): boolean;
}

export default class EnergyMover extends CreepAction implements IEnergyMover, ICreepAction {

  public targetEnergyDropOff: Structure<any>;

  public static spawn(): ResponseCode | CreepName {
    let bodyParts = Config.MOVER_PARTS;
    let properties: { [key: string]: any } = {
      role: "energyMover",
      working: false
    };

    let status = SpawnManager.getFirstSpawn().createCreep(bodyParts, undefined, properties);
    console.log(status);

    if (Config.VERBOSE && !(status < 0)) {
      console.log("Started creating new EnergyMover");

    }

    return status;
  }

  public setCreep(creep: Creep) {
    super.setCreep(creep);

    this.targetStorage = creep.pos.findClosestByPath<Structure<StructureStorage | StructureContainer>>(FIND_STRUCTURES, {
      filter: (s: Structure<StructureStorage | StructureContainer>) => (s instanceof StructureStorage || s instanceof StructureContainer)
        && s.store.energy >= creep.carryCapacity
    });

    this.targetEnergyDropOff = <Structure<any>>creep.pos
      .findClosestByPath<Structure<any>>(FIND_STRUCTURES, {
        filter: (s: Spawn | Extension | Tower) => (s instanceof StructureSpawn
          || s instanceof StructureExtension
          || s instanceof StructureTower)
          && s.energy < s.energyCapacity
      });
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
      this.moveToWithdraw();
    }

    return true;
  }
}
