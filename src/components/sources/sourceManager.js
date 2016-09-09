"use strict";
const Config = require("./../../config/config");
const RoomManager = require("./../rooms/roomManager");
function loadSources() {
    exports.sources = RoomManager.getFirstRoom().find(FIND_SOURCES_ACTIVE);
    exports.sourceCount = _.size(exports.sources);
    if (Config.VERBOSE) {
        console.log(exports.sourceCount + " sources in room.");
    }
}
exports.loadSources = loadSources;
function getFirstSource() {
    return exports.sources[0];
}
exports.getFirstSource = getFirstSource;
