import TowerAction, {ITowerAction} from './towerAction';

export default class TowerHeal extends TowerAction implements ITowerAction {
  public name: string = 'towerHeal';
  public doAction(tower: StructureTower): ResponseCode {

    let target = tower.pos.findClosestByRange<Creep>(FIND_MY_CREEPS, {
      filter: (c: Creep) => c.hits < c.hitsMax
    });

    if(target === null || target === undefined)
    {
      return ERR_INVALID_TARGET;
    }

    return tower.heal(target);
  }

}