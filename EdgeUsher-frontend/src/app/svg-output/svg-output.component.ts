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


//TODO: controllare procedura che carica file per vedere i placement


export class SvgOutputComponent implements OnInit, AfterViewInit {

  @ViewChild('svgelemoutput', { static: true }) svg: ElementRef<SVGSVGElement>;
  @ViewChild('unplacedsvg', { static: true}) unplacedSvg: ElementRef<SVGSVGElement>;
  @Output() onChangeTitleFromUpload = new EventEmitter<string>();
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
  movedNode = -1;
  movedService = -1;
  node1: Node;
  isDrawingLine = false;
  clickToCreate = false;
  infrasFile = Array<string>();
  title = "Untitled placement";
  svgPanZoom: SvgPanZoom.Instance;
  movementX = 0;
  movementY = 0;
  lastX = -1;
  lastY = -1;
  dragging = false;
  leaved = -1;
  probabilisticMode = 'static';
  openNodeDialogs = Array<number>();
  openLinkDialogs = Array<number>();
  selectedPlacement: Placement;
  unplacedServices = Array<ServiceP>();
  userPlacement: PlacementObject = new PlacementObject();
  onUnplacedSVG = false;
  placementId = 0;
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

  new() {
    this.userPlacement = new PlacementObject();
    this.localStorageService.storePlacements([]);
    this.placements = [];
    this.movedNode = -1;
    this.movedService = -1;
    this.isDrawingLine = false;
    this.clickToCreate = false;
    this.title = "Untitled placement";
    this.movementX = 0;
    this.movementY = 0;
    this.lastX = -1;
    this.lastY = -1;
    this.dragging = false;
    this.leaved = -1;
    this.selectedPlacement = null;
    this.clearPlacements.emit(1);
    this.onUnplacedSVG = false;
    this.unplacedServices = [];
    this.placementId = 0;
  }

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

  retrieveInformationFromFile(file: File) {
    this.new();
    let fileReader = new FileReader();
    fileReader.onloadend = (e) => {
      var placements = (fileReader.result as string).split('\n');
      for (var i=0; i<placements.length; i++) {
        console.log(placements[i]);
        var tmp: string = placements[i].trim().split('(')[0];
        if (tmp && tmp != 'placement') {
          //Do nothing
        }
        else {
          var prob: string = <string>placements[i].split(':')[1];
          console.log(prob);
          if (prob) {
            prob = prob.trim();
          }
          var placement0 =  placements[i].split(',[')[1];
          if (placement0) {
            placement0 = placement0.split(']')[0];
          }
          var routesTmp =<string>placements[i].split(',[')[2];
          var routes: string;
          if (routesTmp) {
            routes = routesTmp.split(':')[0];
          }
          var chainIdtmp = <string>placements[i].split('(')[1];
          var chainId: string;
          if (chainIdtmp) {
            chainId = chainIdtmp.split(',')[0].trim();
          }
          var p: Array<Place> = this.createPlacementFromString(placement0);
          var r: Array<Route> = this.createRoutesFromString(routes);
          if (p != null && r != null) {
            if (Number(prob) > 0) {
              var placement = {
                chainId: chainId,
                placement: p,
                routes: r,
                prob: Number(prob),
                id: this.placementId
              }
              this.placements.push(placement);
              this.placementId++;
            }
            else {
              //Do nothing if prob <= 0
            }
          }
        }
        if (this.placements.length > 0) {
          this.localStorageService.storePlacements(this.placements);
          this.retrievePlacements();
        }
      }
    }
    fileReader.readAsText(file);

  }

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
    //TODO: controllare se procedura di reset per cambiare placement visualizzato è corretta, cioè se viene resettato tutto
    this.movedService = -1;
    this.movedNode = -1;
    for (var i in this.nodes) {
      var node = this.nodes[i];
      node.services = [];
    }
    for (var i in this.links) {
      this.links[i].usedBw = null;
    }
  }

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
      this.links.push(link);
      this.linkId = link.id + 1;
    }
  }

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

  placeServices() {
    for (var i in this.nodes) {
      var node = this.nodes[i];
      node.placeServices();
    }
  }

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
    //console.log(str);
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

  uploadPlacement(event) {
    if (event.target.files && event.target.files.length) {
      //Hide the code if it is visible
      this.hideCode();
      var file = event.target.files[0];
      var tmpfile = file.name.split('.');
      this.retrieveInformationFromFile(file);
    }
  }

  createPlacementFromString(str: string) {
    var ps = Array<Place>();
    var tmp: Array<string>;
    var tmp2: Array<string>;
    var service: string;
    var node: string;
    var pselem: Place;
    if (str) {
      tmp = str.split('),');
    }
    else return null;
    //console.log(str);
    //console.log(tmp);
    for (var i in tmp) {
      if (tmp[i]) {
        tmp2 = tmp[i].split('(');
        if (tmp2[1]) {
          service = tmp2[1].split(',')[0];
          node = tmp2[1].split(',')[1];
          if (node.indexOf(')')>=0) {
            node = node.split(')')[0];
          }
          if (node && service) {
            pselem = {
              service: service.trim(),
              node: node.trim()
            };
            ps.push(pselem);
          }
          else return null;
        }
        else return null;
      }
      else return null;
    }
    //console.log(ps);
    return ps;
  }

  createRoutesFromString(str: string) {
    var rts = Array<Route>();
    var tmp = Array<string>();
    var tmp2 = Array<string>();
    var tmp3 = Array<string>();
    var node1 = '';
    var node2 = '';
    var usedBw = '';
    var from = '';
    var to = '';
    var elem: Route;
    var bw: number;
    var from2 = '';
    var to2 = '';
    var node2 = '';
    var flowstr = Array<string>();
    var flows: Array<{
      from: string,
      to: string,
    }>;
    if (str) {
      tmp = str.split(']),');
    }
    else return null;
    for (var i in tmp) {
      //console.log(tmp[i]);
      if (tmp[i].indexOf(',') <= 0) {
        //Case empty routes
        return [];
        /*rts.push({
          fromNode: '',
          toNode: '',
          usedBw: 0,
          flows: [],
        });
        return rts;*/
      }
      if (tmp[i]) {
        tmp2 = tmp[i].split(',');
        node1 = tmp2[0];
        node2 = tmp2[1];
        usedBw = tmp2[2];
        flows = [];
        
        if (tmp[i].split('[')[1]) {
          flowstr = tmp[i].split('[')[1].split('(');
        }

        if (usedBw) {
          bw = Number(usedBw.trim());
        }
        if (node2 && node1) {
          node1 = node1.split('(')[1];
          node2 = node2;
        }

        for (var i in flowstr) {
          var s1 = flowstr[i].split(',')[0];
          var s2 = flowstr[i].split(',')[1];
          if (s2) s2 = s2.split(')')[0];
          if (s1 && s2) {
            s1 = s1.trim();
            s2 = s2.trim();
            if (s1 && s2 && s1.indexOf(' ') < 0 && s2.indexOf(' ') < 0) {
              flows.push({
                from: s1,
                to: s2
              })
              //console.log(flows);
            }
          }
        }

        if (node1 && node2 && bw && flows && isNaN(bw) == false) {
          elem = {
            fromNode: node1.trim(),
            toNode: node2.trim(),
            usedBw: bw,
            flows: flows,
          };
          rts.push(elem);
        }
        else return null;
      }
      else return null;
    }
    return rts;
  }



