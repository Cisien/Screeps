"use strict";
const Config = require("./config/config");
const MemoryManager = require("./shared/memoryManager");
const RoomManager = require("./components/rooms/roomManager");
const SpawnManager = require("./components/spawns/spawnManager");
const SourceManager = require("./components/sources/sourceManager");
const CreepManager = require("./components/creeps/creepManager");
RoomManager.loadRooms();
SpawnManager.loadSpawns();
SourceManager.loadSources();
if (Config.USE_PATHFINDER) {
    PathFinder.use(true);
}
function loop() {
    MemoryManager.loadMemory();
    CreepManager.loadCreeps();
    if (!CreepManager.isHarvesterLimitFull()) {
        CreepManager.createHarvester();
        if (Config.VERBOSE) {
            console.log("Need more harvesters!");
        }
    }
    CreepManager.harvestersGoToWork();
}
exports.loop = loop;
