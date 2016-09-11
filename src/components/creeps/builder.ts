import CreepAction, { ICreepAction } from "./creepAction";
import * as SpawnManager from '../spawns/spawnManager';
import * as SourceManager from '../sources/sourceManager';
import * as Config from '../../config/config';

export interface IBuilder {

  targetSource: Structure<StructureContainer | StructureStorage> | null;
  buildTarget: ConstructionSite;

  isBagFull(): boolean;
  tryHarvest(): ResponseCode;
  moveToHarvest(): void;
  tryBuild(): ResponseCode;
  moveToBuild(): void;

  action(): boolean;
}

export default class Builder extends CreepAction implements IBuilder, ICreepAction {

  public targetSource: Structure<StructureContainer | StructureStorage> | null;
  public buildTarget: ConstructionSite

  public static spawn(): ResponseCode | CreepName {
    let bodyParts = Config.BUILDER_PARTS;
    let properties: { [key: string]: any } = {
      renew_station_id: SpawnManager.getFirstSpawn().id,
      role: "builder",
      target_source_id: SourceManager.sources[SourceManager.sourceCount - 1].id,
      working: false
    }

    let status: ResponseCode | CreepName = SpawnManager.getFirstSpawn().canCreateCreep(bodyParts, undefined);

    if (status == OK) {
      status = SpawnManager.getFirstSpawn().createCreep(bodyParts, undefined, properties);
    }

    if (Config.VERBOSE && !(status < 0)) {
      console.log("Started creating new Builder");
    }
    return status;
  }

  public setCreep(creep: Creep) {
    super.setCreep(creep);

    //this.targetSource = SourceManager.sources[SourceManager.sourceCount % 2];
    this.targetSource = creep.pos.findClosestByPath<Structure<StructureStorage | StructureContainer>>(FIND_STRUCTURES, {
      filter: (s: Structure<StructureStorage | StructureContainer>) => (s instanceof StructureStorage || s instanceof StructureContainer)
        && s.store.energy >= creep.carryCapacity
    });

    this.buildTarget = <ConstructionSite>creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
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

  public tryBuild(): ResponseCode {
    return this.creep.build(this.buildTarget);
  }

  public moveToBuild(): void {
    if (this.tryBuild() === ERR_NOT_IN_RANGE) {
      this.moveTo(this.buildTarget);
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
      this.moveToBuild();
    } else {
      this.moveToHarvest();
    }
    return true;
  }
}
