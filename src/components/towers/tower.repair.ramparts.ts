import TowerAction, {ITowerAction} from './towerAction';

export default class TowerRampartRepair extends TowerAction implements ITowerAction {
  public name: string = 'towerRampartRepair';
  public doAction(tower: StructureTower):  ResponseCode {

if (tower.room === undefined) {
      return ERR_INVALID_TARGET;
    }

    let ramparts = tower.room.find<Structure<StructureRampart>>(FIND_STRUCTURES, {
      filter: (s: Structure<StructureRampart>) =>
        (s instanceof StructureRampart) && s.hits < s.hitsMax
    });

    if (ramparts === null) {
      return ERR_INVALID_TARGET;
    }

    ramparts = _.sortBy(ramparts, (r: Structure<StructureRampart>) => r.hits);

    let target = _.first(ramparts);

    return tower.repair(target);
  }

}