//---------------------------------------------------------------------------------------------------------------------------------------
  /*--- MOUSE EVENTS HANDLING ---*/

  onMouseDownUnplaced(event) {

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
        this.clickToCreate = true;
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
    else if (this.movedNode >= 0) {
      document.getElementById('node'+this.nodes[this.movedNode].id).style.cursor = 'move';
      var index = this.indexOfSquareById(this.movedNode);
      this.nodes[index].x = x;
      this.nodes[index].y = y;
      //Update the services connected
      this.nodes[index].placeServices();
      //Update the lines
      for (var i in this.links) {
        if (this.links[i].fromNode == this.nodes[index].name) {
          this.links[i].modifyLinkFrom(this.nodes[index]);
          //this.localStorageService.modifyLink(this.links[i]);
        }
        if (this.links[i].toNode == this.nodes[index].name) {
          this.links[i].modifyLinkto(this.nodes[index]);
          //this.localStorageService.modifyLink(this.links[i]);
        }
      }
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
        if (this.movedNode >= 0) {
          document.getElementById('node'+this.nodes[this.movedNode].id).style.cursor = 'move';
          var index = this.indexOfSquareById(this.movedNode);
          this.nodes[index].x = x;
          //var y = (panZoomHeight - divY - (panZoomHeight-(viewboxHeight*realZoom)) + currentPan.y) / realZoom;    
          this.nodes[index].y = y;
          //Update the lines
          for (var i in this.links) {
            if (this.links[i].fromNode == this.nodes[index].name) {
              this.links[i].modifyLinkFrom(this.nodes[index]);
              //this.localStorageService.modifyLink(this.links[i]);
            }
            if (this.links[i].toNode == this.nodes[index].name) {
              this.links[i].modifyLinkto(this.nodes[index]);
              //this.localStorageService.modifyLink(this.links[i]);
            }
          }
        }
      }
    }
    this.dragging = false;
  }

  onMouseLeave(event) {
    //if (this.movedSquare >= 0) this.movedSquare = -1;
    if (this.isDrawingLine == true) {
      this.isDrawingLine = false;
      this.svgPanZoom.enablePan();
      this.leaved = 1;
    }
    if (this.dragging == true) {
      this.dragging = false;
      this.lastX = -1;
      this.lastY = -1;
      this.movementY = 0;
      this.movementX = 0;
      this.leaved = 1;
    }
    this.clickToCreate = false;
    //Check if the mouse is on other service
    if (this.movedService != -1) {
      var index = this.indexOfServiceById(this.movedService);
      //var node = this.whereIsService(this.services[index]);
      //node.placeServices();
      var node = this.whereIsService(this.services[index]);
      if (node) {
        node.removeService(this.services[index]);
        node.placeServices();
      }
      this.unplacedServices.push(this.services[index]);
      this.placeUnplacedServices();
      this.movedService = -1;
    }
  }

