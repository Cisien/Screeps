import TowerAction, {ITowerAction} from './towerAction';

export default class TowerAttack extends TowerAction implements ITowerAction {
  public name: string = 'towerAttack';
  public doAction(tower: StructureTower):  ResponseCode {

    let target = tower.pos.findClosestByRange<Creep>(FIND_HOSTILE_CREEPS);

    if(target === null || target === undefined)
    {
      return ERR_INVALID_TARGET;
    }

    return tower.attack(target);
  }

}