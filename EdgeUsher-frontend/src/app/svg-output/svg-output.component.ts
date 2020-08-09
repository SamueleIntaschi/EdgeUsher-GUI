import { Component, OnInit, ElementRef, ViewChild, Renderer2, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NodeP } from './node';
import { Node } from '../svg-infrastructure/node';
import { LinkP } from './link';
import { Link } from '../svg-infrastructure/link';
import { ServiceP } from './service';
import { Service } from '../svg-chain/service';
import { NodeDialogComponent, SecurityCapabilities, NodeProb, NodeFields } from '../node-dialog/node-dialog.component';
import { LinkDialogComponent, LinkProb } from '../link-dialog/link-dialog.component';
import { LocalStorageService } from '../local-storage-service';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import * as FileSaver from 'file-saver';
import * as SvgPanZoom from 'svg-pan-zoom';
import { ConfirmationRequestComponent } from '../confirmation-request/confirmation-request.component';
import { NodeMenuComponent } from '../node-menu/node-menu.component';
import { LinkMenuComponent } from '../link-menu/link-menu.component';
import { Placement, Place, Route } from '../execution-dialog/execution-dialog.component';
import { PlacementObject } from './placement-object';

@Component({
  selector: 'app-svg-output',
  templateUrl: './svg-output.component.html',
  styleUrls: ['./svg-output.component.css']
})


export class SvgOutputComponent implements OnInit, AfterViewInit {

  @ViewChild('svgelemoutput', { static: true }) svg: ElementRef<SVGSVGElement>;
  @ViewChild('unplacedsvg', { static: true}) unplacedSvg: ElementRef<SVGSVGElement>;
  @Output() changePlacements: EventEmitter<any> = new EventEmitter<any>();
  @Output() firstSelectedPlacement: EventEmitter<any> = new EventEmitter<any>();
  @Output() clearPlacements: EventEmitter<number> = new EventEmitter<number>();
  placements = Array<Placement>();
  nodes = Array<NodeP>();
  services = Array<ServiceP>();
  links = Array<LinkP>();
  nodeId = 0;
  serviceId = 0;
  linkId = 0;
  movedService = -1;
  svgPanZoom: SvgPanZoom.Instance;
  movementX = 0;
  movementY = 0;
  lastX = -1;
  lastY = -1;
  dragging = false;
  leaved = -1;
  selectedPlacement: Placement;
  unplacedServices = Array<ServiceP>();
  userPlacement: PlacementObject = new PlacementObject();
  onUnplacedSVG = false;
  placementId = 0;
  hideLinks = false;
  unplacedArea = {
    x: 100,
    y: 100,
    r: 100
  }

  constructor(public dialog: MatDialog, public localStorageService: LocalStorageService) {}


  ngOnInit(): void {
    this.retrieveChainInformation();
    this.retrieveInfrastructureInformation();
    this.retrievePlacements();
    if (this.selectedPlacement) {
      this.setSelectedPlacement();
      this.placeServices();
    }
    else this.newPlacement();
  }

  ngAfterViewInit(): void {
    this.svgPanZoom = SvgPanZoom('#svgplacementelem',  {
      zoomEnabled: false,
      panEnabled: true,
      controlIconsEnabled: false,
      fit: false,
      center: false,
      mouseWheelZoomEnabled: false,
      dblClickZoomEnabled: false,
    });
  }

  /*--- RESIZE METHODS ---*/
  
  onZoom(type: number) {
    if (type == 0) {
      this.svgPanZoom.zoomOut();
    }
    else if (type == 1) {
      this.svgPanZoom.zoomIn();
    }
    else if (type == 2) {
      this.svgPanZoom.resetZoom();
      this.svgPanZoom.resetPan();
    }
  }

  //Hide the code and show the svg
  hideCode() {
    document.getElementById("svgplacement").style.display = 'block';
    document.getElementById("code").style.display = 'none';
    var elem = <any>document.getElementById("left-radio-button-pl") as HTMLInputElement;
    elem.checked = false;
    elem = <any>document.getElementById("right-radio-button-pl");
    elem.checked = true;
  }

  //------------------------------------------------------------------------------------------------------------------------------------
  /*--- DATA METHODS ---*/

