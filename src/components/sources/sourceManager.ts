import * as Config from "./../../config/config";
import * as RoomManager from "./../rooms/roomManager";

export let sources: Source[];
export let sourceCount: number;

export function loadSources() {
  sources = RoomManager.getFirstRoom().find<Source>(FIND_SOURCES_ACTIVE);
  sourceCount = _.size(sources);

  if (Config.VERBOSE) {
    console.log(sourceCount + " sources in room.");
    console.log("this is a change")
  }
}

export function getFirstSource(): Source {
  return sources[0];
}
