import CreepAction, { ICreepAction } from "./creepAction";
import * as SpawnManager from '../spawns/spawnManager';
import * as Config from '../../config/config';

export interface IBuilder {

  buildTarget: ConstructionSite;

  tryBuild(): ResponseCode;
  moveToBuild(): void;

  action(): boolean;
}

export default class Builder extends CreepAction implements IBuilder, ICreepAction {

  public buildTarget: ConstructionSite

  public static spawn(): ResponseCode | CreepName {
    let bodyParts = Config.BUILDER_PARTS;
    let properties: { [key: string]: any } = {
      role: "builder",
      working: false
    }

    let status = SpawnManager.getFirstSpawn().createCreep(bodyParts, undefined, properties);
    console.log(status);
    if (Config.VERBOSE && !(status < 0)) {
      console.log("Started creating new Builder");
    }
    return status;
  }

  public setCreep(creep: Creep) {
    super.setCreep(creep);

    //this.targetSource = SourceManager.sources[SourceManager.sourceCount % 2];
    this.targetStorage = creep.pos.findClosestByPath<Structure<StructureStorage | StructureContainer>>(FIND_STRUCTURES, {
      filter: (s: Structure<StructureStorage | StructureContainer>) => (s instanceof StructureStorage || s instanceof StructureContainer)
        && s.store.energy >= creep.carryCapacity
    });

    this.buildTarget = <ConstructionSite>creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
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
      this.moveToWithdraw();
    }
    return true;
  }
}
