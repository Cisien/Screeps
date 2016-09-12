export interface ITowerAction {
  name: string;
  doAction(tower: Structure<StructureTower>): ResponseCode;
}

export default class TowerAction implements ITowerAction{
  public name: string = 'none';
  doAction(tower: Structure<StructureTower>): ResponseCode {
    if (tower.hits == 0) {
      return OK;
    }
    return OK;
  }
}