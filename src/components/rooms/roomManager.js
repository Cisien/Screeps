"use strict";
const Config = require("./../../config/config");
exports.roomNames = [];
function loadRooms() {
    exports.rooms = Game.rooms;
    _loadRoomNames();
    if (Config.VERBOSE) {
        let count = _.size(exports.rooms);
        console.log(count + " rooms found.");
    }
}
exports.loadRooms = loadRooms;
function getFirstRoom() {
    return exports.rooms[exports.roomNames[0]];
}
exports.getFirstRoom = getFirstRoom;
function _loadRoomNames() {
    for (let roomName in exports.rooms) {
        if (exports.rooms.hasOwnProperty(roomName)) {
            exports.roomNames.push(roomName);
        }
    }
}
