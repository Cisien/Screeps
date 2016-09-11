import CreepAction, { ICreepAction } from "./creepAction";
import * as SpawnManager from '../spawns/spawnManager';
import * as SourceManager from '../sources/sourceManager';
import * as Config from '../../config/config';

export interface IHarvester {

  targetSource: Source;

  isBagFull(): boolean;
  tryHarvest(): ResponseCode;
  moveToHarvest(): void;

  action(): boolean;
}

export default class Harvester extends CreepAction implements IHarvester, ICreepAction {

  public targetSource: Source;
  public storage: StructureSpawn | StructureExtension;

  public static spawn(existingHarvesters: Harvester[]): ResponseCode | CreepName {
    let bodyParts = Config.HARVESTER_PARTS;

    let workedSources: {} = _.countBy(existingHarvesters, (c: Harvester) => c.creep.memory['target_source_id']);

    let leastUsedSource: string = '';
    let leastUsedSourceCount: number = 1000;


    for (let src of SourceManager.sources) {
      if (!workedSources[src.id.valueOf()]) {
        console.log("no harvesters")
        leastUsedSource = src.id.valueOf();
        leastUsedSourceCount = 0;
        break;
      }
    }

    if (!leastUsedSource || leastUsedSource === '') {
      console.log("Unable to find source to assign to new harvester, aborting!")
      return -1;
    }

    console.log("least used source is " + leastUsedSource + " with " + leastUsedSourceCount + " harvesters assigned.");
    let properties: { [key: string]: any } = {
      role: "harvester",
      target_source_id: leastUsedSource,
      working: false
    };

    let status: ResponseCode | CreepName = SpawnManager.getFirstSpawn().canCreateCreep(bodyParts, undefined);
    if (status === OK) {
      status = SpawnManager.getFirstSpawn().createCreep(bodyParts, undefined, properties);

      if (Config.VERBOSE && !(status < 0)) {
        console.log("Started creating new Harvester");
      }
    }

    return status;
  }

  public setCreep(creep: Creep) {
    super.setCreep(creep);

    this.targetSource = <Source>Game.getObjectById<Source>(this.creep.memory["target_source_id"]);
    this.storage = <StructureSpawn | StructureExtension>creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: (s: Spawn | Extension) => (s instanceof StructureSpawn || s instanceof StructureExtension)
        && s.energy < s.energyCapacity
    })
  }

  public isBagFull(): boolean {
    return (this.creep.carry.energy === this.creep.carryCapacity);
  }

  public tryHarvest(): ResponseCode {
    if (this.storage && this.storage[0] && this.storage[0].store.energy === this.storage[0].storeCapacity) {
      return ERR_FULL;
    }

    return this.creep.harvest(this.targetSource);
  }

  public moveToHarvest(): void {
    if (this.tryHarvest() === ERR_NOT_IN_RANGE) {
      this.moveTo(this.targetSource);
    } else {

      if (Game.time % 2 === 0) {
        this.creep.say('tick');
      } else {
        this.creep.say('tock')
      }
    }
  }

  public tryEnergyDropOff(): ResponseCode {
    return this.creep.transfer(this.storage, RESOURCE_ENERGY);
  }

  public moveToDropEnergy(): void {
    if (this.tryEnergyDropOff() === ERR_NOT_IN_RANGE) {
      this.moveTo(this.storage);
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