  //Reset all the variables, except infrastructure and chain
  newPlacement() {
    //Clear the placements
    this.new();
    //Draw the services in the centre
    var s = this.services;
    const width = 300;
    var radius = width/2 + 20;
    var svg = document.getElementById('svgplacementelem').getBoundingClientRect();
    var cx = svg.width / 2;
    var cy = svg.height / 2;
    var angle = 0;
    for (var j=0; j<s.length; j++) {
      var elem = s[j];
      angle = ((j / s.length) * (2 * Math.PI));
      //console.log('node ' + node.name + ' has the service ' + elem.name + ' placed at angle ' + angle);
      elem.x = cx + radius * Math.cos(angle);
      elem.y = cy + radius * Math.sin(angle);
    }
    this.userPlacement = new PlacementObject();
    this.userPlacement.setChainId(this.localStorageService.getChainTitle());
    this.selectedPlacement = this.userPlacement.placement;
    for (var i in this.services) {
      this.unplacedServices.push(this.services[i]);
    }
    this.placeUnplacedServices();
  }

  //Reset all the variables
  new() {
    this.userPlacement = new PlacementObject();
    this.localStorageService.storePlacements([]);
    this.clearRoutes();
    this.placements = [];
    this.movedService = -1;
    this.movementX = 0;
    this.movementY = 0;
    this.lastX = -1;
    this.lastY = -1;
    this.dragging = false;
    this.leaved = -1;
    this.onUnplacedSVG = false;
    this.selectedPlacement = null;
    this.clearPlacements.emit(1);
    this.unplacedServices = [];
    this.placementId = 0;
  }

  clearRoutes() {
    for (var i in this.links) {
      this.links[i].usedBw = 0;
    }
  }

  //Retrieve placements saved in local storage
  retrievePlacements() {
    var ps = this.localStorageService.getPlacements();
    if (ps.length > 0) {
      for (var i in ps) {
        this.placements.push(ps[i]);
      }
      this.selectedPlacement = ps[0];
      this.userPlacement.placement = this.selectedPlacement;
      this.changePlacements.emit(this.placements);
      this.firstSelectedPlacement.emit(this.indexOfPlacement(this.selectedPlacement));
    }
  }

  //Select one of the available placements to view it
  setSelectedPlacement() {
    this.resetPlacement();
    for (var j in this.selectedPlacement.placement) {
      var pl = this.selectedPlacement.placement[j];
      //console.log(pl);
      var indexNode = this.indexOfNodeByName(pl.node);
      var indexService = this.indexOfServiceByName(pl.service);
      if (indexNode != -1 && indexService != -1) {
        var node = this.nodes[indexNode];
        node.addService(this.services[indexService]);
        //console.log('node ' + node.name + ' has the service ' + this.services[indexService].name);
      }
    }
    for (var j in this.selectedPlacement.routes) {
      var rt = this.selectedPlacement.routes[j];
      var index = this.indexOfLinkByNodes(rt.fromNode, rt.toNode);
      if (index != -1) {
        this.links[index].usedBw = rt.usedBw;
      }
    }
  }

  resetPlacement() {
    this.movedService = -1;
    this.movementX = 0;
    this.movementY = 0;
    this.lastX = -1;
    this.lastY = -1;
    this.dragging = false;
    this.leaved = -1;
    this.onUnplacedSVG = false;
    for (var i in this.nodes) {
      var node = this.nodes[i];
      node.services = [];
    }
    for (var i in this.links) {
      this.links[i].usedBw = null;
    }
  }

  //Get the infrastructure from the storage
  retrieveInfrastructureInformation() {
    var ss = this.localStorageService.getNodes() as Array<Node>;
    for (var i in ss) {
      var node = new NodeP(this);
      node.x = ss[i].x;
      node.y = ss[i].y;
      node.width = ss[i].width;
      node.height = ss[i].height;
      node.id = ss[i].id;
      node.name = ss[i].name;
      node.imageUrl = ss[i].imageUrl;
      this.nodes.push(node);
      //Update the id to assign at the new squares
      this.nodeId = node.id + 1;
    }
    var ls = this.localStorageService.getLinks();
    for (var i in ls) {
      var link = new LinkP(this);
      link.fromNode = ls[i].fromNode;
      link.toNode = ls[i].toNode;
      link.x1 = ls[i].x1;
      link.y1 = ls[i].y1;
      link.x2 = ls[i].x2;
      link.y2 = ls[i].y2;
      link.type = ls[i].type;
      link.id = ls[i].id;
      link.vdirection = ls[i].vdirection;
      link.hdirection = ls[i].hdirection;
      link.path = ls[i].path;
      link.textpath = ls[i].textpath;
      link.middlePoint = ls[i].middlePoint;
      link.createPath();
      link.createTextPath();
      this.links.push(link);
      this.linkId = link.id + 1;
    }
  }

