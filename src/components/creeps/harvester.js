"use strict";
const creepAction_1 = require("./creepAction");
class Harvester extends creepAction_1.default {
    setCreep(creep) {
        super.setCreep(creep);
        this.targetSource = Game.getObjectById(this.creep.memory.target_source_id);
        this.targetEnergyDropOff = Game.getObjectById(this.creep.memory.target_energy_dropoff_id);
    }
    isBagFull() {
        return (this.creep.carry.energy === this.creep.carryCapacity);
    }
    tryHarvest() {
        return this.creep.harvest(this.targetSource);
    }
    moveToHarvest() {
        if (this.tryHarvest() === ERR_NOT_IN_RANGE) {
            this.moveTo(this.targetSource);
        }
    }
    tryEnergyDropOff() {
        return this.creep.transfer(this.targetEnergyDropOff, RESOURCE_ENERGY);
    }
    moveToDropEnergy() {
        if (this.tryEnergyDropOff() === ERR_NOT_IN_RANGE) {
            this.moveTo(this.targetEnergyDropOff);
        }
    }
    action() {
        if (this.needsRenew()) {
            this.moveToRenew();
        }
        else if (this.isBagFull()) {
            this.moveToDropEnergy();
        }
        else {
            this.moveToHarvest();
        }
        return true;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Harvester;
