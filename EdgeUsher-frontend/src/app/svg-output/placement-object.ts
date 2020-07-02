import { Placement, Place, Route } from '../execution-dialog/execution-dialog.component';

export class PlacementObject {
  placement: Placement;

  constructor() {
    this.placement = {
      placement: [],
      routes: [],
      prob: 1,
      chainId: '',
      id: 0,
    };
  }

  addPlace(service, node) {
    this.placement.placement.push({
        service: service,
        node: node
    });
  }

  removePlace(service, node) {
    for (var i=0; i<this.placement.placement.length; i++) {
      var p = this.placement.placement[i];
      if (p.service == service && p.node == node) {
        this.placement.placement.splice(i, 1);
        i--;
        break;
      }
    }
  }

  addRoute(r: Route) {

  }

  removeRoute(r: Route) {

  }

  setChainId(c: string) {
    this.placement.chainId = c;
  }
}