  //Get the chain from the storage
  retrieveChainInformation() {
    var ss = this.localStorageService.getServices() as Array<Service>;
    for (var i in ss) {
      var s = new ServiceP(this);
      s.x = 0;
      s.y = 0;
      s.id = ss[i].id;
      s.name = ss[i].name;
      this.services.push(s);
      this.serviceId = s.id + 1;
    }
  }

  //Place the services in the area
  placeServices() {
    for (var i in this.nodes) {
      var node = this.nodes[i];
      node.placeServices();
    }
  }

  //Create placements in order, order that was provided by chain file
  createPlacementBase() {
    var p = Array<string>();
    var f: Array<string> = this.localStorageService.getChainFile();
    var str: string;
    if (f) {
      str = f[0];
      str = str.split('[')[1].split(']')[0].trim();
      var tmp = str.split(',');
      for (var i in tmp) p.push(tmp[i].trim());
      return p;
    }
    return null;
  }

  //Get the node where the service is
  getPlaceRequestedFor(service: string) {
    for (var i=0; i<this.nodes.length; i++) {
      var s = this.indexOfServiceByName(service);
      if (this.nodes[i].hasService(this.services[s])) return this.nodes[i];
    }
    return null;
  }

  //Create a placement string: [on(f1,n1), on(f2,n2), ..., on(fn,nn)] from the visualized placement
  createPlacement(): string {
    var p = this.selectedPlacement.placement;
    var str = '';
    var order = this.createPlacementBase();

    for (var i=0; i<order.length; i++) {
      var n = this.getPlaceRequestedFor(order[i]);
      if (n) {
        //Add the placement if it is specified
        if (i==0) str = 'on(' + order[i] + ',' + n.name + ')';
        else str = str + ', on(' + order[i] + ',' + n.name + ')';
      }
      else {
        //Add a variable
        if (i==0) str = 'on(' + order[i] + ',' + 'N' + i + ')';
        else str = str + ', on(' + order[i] + ',' + 'N' + i + ')';
      }
    }
    str = '[' + str + ']';
    //console.log(str);
    return str;
  }

  //Create routes string: [(n1, n2, usedBw, [(f1, f2), ...]), ...] of the visualized placement
  createRoutes(): string {
    var rt = '';

    if (this.selectedPlacement.routes.length == 0) return 'ServiceRoutes';

    for (var i=0; i< this.selectedPlacement.routes.length; i++) {
      var r = this.selectedPlacement.routes[i];
      if (rt == '') {
        rt = '(' + r.fromNode + ', ' + r.toNode + ', ' + r.usedBw;
        var fs = '';
        for (var j in r.flows) {
          if (fs == '') {
            fs = '(' + r.flows[j].from + ', ' + r.flows[j].to + ')'; 
          }
          else {
            fs = fs + ', (' + r.flows[j].from + ', ' + r.flows[j].to + ')'; 
          }
        }
        rt = rt + ', [' + fs + '])';
      }
      else {
        rt = rt + ', (' + r.fromNode + ', ' + r.toNode + ', ' + r.usedBw;
        var fs = '';
        for (var j in r.flows) {
          if (fs == '') {
            fs = '(' + r.flows[j].from + ', ' + r.flows[j].to + ')'; 
          }
          else {
            fs = fs + ', (' + r.flows[j].from + ', ' + r.flows[j].to + ')'; 
          }
        }
        rt = rt + ', [' + fs + '])';
      }
    }

    return rt;
  }

  //Create full placement string: (chainId, [on(f1,n1), on(f2,n2), ..., on(fn,nn)], Routes)
  createFullPlacement(): string {
    var str = 'placement(' + this.selectedPlacement.chainId + ', ' + this.createPlacement() + ', ' + this.createRoutes() + '): ' + this.selectedPlacement.prob;
    return str;
  }

