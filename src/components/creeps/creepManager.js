"use strict";
const Config = require("./../../config/config");
const SourceManager = require("./../sources/sourceManager");
const SpawnManager = require("./../spawns/spawnManager");
const harvester_1 = require("./harvester");
exports.creepNames = [];
function loadCreeps() {
    exports.creeps = Game.creeps;
    exports.creepCount = _.size(exports.creeps);
    _loadCreepNames();
    if (Config.VERBOSE) {
        console.log(exports.creepCount + " creeps found in the playground.");
    }
}
exports.loadCreeps = loadCreeps;
function createHarvester() {
    let bodyParts = [MOVE, MOVE, CARRY, WORK];
    let name = undefined;
    let properties = {
        renew_station_id: SpawnManager.getFirstSpawn().id,
        role: "harvester",
        target_energy_dropoff_id: SpawnManager.getFirstSpawn().id,
        target_source_id: SourceManager.getFirstSource().id,
    };
    let status = SpawnManager.getFirstSpawn().canCreateCreep(bodyParts, name);
    if (status === OK) {
        status = SpawnManager.getFirstSpawn().createCreep(bodyParts, name, properties);
        if (Config.VERBOSE) {
            console.log("Started creating new Harvester");
        }
    }
    return status;
}
exports.createHarvester = createHarvester;
function harvestersGoToWork() {
    let harvesters = [];
    _.forEach(this.creeps, function (creep) {
        if (creep.memory.role === "harvester") {
            let harvester = new harvester_1.default();
            harvester.setCreep(creep);
            harvester.action();
            harvesters.push(harvester);
        }
    });
    if (Config.VERBOSE) {
        console.log(harvesters.length + " harvesters reported on duty today!");
    }
}
exports.harvestersGoToWork = harvestersGoToWork;
function isHarvesterLimitFull() {
    return (Config.MAX_HARVESTERS_PER_SOURCE === this.creepCount);
}
exports.isHarvesterLimitFull = isHarvesterLimitFull;
function _loadCreepNames() {
    for (let creepName in exports.creeps) {
        if (exports.creeps.hasOwnProperty(creepName)) {
            exports.creepNames.push(creepName);
        }
    }
}
