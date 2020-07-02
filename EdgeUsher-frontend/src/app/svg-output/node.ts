import { SvgOutputComponent } from '../svg-output/svg-output.component';
import { ServiceP } from './service';

export class NodeP {
  
  svg: SvgOutputComponent;
  x: number;
  y: number;
  height: number;
  width: number;
  id: number;
  imageUrl: string;
  name: string;
  services = Array<ServiceP>();

  constructor(s: SvgOutputComponent) {
    this.svg = s;
    this.height = 70;
    this.width = 70;
  }

  onMouseDown(event) {

  }

  onMouseUp(event) {

  }

  onMouseMove(event) {

  }

  placeServices() {
    var s = this.services;
    var radius = this.width/2 + 20;
    var angle = 0;
    for (var j=0; j<s.length; j++) {
      var elem = s[j];
      angle = ((j / s.length) * (2 * Math.PI));
      //console.log('node ' + node.name + ' has the service ' + elem.name + ' placed at angle ' + angle);
      elem.x = this.x + radius * Math.cos(angle);
      elem.y = this.y + radius * Math.sin(angle);
    }
  }

  hasService(service: ServiceP): boolean {
    for (var i in this.services) {
      var s = this.services[i];
      if (s.id == service.id) return true;
    }
    return false;
  }

  addService(service: ServiceP): void {
    this.services.push(service);
  }

  removeService(service: ServiceP): void {
    for (var i=0; i<this.services.length; i++) {
      if (service.id == this.services[i].id) {
        this.services.splice(i, 1);
        i--;
        break;
      }
    }
  }

  
}