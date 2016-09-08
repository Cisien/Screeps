var roleBuilder = {
    run: function (creep) {

        if (creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('harvesting');
        }
        if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
            creep.memory.building = true;
            creep.say('building');
        }

        if (creep.memory.building) {

            if (creep.carry.energy < creep.carryCapacity) {
                var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
                if (targets.length) {
                    if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0]);
                    }
                }
            }
            else {
                var sources = creep.room.find(FIND_SOURCES);
                for (var source in sources) {
                    if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                        var moved = creep.moveTo(source);
                        console.log("harvester able to move: " + moved == OK);
                        if (moved == OK) {
                            break;
                        }
                    }

                }
            }
        }
    }
};

module.exports = roleBuilder;