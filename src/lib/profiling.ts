import {Profiler} from "./profiler";

export default class Profiling {
  private usedOnStart = 0;
  private depth = 0;

  public enabled = false;

  private profiler:Profiler;

  constructor() {
    this.profiler = new Profiler(this);
  }

  wrap(callback: any) {
    if (this.enabled) {
      this.setupProfiler();
    }
    if (this.profiler.isProfiling()) {
      this.usedOnStart = Game.cpu.getUsed();

      // Commented lines are part of an on going experiment to keep the profiler
      // performant, and measure certain types of overhead.

      // var callbackStart = Game.cpu.getUsed();
      const returnVal = callback();
      // var callbackEnd = Game.cpu.getUsed();
      this.profiler.endTick();
      // var end = Game.cpu.getUsed();

      // var profilerTime = (end - start) - (callbackEnd - callbackStart);
      // var callbackTime = callbackEnd - callbackStart;
      // var unaccounted = end - profilerTime - callbackTime;
      // console.log('total-', end, 'profiler-', profilerTime, 'callbacktime-',
      // callbackTime, 'start-', start, 'unaccounted', unaccounted);
      return returnVal;
    }

    return callback();
  }

  enable() {
    this.enabled = true;
    this.hookUpPrototypes();
  }

  registerObject(object: any, label: any) {
    return this.profileObjectFunctions(object, label);
  }

  registerFN(fn: any, functionName: any) {
    return this.profileFunction(fn, functionName);
  }

  setupProfiler() {
    let that = this;
    this.depth = 0; // reset depth, this needs to be done each tick.
    Game["profiler"] = {
      stream(duration: any, filter: any) {
        that.setupMemory('stream', duration || 10, filter);
      },
      email(duration: any, filter: any) {
        that.setupMemory('email', duration || 100, filter);
      },
      profile(duration: any, filter: any) {
        that.setupMemory('profile', duration || 100, filter);
      },
      reset: that.resetMemory,
    };

    that.overloadCPUCalc();
  }

  setupMemory(profileType: any, duration: any, filter: any) {
    this.resetMemory();
    if (!Memory["profiler"]) {
      Memory["profiler"] = {
        map: {},
        totalTime: 0,
        enabledTick: Game.time + 1,
        disableTick: Game.time + duration,
        type: profileType,
        filter,
      };
    }
  }

  resetMemory() {
    Memory["profiler"] = null;
  }

  overloadCPUCalc() {
    if (Game.rooms["sim"]) {
      this.usedOnStart = 0; // This needs to be reset, but only in the sim.
      Game.cpu.getUsed = function getUsed() {
        return performance.now() - this.usedOnStart;
      }
    }
  }

  getFilter() {
    return Memory["profiler"].filter;
  }

  wrapFunction(name: any, originalFunction: any) {
    var that = this;
    return function wrappedFunction() {
      if (that.profiler.isProfiling()) {
        const nameMatchesFilter = name === that.getFilter();
        const start = Game.cpu.getUsed();
        if (nameMatchesFilter) {
          that.depth++;
        }
        const result = originalFunction.apply(this, arguments);
        if (that.depth > 0 || !that.getFilter()) {
          const end = Game.cpu.getUsed();
          that.profiler.record(name, end - start);
        }
        if (nameMatchesFilter) {
          that.depth--;
        }
        return result;
      }

      return originalFunction.apply(this, arguments);
    }
  }

  hookUpPrototypes() {
    let prototypes: any[] = [
      {name: 'Game', val: Game},
      {name: 'Room', val: Room},
      {name: 'Structure', val: Structure},
      {name: 'Spawn', val: Spawn},
      {name: 'Creep', val: Creep},
      {name: 'RoomPosition', val: RoomPosition},
      {name: 'Source', val: Source},
      {name: 'Flag', val: Flag}
      ];

    prototypes.forEach(proto => {
      this.profileObjectFunctions(proto.val, proto.name);
    });
  }

  profileObjectFunctions(object: any, label: any) {
    const objectToWrap = object.prototype ? object.prototype : object;

    Object.keys(objectToWrap).forEach(functionName => {
      const extendedLabel = `${label}.${functionName}`;
      try {
        if (typeof objectToWrap[functionName] === 'function' && functionName !== 'getUsed') {
          const originalFunction = objectToWrap[functionName];
          objectToWrap[functionName] = this.profileFunction(originalFunction, extendedLabel);
        }
      } catch (e) {
      }
      /* eslint no-empty:0 */
    });

    return objectToWrap;
  }

  profileFunction(fn: any, functionName: any) {
    const fnName = functionName || fn.name;
    if (!fnName) {
      console.log('Couldn\'t find a name for - ', fn);
      console.log('Will not profile this function.');
      return fn;
    }

    return this.wrapFunction(fnName, fn);
  }
}
