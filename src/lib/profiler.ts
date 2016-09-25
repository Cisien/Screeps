import Profiling from './profiling'

export class Profiler {
  private profiling:Profiling;

  constructor(profiling: Profiling) {
    this.profiling = profiling;
  }

  printProfile() {
    console.log(this.output());
  }

  emailProfile() {
    Game.notify(this.output());
  }

  output() {
    const elapsedTicks = Game.time - Memory["profiler"].enabledTick + 1;
    const header = 'calls\t\ttime\t\tavg\t\tfunction';
    const footer = [
      `Avg: ${(Memory["profiler"].totalTime / elapsedTicks).toFixed(2)}`,
      `Total: ${Memory["profiler"].totalTime.toFixed(2)}`,
      `Ticks: ${elapsedTicks}`,
    ].join('\t');
    let array: any[] = [];
    return array.concat(header, this.lines().slice(0, 20), footer).join('\n');
  }

  lines() {
    const stats = Object.keys(Memory["profiler"].map).map(functionName => {
      const functionCalls = Memory["profiler"].map[functionName];
      return {
        name: functionName,
        calls: functionCalls.calls,
        totalTime: functionCalls.time,
        averageTime: functionCalls.time / functionCalls.calls,
      };
    }).sort((val1, val2) => {
      return val2.totalTime - val1.totalTime;
    });

    return stats.map(data => {
      return [
        data.calls,
        data.totalTime.toFixed(1),
        data.averageTime.toFixed(3),
        data.name,
      ].join('\t\t');
    });
  }

  record(functionName: any, time: any) {
    if (!Memory["profiler"].map[functionName]) {
      Memory["profiler"].map[functionName] = {
        time: 0,
        calls: 0,
      };
    }
    Memory["profiler"].map[functionName].calls++;
    Memory["profiler"].map[functionName].time += time;
  }

  endTick() {
    if (Game.time >= Memory["profiler"].enabledTick) {
      Memory["profiler"].totalTime += Game.cpu.getUsed();
      this.report();
    }
  }

  report() {
    if (this.shouldPrint()) {
      this.printProfile();
    } else if (this.shouldEmail()) {
      this.emailProfile();
    }
  }

  isProfiling() {
    return this.profiling.enabled && !!Memory["profiler"] && Game.time <= Memory["profiler"].disableTick;
  }

  type() {
    return Memory["profiler"].type;
  }

  shouldPrint() {
    const streaming = this.type() === 'stream';
    const profiling = this.type() === 'profile';
    const onEndingTick = Memory["profiler"].disableTick === Game.time;
    return streaming || (profiling && onEndingTick);
  }

  shouldEmail() {
    return this.type() === 'email' && Memory["profiler"].disableTick === Game.time;
  }
}
