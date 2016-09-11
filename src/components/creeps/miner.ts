import CreepAction, { ICreepAction } from "./creepAction";
import * as SpawnManager from '../spawns/spawnManager';
import * as SourceManager from '../sources/sourceManager';
import * as Config from '../../config/config';

export interface IMiner {
  action(): boolean;
}

export default class Miner extends CreepAction implements IMiner, ICreepAction {

  public targetSource: Source | null;
  public storage: Structure<StructureStorage | StructureContainer>[];


  public static spawn(existingMiners: Miner[]): ResponseCode | CreepName {
    let bodyParts = Config.MINER_PARTS;

    let workedSources: {} = _.countBy(existingMiners, (c: Miner) => c.creep.memory['target_source_id']);

    let leastUsedSource: string = '';
    let leastUsedSourceCount: number = 1000;

    for (let src of SourceManager.sources) {

      if (!workedSources[src.id.valueOf()]) {
        console.log("no miners")
        leastUsedSource = src.id.valueOf();
        leastUsedSourceCount = 0;
        break;
      }
    }

    if (!leastUsedSource || leastUsedSource === '') {
      console.log("Unable to find source to assign to new miner, aborting!")
      return -1;
    }

    console.log("least used source is " + leastUsedSource + " with " + leastUsedSourceCount + " harvesters assigned.");
    let properties: { [key: string]: any } = {
      role: "miner",
      target_source_id: leastUsedSource,
      working: false
    };

    let status = SpawnManager.getFirstSpawn().createCreep(bodyParts, undefined, properties);
    console.log(status);
    console.log(status);
    if (Config.VERBOSE && !(status < 0)) {
      console.log("Started creating new Miner");
    }
    return status;
  }


  public setCreep(creep: Creep) {
    super.setCreep(creep);

    this.targetSource = Game.getObjectById<Source>(this.creep.memory["target_source_id"]);

    this.storage = this.creep.pos.findInRange<Structure<StructureStorage | StructureContainer>>(FIND_STRUCTURES, 0, {
      filter: (s: StructureStorage | StructureContainer) => s instanceof StructureStorage || s instanceof StructureContainer
    })
  }

  public tryHarvest(): ResponseCode {
    let storage: Structure<StructureStorage | StructureContainer> | null;
    if (this.storage && this.storage[0]) {
      storage = this.storage[0];
    }
    else {
      return ERR_INVALID_TARGET;
    }
    if (!(storage instanceof StructureStorage || storage instanceof StructureContainer)) {
      return ERR_INVALID_TARGET;
    }

    if (storage.store.energy === storage.storeCapacity) {
      return ERR_FULL;
    }

    if (Game.time % 2 === 0) {
      this.creep.say('tick');
    } else {
      this.creep.say('tock')
    }

    if (this.targetSource === null) {
      return ERR_INVALID_TARGET;
    }

    return this.creep.harvest(this.targetSource);
  }

  public moveToHarvest(): void {
    if (this.targetSource === null) {
      return;
    }
    let harvestStatus = this.tryHarvest();
    if (harvestStatus === ERR_NOT_IN_RANGE) {
      this.moveTo(this.targetSource);
    } else if (harvestStatus === ERR_INVALID_TARGET) {
      var nearbyStorage = this.targetSource.pos.findInRange<Structure<StructureStorage | StructureContainer>>(FIND_STRUCTURES, 1, {
        filter: (s: StructureStorage | StructureContainer) => s instanceof StructureStorage || s instanceof StructureContainer
      });
      if (nearbyStorage) {
        this.moveTo(nearbyStorage[0]);
      }
    }
  }

  public action(): boolean {
    if (this.creep.memory['working'] && this.creep.carry.energy == 0) {
      this.creep.memory['working'] = false;
    }
    if (!this.creep.memory['working'] && this.creep.carry.energy == this.creep.carryCapacity) {
      this.creep.memory['working'] = true;
    }

    this.moveToHarvest();

    return true;
  }
}
