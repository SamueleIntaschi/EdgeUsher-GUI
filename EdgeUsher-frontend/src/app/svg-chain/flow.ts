import { Service } from './service';
import { SvgChainComponent } from './svg-chain.component';

export class Flow {
  coord1 = {
    x: 0,
    y: 0
  };
  coord2 = {
    x: 0,
    y: 0
  };
  coordBox = {
    x: 0,
    y: 0,
    w: 0,
    h: 0
  };
  fromService:string;
  toService: string;
  bandwidth: number;
  id: number;
  svg: SvgChainComponent;

  constructor(s: SvgChainComponent) {      
    this.svg = s;
  }

  onMouseUp(event) {
    event.preventDefault();
    if (event.button == 0) {
      this.svg.cancelTmpFlow();
      this.svg.clickToCreate = false;
      if (this.svg.isOpenFlow(this.id) == false) {
        this.svg.openFlowMenu(this);
      }
    }
  }
}