//---------------------------------------------------------------------------------------------------------------------------------------
  /*--- DATA STRUCTURES HANDLING ---*/
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

  isOpenNode(id: number) {
    for (var i in this.openNodeDialogs) {
      //if (this.nodes[i].id) == id) return true;
      if (this.openNodeDialogs[i] == id) return true;
    }
    return false;
  }

  isOpenLink(id: number) {
    for (var i in this.openLinkDialogs) {
      if (this.openLinkDialogs[i] == id) return true;
    }
    return false;
  }

  removeNodeDialog(id: number) {
    for (var i=0; i<this.openNodeDialogs.length; i++) {
      if (this.openNodeDialogs[i] == id) {
        this.openNodeDialogs.splice(i, 1);
        i--;
        break;
      }
    }
  }

  removeLinkDialog(id: number) {
    for (var i=0; i<this.openLinkDialogs.length; i++) {
      if (this.openLinkDialogs[i] == id) {
        this.openLinkDialogs.splice(i, 1);
        i--;
        break;
      }
    }
  }

  indexOfPlacement(pl: Placement) {
    for (var i=0; i<this.placements.length; i++) {
      if (this.placements[i].id == pl.id) return i;
    }
    return -1;
  }

  indexOfUnplacedService(s: ServiceP) {
    for (var i=0; i<this.unplacedServices.length; i++) {
      if (s.id == this.unplacedServices[i].id) return i;
    }
    return -1;
  }

  indexOfLinkByNodes(node1: string, node2: string) {
    for (var i=0; i<this.links.length; i++) {
      var l = this.links[i];
      if (l.fromNode == node1 && l.toNode == node2){
        return i;
      }
    }
    return -1;
  }

  indexOfSquareById(id: number) {
    for (var i in this.nodes) {
      if (this.nodes[i].id == id) return Number(i);    
    }
    return -1;
  }

  
  indexOfServiceByName(name: string) {
    for (var i in this.services) {
      if (this.services[i].name == name) return Number(i);
    }
    return -1;
  }

  indexOfServiceById(id: number) {
    for (var i in this.services) {
      if (this.services[i].id == id) return Number(i);
    }
    return -1;
  }

  indexOfLink(id:number) {
    for (var i in this.links) {
      if (this.links[i].id == id) return Number(i);
    }
    return -1;
  }

  whereIsService(service: ServiceP): NodeP {
    for (var i in this.nodes) {
      if (this.nodes[i].hasService(service)) {
        return this.nodes[i];
      }
    }
    return null;
  }

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

  tooCloseToAnotherNode(node1: Node) {
    //Limit of this node
    var right = node1.x + node1.width/2;
    var left = node1.x - node1.width/2;
    var bottom = node1.y + node1.height/2;
    var top = node1.y - node1.height/2;
    for (var i in this.nodes) {
      if (this.nodes[i].id != node1.id) {
        //Limit of the node i
        var node = this.nodes[i];
        var rightLimit = node.x + node.width/2;
        var leftLimit = node.x - node.width/2;
        var bottomLimit = node.y + node.height/2;
        var topLimit = node.y - node.height/2;
        if (!(right < leftLimit || left > rightLimit || top > bottomLimit || bottom < topLimit)) return true;
      }
    }
    return false;
  }

  indexOfNodeByName(name: string) {
    for (var i in this.nodes) {
      if (this.nodes[i].name == name) return Number(i);
    }
    return -1;
  }

  deleteLink(link: LinkP) {
    for (var i=0; i<this.links.length; i++) {
      if (this.links[i].id == link.id) {
        //this.localStorageService.deleteLink(link);
        this.links.splice(i, 1);
        i--;
        break;
      }
    }
  }

  deleteNode(node: NodeP) {
    for (var i=0; i<this.nodes.length; i++) {
      if (this.nodes[i].id == node.id) {
        for (var j=0; j<this.links.length; j++) {
          if (this.links[j].fromNode == node.name || this.links[j].toNode == node.name) {
            //this.localStorageService.deleteLink(this.links[j]);
            this.links.splice(j, 1);
            j--;
          }
        }
        //this.localStorageService.deleteNode(node);
        this.nodes.splice(i, 1);
        i--;
        break;
      }
    }
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
