import CreepAction, { ICreepAction } from "./creepAction";
import * as SpawnManager from '../spawns/spawnManager';
import * as Config from '../../config/config';
import IRepairer from './repairer';

export default class WallRepairer extends CreepAction implements IRepairer, ICreepAction {

    public repairTarget: Structure<StructureWall | StructureRampart> | null;

    public static spawn(): ResponseCode | CreepName {
        let bodyParts = Config.REPAIRER_PARTS;
        let properties: { [key: string]: any } = {
            role: "wallRepairer",
            working: false
        };

        let status = SpawnManager.getFirstSpawn().createCreep(bodyParts, undefined, properties);
        console.log(status);
        if (Config.VERBOSE && !(status < 0)) {
            console.log("Started creating new wall Repairer");
        }
        return status;
    }

    public setCreep(creep: Creep) {
        super.setCreep(creep);

        this.targetStorage = creep.pos.findClosestByPath<StructureContainer | StructureStorage>(FIND_STRUCTURES, {
            filter: (s: Structure<StructureContainer | StructureStorage>) => (s instanceof StructureStorage || s instanceof StructureContainer)
                && s.store.energy >= creep.carryCapacity
        });

        if (creep.room === undefined) {
            return;
        }

        let ramparts = creep.room.find<Structure<StructureWall>>(FIND_STRUCTURES, {
            filter: (s: Structure<StructureWall>) =>
                (s instanceof StructureWall) && s.hits < s.hitsMax
        });

        if (ramparts === null) {
            return;
        }

        ramparts = _.sortBy(ramparts, (r: Structure<StructureRampart>) => r.hits);

        this.repairTarget = _.first(ramparts);
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