  //Save placement as prolog file
  saveSelectedPlacementAsFile() {
    var file = Array<string>();
    var placement = this.createFullPlacement();
    file.push(placement);
    let blob = new Blob([file.join('\n')], {
      type: 'plain/text'
    });
    var fname = 'placement' + this.selectedPlacement.id;
    fname = fname + '.pl';
    FileSaver.saveAs(blob, fname);
  }


//---------------------------------------------------------------------------------------------------------------------------------------
  /*--- MOUSE EVENTS HANDLING ---*/

  onMouseDownUnplaced(event) {
    //Do nothing
  }

  onMouseMoveUnplaced(event) {
    this.onUnplacedSVG = true;
    if (this.movedService >= 0) {
      var index = this.indexOfServiceById(this.movedService);
      if (index != -1) {
        var service = this.services[index];
        //Update the service coordinates
        service.x = event.offsetX;
        service.y = event.offsetY;      
      }
    }
  }

  onMouseUpUnplaced($event) {
  }

  onMouseLeaveUnplaced() {
    if (this.movedService != -1) {
      var index = this.indexOfServiceById(this.movedService);
      var indexu = this.indexOfUnplacedService(this.services[index]);
      this.unplacedServices.splice(indexu, 1);
      this.placeUnplacedServices();
    }
  }

  onMouseDown(event) {
    if (event.button == 0) {
      if (event.target == document.getElementById('svgplacementelem')) {
        var x = event.offsetX;
        var y = event.offsetY;
        this.lastX = (x - this.svgPanZoom.getPan().x) / this.svgPanZoom.getZoom();
        this.lastY = (y - this.svgPanZoom.getPan().y) / this.svgPanZoom.getZoom();
        this.dragging = true;
      }
    }
  }

  onMouseWheel(event) {
    event.preventDefault();
  }

  onMouseMove(event) {
    this.onUnplacedSVG = false;
    //Get the coordinates in the svg
    var x = (event.offsetX - this.svgPanZoom.getPan().x) / this.svgPanZoom.getZoom();
    var y = (event.offsetY - this.svgPanZoom.getPan().y) / this.svgPanZoom.getZoom();
    //console.log(x,y);
    if (this.dragging) {
      var deltaX = Math.abs(x - this.lastX);
      var deltaY = Math.abs(y - this.lastY);
      this.movementX += deltaX;
      this.movementY += deltaY;
    }
    else if (this.movedService >= 0) {
      var index = this.indexOfServiceById(this.movedService);
      if (index != -1) {
        var service = this.services[index];
        //Update the service coordinates
        service.x = x;
        service.y = y;
      }
    }
  }
  
  onMouseUp(event) {
    var x = (event.offsetX - this.svgPanZoom.getPan().x) / this.svgPanZoom.getZoom();
    var y = (event.offsetY - this.svgPanZoom.getPan().y) / this.svgPanZoom.getZoom();
    if (event.button == 0) {
      if (this.movementX > 5 || this.movementY > 5) {
        //Case pan moving
        this.lastX = -1;
        this.lastY = -1;
        this.movementY = 0;
        this.movementX = 0;
      }
      else if (this.leaved >= 0) {
        this.leaved = -1;
      }
      //Check where the click happen
      else if (event.target != document.getElementById("svgelem")) {
        if (event.target.class == "node") {
          //Case node
        }
        else if (event.target.class == 'link') {
          //Case link
        }
      }
      else {
        //Do nothing
      }
    }
    this.dragging = false;
  }

  onMouseLeave(event) {
    if (this.dragging == true) {
      this.dragging = false;
      this.lastX = -1;
      this.lastY = -1;
      this.movementY = 0;
      this.movementX = 0;
      this.leaved = 1;
    }
    //Check if the mouse is on other service
    if (this.movedService != -1) {
      var index = this.indexOfServiceById(this.movedService);
      var node = this.whereIsService(this.services[index]);
      if (node) {
        node.removeService(this.services[index]);
        this.userPlacement.removePlace(this.services[index].name, node.name);
        this.selectedPlacement = this.userPlacement.placement;
        node.placeServices();
      }
      this.unplacedServices.push(this.services[index]);
      this.placeUnplacedServices();
      this.movedService = -1;
    }
  }

//---------------------------------------------------------------------------------------------------------------------------------------
  /*--- DATA STRUCTURES HANDLING ---*/

