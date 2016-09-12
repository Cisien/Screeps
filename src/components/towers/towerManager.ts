import * as RoomManager from '../rooms/roomManager';
import TowerAction from './towerAction';
import TowerAttack from './tower.attack'
//import TowerHeal from './tower.heal'
//import TowerRepair from './tower.repair'
//import TowerRampartRepair from './tower.repair.ramparts'


export let towers: StructureTower[] | null;

export let towerActions: TowerAction[] = [new TowerAttack(), /*new TowerHeal(), new TowerRepair(), new TowerRampartRepair()*/];

export function doTickWork(): void {

  this.towers = RoomManager.getFirstRoom().find<StructureTower>(FIND_STRUCTURES, {
    filter: (s: StructureTower) => s instanceof StructureTower && s.energy >= 10
  });

  if (this.towers === null || this.towers.length === 0) {
    return;
  }

  for (let action of this.towerActions) {
    _.forEach(this.towers, (tower: StructureTower) => {
      let actionCode = action.doAction(tower)
      console.log(action.name + ' completed with code ' + actionCode);
      if (actionCode === OK) {
        return;
      }
    });
  }
}