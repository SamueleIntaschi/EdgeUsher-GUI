import { SvgOutputComponent } from '../svg-output/svg-output.component';

export class ServiceP {
  
  svg: SvgOutputComponent;
  x = 0;
  y = 0;
  r = 0;
  id: number;
  name = 'Service name';
  

  constructor(s: SvgOutputComponent) {
    this.svg = s;
    this.r = 20;
  }

  onMouseDown(event) {
    event.preventDefault();
    if (event.button == 0) {
      this.svg.movedService = this.id;
      this.svg.svgPanZoom.disablePan();
      this.svg.isDrawingLine = true;
      /*var index = this.svg.indexOfUnplacedService(this);
      if (index != -1) {
        this.svg.unplacedServices.splice(index, 1);
      }*/
    }
  }

  onMouseUp(event) {
    console.log(this.name)
    event.preventDefault();
    if (event.button == 0 && event.target.id == 'service' + this.id) {
      var oldNode = this.svg.whereIsService(this);
      var newNode = this.svg.onNode(this);
      if (this.svg.onUnplacedSVG) {
        this.svg.placeUnplacedServices();
      }
      else {
      if (oldNode && newNode && oldNode.id != newNode.id) {
        //Case movement from a node to another
        oldNode.removeService(this);
        this.svg.userPlacement.removePlace(this.name, oldNode.name);
        this.svg.selectedPlacement = this.svg.userPlacement.placement;
        oldNode.placeServices();
        newNode.addService(this);
        this.svg.userPlacement.addPlace(this.name, newNode.name);
        this.svg.selectedPlacement = this.svg.userPlacement.placement;
        newNode.placeServices();
      }
      else if (newNode && oldNode && newNode.id == oldNode.id) {
        //Case service remain in same node
        newNode.placeServices();
      }
      else if  (newNode && !oldNode) {
        //Case only newNode
        newNode.addService(this);
        this.svg.userPlacement.addPlace(this.name, newNode.name);
        this.svg.selectedPlacement = this.svg.userPlacement.placement;
        console.log(this.svg.selectedPlacement);
        newNode.placeServices();
        //Remove from unplaced services
        //var index = this.svg.indexOfUnplacedService(this);
        //if (index != -1) this.svg.unplacedServices.splice(index, 1);
        //this.svg.placeUnplacedServices();
      }
      else if (oldNode && !newNode) {
        //Case only oldNode, service become unplaced
        this.svg.unplacedServices.push(this);
        this.svg.placeUnplacedServices();
        oldNode.removeService(this);
        this.svg.userPlacement.removePlace(this.name, oldNode.name);
        this.svg.selectedPlacement = this.svg.userPlacement.placement;
        oldNode.placeServices();
      }
      else if (!newNode && !oldNode) {
        //Case service remain unplaced
        this.svg.placeUnplacedServices();
      }
    }
    }
    this.svg.movedService = -1;
    this.svg.svgPanZoom.enablePan();
  }

  onMouseMove(event) {

  }
}