  //Place the services that are unplaced in the specific svg
  placeUnplacedServices() {
    var s = this.unplacedServices;
    var radius = 80;
    var svg = document.getElementById('unplacedsvg').getBoundingClientRect();
    var cx = svg.width / 2;
    var cy = svg.height / 2 - 8;
    var angle = 0;
    for (var j=0; j<s.length; j++) {
      var elem = s[j];
      angle = ((j / s.length) * (2 * Math.PI));
      //console.log('node ' + node.name + ' has the service ' + elem.name + ' placed at angle ' + angle);
      elem.x = cx + radius * Math.cos(angle);
      elem.y = cy + radius * Math.sin(angle);
    }
  }

  //Get the index of this placement
  indexOfPlacement(pl: Placement) {
    for (var i=0; i<this.placements.length; i++) {
      if (this.placements[i].id == pl.id) return i;
    }
    return -1;
  }

  //Get the index of the unplaced service
  indexOfUnplacedService(s: ServiceP) {
    for (var i=0; i<this.unplacedServices.length; i++) {
      if (s.id == this.unplacedServices[i].id) return i;
    }
    return -1;
  }

  //Get the index of link in know the nodes
  indexOfLinkByNodes(node1: string, node2: string) {
    for (var i=0; i<this.links.length; i++) {
      var l = this.links[i];
      if (l.fromNode == node1 && l.toNode == node2){
        return i;
      }
    }
    return -1;
  }

  //Get the index of this service by its id
  indexOfSquareById(id: number) {
    for (var i in this.nodes) {
      if (this.nodes[i].id == id) return Number(i);    
    }
    return -1;
  }

  //Get the index of the service by name
  indexOfServiceByName(name: string) {
    for (var i in this.services) {
      if (this.services[i].name == name) return Number(i);
    }
    return -1;
  }

  //Get the index of service by id
  indexOfServiceById(id: number) {
    for (var i in this.services) {
      if (this.services[i].id == id) return Number(i);
    }
    return -1;
  }

  //Get the index of link by id
  indexOfLink(id:number) {
    for (var i in this.links) {
      if (this.links[i].id == id) return Number(i);
    }
    return -1;
  }

  //Check on which node there is this service
  whereIsService(service: ServiceP): NodeP {
    for (var i in this.nodes) {
      if (this.nodes[i].hasService(service)) {
        return this.nodes[i];
      }
    }
    return null;
  }

  //Check if the service is on a node when moving
  onNode(service: ServiceP): NodeP {
    var right = service.x + service.r;
    var left = service.x - service.r;
    var bottom = service.y + service.r;
    var top = service.y - service.r;
    for (var i in this.nodes) {
      //Limit of the node i
      var node = this.nodes[i];
      var rightLimit = node.x + node.width/2;
      var leftLimit = node.x - node.width/2;
      var bottomLimit = node.y + node.height/2;
      var topLimit = node.y - node.height/2;
      if (!(right < leftLimit || left > rightLimit || top > bottomLimit || bottom < topLimit)) return node;
    }
    return null;
  }

  //Get the index of the node by name
  indexOfNodeByName(name: string) {
    for (var i in this.nodes) {
      if (this.nodes[i].name == name) return Number(i);
    }
    return -1;
  }

  /*--- DIALOGS METHODS ---*/S

  openConfirmationDialog(text: string, type: string) {
    const dialogRef = this.dialog.open(ConfirmationRequestComponent, {
      autoFocus: false,
      data: {
        text: text,
        type: type,
      }
    });

    dialogRef.componentInstance.positiveClick.subscribe(() => {
      if (type == 'reset') {
        
      }
      else if (type == 'no-probs') {
      }
    });

    dialogRef.componentInstance.negativeClick.subscribe(() => {
      //Do nothing
    });
  }

  openErrorDialog(error: string) {
    const dialogRef = this.dialog.open(ErrorDialogComponent, {
      data: {
        err: error
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      
    });
  }

}
