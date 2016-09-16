import TowerAction, {ITowerAction} from './towerAction';

export default class TowerRepair extends TowerAction implements ITowerAction {
  public name: string = 'towerRepair';
  public doAction(tower: StructureTower):  ResponseCode {

    let target = tower.pos.findClosestByRange<Structure<any>>(FIND_STRUCTURES, {
      filter: (s: Structure<any>) => s.hits < s.hitsMax && (s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART)
    });
    if(target === null || target === undefined)
    {
      return ERR_INVALID_TARGET;
    }

    return tower.repair(target);
  }

}