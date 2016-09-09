"use strict";
const Config = require("./../../config/config");
class CreepAction {
    constructor() {
        this._minLifeBeforeNeedsRenew = Config.DEFAULT_MIN_LIFE_BEFORE_NEEDS_REFILL;
    }
    setCreep(creep) {
        this.creep = creep;
        this.renewStation = Game.getObjectById(this.creep.memory.renew_station_id);
    }
    moveTo(target) {
        return this.creep.moveTo(target);
    }
    needsRenew() {
        return (this.creep.ticksToLive < this._minLifeBeforeNeedsRenew);
    }
    tryRenew() {
        return this.renewStation.renewCreep(this.creep);
    }
    moveToRenew() {
        if (this.tryRenew() === ERR_NOT_IN_RANGE) {
            this.moveTo(this.renewStation);
        }
    }
    action() {
        return true;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CreepAction;
