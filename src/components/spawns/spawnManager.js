"use strict";
const Config = require("./../../config/config");
exports.spawnNames = [];
function loadSpawns() {
    exports.spawns = Game.spawns;
    exports.spawnCount = _.size(exports.spawns);
    _loadSpawnNames();
    if (Config.VERBOSE) {
        console.log(exports.spawnCount + " spawns in room.");
    }
}
exports.loadSpawns = loadSpawns;
function getFirstSpawn() {
    return exports.spawns[exports.spawnNames[0]];
}
exports.getFirstSpawn = getFirstSpawn;
function _loadSpawnNames() {
    for (let spawnName in exports.spawns) {
        if (exports.spawns.hasOwnProperty(spawnName)) {
            exports.spawnNames.push(spawnName);
        }
    }
}
