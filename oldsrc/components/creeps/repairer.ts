import CreepAction, { ICreepAction } from "./creepAction";
import * as SpawnManager from '../spawns/spawnManager';
import * as Config from '../../config/config';

export interface IRepairer {

  tryRepair(): ResponseCode;
  moveToRepair(): void;

  action(): boolean;
}

export default class Repairer extends CreepAction implements IRepairer, ICreepAction {

  public repairTarget: Structure<any> | null;

  public static spawn(): ResponseCode | CreepName {
    let bodyParts = Config.REPAIRER_PARTS;
    let properties: { [key: string]: any } = {
      role: "repairer",
      working: false
    }

    let status = SpawnManager.getFirstSpawn().createCreep(bodyParts, undefined, properties);
    console.log(status);
    if (Config.VERBOSE && !(status < 0)) {
      console.log("Started creating new Repairer");
    }
    return status;
  }

  public setCreep(creep: Creep) {
    super.setCreep(creep);

    this.targetStorage = creep.pos.findClosestByPath<StructureContainer | StructureStorage>(FIND_STRUCTURES, {
      filter: (s: Container | Storage) => (s instanceof StructureStorage || s instanceof StructureContainer)
        && s.store.energy >= creep.carryCapacity
    });

    this.repairTarget = creep.pos.findClosestByPath<Structure<any>>(FIND_STRUCTURES, {
      filter: (s: Structure<any>) => s.hits < s.hitsMax && (s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART)
    });
  }

  public tryRepair(): ResponseCode {
    if (this.repairTarget === null) {
      return ERR_INVALID_ARGS;
    }

    return this.creep.repair(this.repairTarget);
  }

  public moveToRepair(): void {
    if (this.repairTarget === null) {
      return;
    }

    if (this.tryRepair() === ERR_NOT_IN_RANGE) {
      this.moveTo(this.repairTarget);
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
      this.moveToRepair();
    } else {
      this.moveToWithdraw();
    }
    return true;
  }
}
