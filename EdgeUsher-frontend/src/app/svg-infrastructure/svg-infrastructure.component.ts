import { Component, OnInit, ElementRef, ViewChild, Renderer2, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Node } from './node';
import { Link } from './link';
import { NodeDialogComponent, SecurityCapabilities, NodeProb, NodeFields } from '../node-dialog/node-dialog.component';
import { LinkDialogComponent, LinkProb } from '../link-dialog/link-dialog.component';
import { LocalStorageService } from '../local-storage-service';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import * as FileSaver from 'file-saver';
import * as SvgPanZoom from 'svg-pan-zoom';
import { ConfirmationRequestComponent } from '../confirmation-request/confirmation-request.component';
import { NodeMenuComponent } from '../node-menu/node-menu.component';
import { LinkMenuComponent } from '../link-menu/link-menu.component';

//TODO: aumentare area cliccabile link

//TODO: capire perchè quando viene selezionata la probabilità nei menu si modifica sempre quella dello stesso menu

//TODO: correggere eventuali bug probabilità

@Component({
  selector: 'app-svg-infrastructure',
  templateUrl: './svg-infrastructure.component.html',
  styleUrls: ['./svg-infrastructure.component.css']
})

export class SvgInfrastructureComponent implements OnInit, AfterViewInit {

  @ViewChild('svgelem', { static: true }) svg: ElementRef<SVGSVGElement>;
  @Output() onChangeTitleFromUpload = new EventEmitter<string>();
  nodes = Array<Node>();
  links = Array<Link>();
  nodeId = 0;
  linkId = 0;
  tmpLink = new Link(this);
  movedSquare = -1;
  node1: Node;
  isDrawingLine = false;
  clickToCreate = false;
  infrasFile = Array<string>();
  title = "Untitled infrastructure";
  svgPanZoom: SvgPanZoom.Instance;
  movementX = 0;
  movementY = 0;
  lastX = -1;
  lastY = -1;
  dragging = false;
  openNodeDialogs = Array<number>();
  openLinkDialogs = Array<number>();

  constructor(public dialog: MatDialog, public localStorageService: LocalStorageService) {}


  ngOnInit(): void {
    this.retrieveInformation();
  }

  ngAfterViewInit(): void {
    this.svgPanZoom = SvgPanZoom('#svgelem',  {
      zoomEnabled: false,
      panEnabled: true,
      controlIconsEnabled: false,
      fit: false,
      center: false,
      mouseWheelZoomEnabled: false,
      dblClickZoomEnabled: false,
      //minZoom: 0.1
    });
    //this.svgPanZoom.zoom(0.1);
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
    this.redrawMenus();
  }

  //Hide the code and show the svg
  hideCode() {
    document.getElementById("svg").style.display = 'block';
    document.getElementById("code").style.display = 'none';
    var elem = <any>document.getElementById("left-radio-button-infr") as HTMLInputElement;
    elem.checked = false;
    elem = <any>document.getElementById("right-radio-button-infr");
    elem.checked = true;
  }

  //------------------------------------------------------------------------------------------------------------------------------------
  /*--- DATA METHODS ---*/

  //Get the information from the session storage
  retrieveInformation(): void {
    var t = this.localStorageService.getInfrastructureTitle();
    if (t) {
      this.title = t;
      this.onChangeTitleFromUpload.emit(this.title);
    }
    var ss = this.localStorageService.getNodes() as Array<Node>;
    for (var i in ss) {
      var node = new Node(this);
      node.x = ss[i].x;
      node.y = ss[i].y;
      node.width = ss[i].width;
      node.height = ss[i].height;
      node.id = ss[i].id;
      node.name = ss[i].name;
      node.singleValue = ss[i].singleValue;
      node.probs = ss[i].probs;
      node.connectedNodes = ss[i].connectedNodes;
      node.imageUrl = ss[i].imageUrl;
      node.strHwCaps = ss[i].strHwCaps;
      node.strIotCaps = ss[i].strIotCaps;
      node.strHwCaps = ss[i].strHwCaps;
      node.probabilistic = ss[i].probabilistic;
      this.nodes.push(node);
      //Update the id to assign at the new squares
      this.nodeId = node.id + 1;
    }
    var ls = this.localStorageService.getLinks();
    for (var i in ls) {
      var link = new Link(this);
      link.fromNode = ls[i].fromNode;
      link.toNode = ls[i].toNode;
      link.bandwidth = ls[i].bandwidth;
      link.latency = ls[i].latency;
      link.probs = ls[i].probs;
      link.x1 = ls[i].x1;
      link.y1 = ls[i].y1;
      link.x2 = ls[i].x2;
      link.y2 = ls[i].y2;
      link.type = ls[i].type;
      link.id = ls[i].id;
      link.coordBox = ls[i].coordBox;
      link.vdirection = ls[i].vdirection;
      link.hdirection = ls[i].hdirection;
      link.path = ls[i].path;
      link.textpath = ls[i].textpath;
      link.middlePoint = ls[i].middlePoint;
      link.probabilistic = ls[i].probabilistic;
      link.title = ls[i].title;
      this.links.push(link);
      this.linkId = link.id + 1;
    }
    this.localStorageService.storeInfrastructureFile(this.createInfrastructureFile());
  }

  //Get the information from the .eu file
  retrieveInformationFromFile(file: File) {
    this.new();
    this.title = file.name;
    this.localStorageService.setInfrastructureTitle(this.title);
    this.onChangeTitleFromUpload.emit(this.title);
    let fileReader = new FileReader();
    fileReader.onloadend = (e) => {
      // By lines
      var lines = (fileReader.result as string).split('\n');
      for(var line = 0; line < lines.length; line++){
        //Parsing of nodes
        //console.log(lines[line]);
        if (line == 0) {
          var sqs = JSON.parse(lines[line]);
          for (var i in sqs) {
            var n = JSON.parse(sqs[i]);
            var node = new Node(this);
            node.x = n.x;
            node.y = n.y;
            node.width = n.width;
            node.height = n.height;
            node.id = n.id;
            node.name = n.name;
            node.singleValue = n.singleValue;
            node.probs = n.probs;
            node.connectedNodes = n.connectedNodes;
            node.imageUrl = n.imageUrl;
            node.strHwCaps = n.strHwCaps;
            node.strIotCaps = n.strIotCaps;
            node.strHwCaps = n.strHwCaps;
            node.probabilistic = n.probabilistic;
            this.nodes.push(node);
            this.localStorageService.storeNode(node);
            //Update the id to assign at the new squares
            this.nodeId = node.id + 1;
          }
        }
        else if (line == 1) {
          var lns = JSON.parse(lines[line]);
          for (var i in lns) {
            var l = JSON.parse(lns[i]); 
            var link = new Link(this);
            link.fromNode = l.fromNode;
            link.toNode = l.toNode;
            link.bandwidth = l.bandwidth;
            link.latency = l.latency;
            link.x1 = l.x1;
            link.y1 = l.y1;
            link.x2 = l.x2;
            link.y2 = l.y2;
            link.type = l.type;
            link.probs = l.probs;
            link.id = l.id;
            link.coordBox = l.coordBox;
            link.vdirection = l.vdirection;
            link.hdirection = l.hdirection;
            link.path = l.path;
            link.middlePoint = l.middlePoint;
            link.probabilistic = l.probabilistic;
            link.title = l.title;
            this.links.push(link);
            this.localStorageService.storeLink(link);
            this.linkId = link.id + 1;
          }
        }
      }
      this.localStorageService.storeInfrastructureFile(this.createInfrastructureFile());
    }
    fileReader.readAsText(file);
  }

  //Get the information from the prolog file
  retrieveInformationFromAllPrologFile(file: File) {
    var errs;
    this.new();
    this.title = file.name.split('.')[0];
    this.localStorageService.setInfrastructureTitle(this.title);
    this.onChangeTitleFromUpload.emit(this.title);
    let fileReader = new FileReader();
    fileReader.onloadend = (e) => {
      var lines = (fileReader.result as string).split('\n');

      for (var line=0; line<lines.length; line++) {

        var l = lines[line];
        var tmp = l.trim().split('(');
        var prob = Number(tmp[0].split('::')[0]);
        var type: string;
        //console.log(tmp);
        if (prob && prob <= 1 && prob >= 0 ) {
          //Case probability for this node or link
          type = tmp[0].trim().split('::')[1];
          if (type == 'node') {
            var nodesStrings = l.trim().split(';');
            var node: Node;
            for (var j=0; j<nodesStrings.length; j++) {
              //Create the node 
              if (j == 0) {
                node = new Node(this);
                node.probabilistic = true;
                var tmp2 = nodesStrings[j].trim().split('(');
                var str = tmp2[1].trim().split(')')[0].trim();
                var params = str.split(',');
                node.id = this.nodeId;
                node.name = params[0].trim();
                node.imageUrl = "../../icons/network/building.svg";
                var nodeFields = this.retrieveNodeFieldsFromPrologFile(nodesStrings[j].trim().substring(nodesStrings[j].indexOf('::')+1));
                node.probs.push({
                  prob: (Number(prob)),
                  value: nodeFields,
                });
              }
              //Add only the probability to the node
              else {
                var tmpProb = nodesStrings[j].trim().split('::')[0];
                var nodeFields = this.retrieveNodeFieldsFromPrologFile(nodesStrings[j].trim().substring(nodesStrings[j].indexOf('::')+1));
                node.probs.push({
                  prob: (Number(tmpProb)),
                  value: nodeFields,
                });
              }
            }          
            console.log(node);
            this.nodes.push(node);
            this.localStorageService.storeNode(node);
            this.nodeId++;      
          }
          else if (type == 'link') {

              var linkStrings = l.trim().split(';');
              var link: Link;

              for (var j=0; j<linkStrings.length; j++) {
                console.log(linkStrings[j]);
                //Create the link
                if (j == 0) {
                  link = new Link(this);
                  //Note that there is a probability for this link
                  link.probabilistic = true;
                  //Get the first probabilitistic profile
                  var tmp2 = linkStrings[j].trim().split('(');
                  var str = tmp2[1].trim().split(')')[0].trim();
                  var params = str.split(',');
                  link.id = this.linkId;
                  link.fromNode = params[0].trim();
                  link.toNode = params[1].trim();
                  link.type = 'wireless';
                  link.probs.push({
                    prob: (Number(prob)),
                    latvalue: Number(params[2].trim()),
                    bandvalue: Number(params[3].trim())
                  });
                }
                //Add the probability to the links
                else {
                  tmpProb = linkStrings[j].trim().split('::')[0];
                  var tmp2 = linkStrings[j].trim().split('(');
                  var str = tmp2[1].trim().split(')')[0].trim();
                  var params = str.split(',');
                  link.id = this.linkId;
                  link.fromNode = params[0].trim();
                  link.toNode = params[1].trim();
                  link.type = 'wireless';
                  link.probs.push({
                    prob: (Number(tmpProb)),
                    latvalue: Number(params[2].trim()),
                    bandvalue: Number(params[3].trim())
                  });
                }
              }
              link.createTitle();
              this.links.push(link);
              this.localStorageService.storeLink(link);
              this.linkId++;
            }

        }
        else if (prob > 1 || prob < 0) {
          //Case probablity not correct
          this.openErrorDialog('Error in parsing: line ' + line);
          errs++;
        }
        else {
          //Case link or node without probability
          type = tmp[0].trim();
          if (type == 'node') {
            var node = this.retrieveNodeFromPrologFile(l);
            if (node != null) {
              this.nodes.push(node);
              this.localStorageService.storeNode(node);
              this.nodeId++;
            }
            else {
              this.openErrorDialog('Error in parsing: line ' + line);
              errs++;
            }
          }
          else if (type == 'link') {
            var link = this.retrieveLinkFromPrologFile(l);
            if (link != null) {
              link.createTitle();
              this.links.push(link);
              this.localStorageService.storeLink(link);
              this.linkId++;
            }
            else {
              this.openErrorDialog('Error in parsing: line ' + line);
              errs++;
            }
          }
        }
      }
      this.collocateInSpace();
      //Delete the infrastructure because there are errors
      if (errs > 0) this.new();
      else this.localStorageService.storeInfrastructureFile(this.createInfrastructureFile());
    }
    fileReader.readAsText(file);
  }

  //Get the node field from the prolong string
  retrieveNodeFieldsFromPrologFile(line: string) {
    var fields: NodeFields = {
      hwCaps: 0,
      iotCaps: Array<string>(),
      secCaps: {
        virtualisation: {
          accessLogs: false,
          auth: false,
          hIds: false,
          procIsol: false,
          permMdl: false,
          resMon: false,
          restPnts: false,
          userIsol: false
        },
        communications: {
          certificates: false,
          firewall: false,
          dataEncr: false,        
          nodeIsol: false,
          netIDS: false,
          keyCrypt: false,
          wirelessSec: false   
        },
        data: {
          backup: false,
          encrStorage: false,
          obfsStorage: false
        },
        physical: {
          accessCtrl: false,
          antiTamp: false
        },
        other: {
          audit: false
        },
      }
    }
    var tmp = line.trim().split('(');
    //Get the parameters
    var str = tmp[1].trim().split(')')[0].trim();
    var params = str.split(',');
    fields.hwCaps = Number(params[1].trim());
    var iot = Array<string>();
    var firstiot = params[2].trim().split('[')[1];
    var i = 3;
    if (firstiot == ']') {
      iot.push('');
    }
    else if (firstiot.indexOf(']') >= 0) {
      iot.push(firstiot.split(']')[0]);
    }
    else {
      iot.push(firstiot);
      var stop = false;
      while (!stop) {
        if (params[i].indexOf(']') >= 0) {
          var pi = params[i].trim().split(']')[0].trim();
          iot.push(pi);
          stop = true;
        }
        else iot.push(params[i].trim());
        i++;
      }
    }
    fields.iotCaps = iot;

    if (params[i].indexOf('[') >= 0) {
      var firstsec = params[i].trim().split('[')[1].trim();
      if (firstsec == ']') {
        //Do nothing because the security capabilities of the node is initialized to false
      }
      else if (firstsec.indexOf(']') >= 0) {
        fields = this.updateFieldSecCaps(fields, firstsec.split(']')[0].trim());
        stop = true;
      }
      else {
        fields = this.updateFieldSecCaps(fields, firstsec);
        var stop = false;
        while (!stop) {
          if (params[i].indexOf(']') >= 0) {
            var sec1 = params[i].trim().split(']')[0].trim();
            stop = true;
          }
          else { 
            sec1 = params[i].trim();
          }
          fields = this.updateFieldSecCaps(fields, sec1);
          i++;
        }
      }
    }
    return fields;
  }

  retrieveNodeFromPrologFile(line: string) {
    var tmp = line.trim().split('(');
    //Get the parameters
    var str = tmp[1].trim().split(')')[0].trim();
    var params = str.split(',');
    var node = new Node(this);
    node.id = this.nodeId;
    node.name = params[0].trim();
    if (node.name == '' || this.indexOfNodeByName(node.name) != -1) {
      return null;
    }
    node.singleValue.hwCaps = Number(params[1].trim());
    if (!node.singleValue.hwCaps || Number(node.singleValue.hwCaps) < 0 ) {
      return null;
    }
    //Assign an icon
    node.imageUrl = "../../icons/network/building.svg";
    var iot = Array<string>();
    var firstiot = params[2].trim().split('[')[1];
    var i = 3;
    if (firstiot == ']') {
      iot.push('');
    }
    else if (firstiot.indexOf(']') >= 0) {
      iot.push(firstiot.split(']')[0]);
    }
    else {
      iot.push(firstiot);
      var stop = false;
      while (!stop) {
        if (params[i].indexOf(']') >= 0) {
          var pi = params[i].trim().split(']')[0].trim();
          if (pi != '') iot.push(pi.toLowerCase());
          stop = true;
        }
        else if (params[i] != '' && params[i].indexOf(' ') < 0) {
          iot.push(params[i].trim().toLowerCase());
        }
        i++;
      }
    }
    node.singleValue.iotCaps = iot;
    
    if (params[i].indexOf('[') >= 0) {
      //TODO: controllare se vengono inseriti requisiti validi
      var firstsec = params[i].trim().split('[')[1].trim();
      if (firstsec == ']') {
        //Do nothing because the security capabilities of the node is initialized to false
      }
      else if (firstsec.indexOf(']') >= 0) {
        node.updateSecCaps(firstsec.split(']')[0].trim());
        stop = true;
      }
      else {
        node.updateSecCaps(firstsec);
        var stop = false;
        while (!stop) {
          if (params[i].indexOf(']') >= 0) {
            var sec1 = params[i].trim().split(']')[0].trim();
            stop = true;
          }
          else { 
            sec1 = params[i].trim();
          }
          node.updateSecCaps(sec1);
          i++;
        }
      }
    }
    //node.singleValue = this.retrieveNodeFieldsFromPrologFile(line);
    return node;
  }

  retrieveLinkFromPrologFile(line: string) {
    var tmp = line.trim().split('(');
    //Get the parameters
    var str = tmp[1].trim().split(')')[0].trim();
    var link = new Link(this);
    link.id = this.linkId;
    var params = str.split(',');
    var nodename = params[0].trim();
    if (nodename != '' && this.indexOfNodeByName(nodename) != -1) {
      link.fromNode = nodename;
    }
    else return null;
    nodename = params[1].trim();
    if (nodename != '' && this.indexOfNodeByName(nodename) != -1) {
      link.toNode = nodename;
    }
    else return null;
    var latency = Number(params[2].trim());
    if (isNaN(latency) == false || latency >= 0) {
      link.latency = latency;
    }
    else return null;
    var bandwidth = Number(params[3].trim());
    if (isNaN(bandwidth) == false && bandwidth >= 0) {
      link.bandwidth = bandwidth;
    }
    else return null;
    link.type = 'wireless';
    return link;
  }

  updateFieldSecCaps(singleValue: NodeFields, sec: string) {
    //console.log(sec);
    //Virtualisation requisites
    if (sec == 'access_logs') {
      singleValue.secCaps.virtualisation.accessLogs = true;
    }
    if (sec == 'authentication') {
      singleValue.secCaps.virtualisation.auth = true
    }
    if (sec == 'host_IDS') {
      singleValue.secCaps.virtualisation.hIds = true;
    }
    if (sec == 'process_isolation') {
      singleValue.secCaps.virtualisation.procIsol = true;
    }
    if (sec == 'permission_model') {
      singleValue.secCaps.virtualisation.permMdl = true;
    }
    if (sec == 'resource_monitoring') {
      singleValue.secCaps.virtualisation.resMon = true;
    }
    if (sec == 'restore_points') {
      singleValue.secCaps.virtualisation.restPnts = true;
    }
    if (sec == 'user_data_isolation') {
      singleValue.secCaps.virtualisation.userIsol = true;
    }
    //Communications requisites
    if (sec == 'certificates') {
      singleValue.secCaps.communications.certificates = true;
    }
    if (sec == 'firewall') {
      singleValue.secCaps.communications.firewall = true;
    }
    if (sec == 'iot_data_encryption') {
      singleValue.secCaps.communications.dataEncr = true;
    }
    if (sec == 'node_isolation_mechanisms') {
      singleValue.secCaps.communications.nodeIsol = true;
    }
    if (sec == 'network_IDS') {
      singleValue.secCaps.communications.netIDS = true;
    }
    if (sec == 'pki') {
      singleValue.secCaps.communications.keyCrypt = true;
    }
    if (sec == 'wireless_security') {
      singleValue.secCaps.communications.wirelessSec = true;
    }
    //Data requisites
    if (sec == 'backup') {
      singleValue.secCaps.data.backup = true;
    }
    if (sec == 'encrypted_storage') {
      singleValue.secCaps.data.encrStorage = true;
    }
    if (sec == 'obfuscated_storage') {
      singleValue.secCaps.data.obfsStorage = true;
    }
    //Physiscal requisites
    if (sec == 'access_control') {
      singleValue.secCaps.physical.accessCtrl = true;
    }
    if (sec == 'anti_tampering') {
      singleValue.secCaps.physical.antiTamp = true;
    }
    //Other requisites
    if (sec == 'audit') {
      singleValue.secCaps.other.audit = true;
    }
    return singleValue;
  }

  collocateInSpace() {
    var x = 50;
    var y = 50;
    var svgdims = document.getElementById('svgelem').getBoundingClientRect();
    for (var i in this.nodes) {
      var node = this.nodes[i];
      node.x = x;
      node.y = y;
      if (x > svgdims.right - 50) {
        x = 50;
        node.x = 50;
        y = y + 200;
        node.y = y;
      }
      x = x + 200;
      this.localStorageService.modifyNode(node);
    }
    for (var i in this.links) {
      var link = this.links[i];
      var index1 = this.indexOfNodeByName(link.fromNode);
      var index2 = this.indexOfNodeByName(link.toNode);
      var n1 = this.nodes[index1];
      var n2 = this.nodes[index2];
      link.modifyLinkFrom(n1);
      link.modifyLinkto(n2);
      this.localStorageService.modifyLink(link);
    }
  }

  resetPlacement() {
    this.localStorageService.storeActualPlacement(null);
    this.localStorageService.storePlacements([]);
  }

  new() {
    this.dialog.closeAll();
    this.hideCode();
    this.localStorageService.storeInfrastructureFile([]);
    for (var i=0; i<this.nodes.length; i++) {
      var node = this.nodes[i];
      for (var j=0; j<this.links.length; j++) {
        if (this.links[j].fromNode == node.name || this.links[j].toNode == node.name) {
          this.localStorageService.deleteLink(this.links[j]);
          this.links.splice(j, 1);
          j--;
        }
      }
      this.localStorageService.deleteNode(node);
      this.nodes.splice(i, 1);
      i--;
    }
    this.localStorageService.cleanInfrastructureFile();
    this.resetPlacement();
    this.nodes = [];
    this.links = [];
    this.nodeId = 0;
    this.linkId = 0;
    this.cancelTmpLink();
    this.dragging = false;
    this.clickToCreate = false;
    this.movedSquare = -1;
    this.isDrawingLine = false;
    this.svgPanZoom.enablePan();
    this.title = 'Untitled infrastructure';
    this.movementX = 0;
    this.movementY = 0;
    this.lastX = -1;
    this.lastY = -1;
    this.openNodeDialogs = [];
    this.openLinkDialogs = [];
    this.svgPanZoom.resetZoom();
    this.localStorageService.setInfrastructureTitle(this.title);
    this.onChangeTitleFromUpload.emit(this.title);
  }

  /*
  uploadInfrastructureProject(event) {
    this.hideCode();
    if (event.target.files && event.target.files.length) {
      var file = event.target.files[0];
      var tmpfile = file.name.split('.');
      if (tmpfile[1] == 'eu') this.retrieveInformationFromFile(file);
      else this.openErrorDialog('File extension not correct');
    }
  }
  */

  uploadInfrastructure(event) {
    if (event.target.files && event.target.files.length) {
      //Hide the code if it is visible
      this.hideCode();
      var file = event.target.files[0];
      var tmpfile = file.name.split('.');
      if (tmpfile[1] == 'eu') this.retrieveInformationFromFile(file);
      else if (tmpfile[1] == 'pl') this.retrieveInformationFromAllPrologFile(file);
    }
  }

  /*
  uploadInfrastructureNoProbs(event) {
    this.hideCode();
    if (event.target.files && event.target.files.length) {
      var file = event.target.files[0];
      var tmpfile = file.name.split('.');
      if (tmpfile[1] == 'pl') this.retrieveInformationFromPrologFileNoProbs(file);
      else this.openErrorDialog('File extension not correct');
    }
  }

  uploadInfrastructureComplete(event) {
    this.hideCode();
    if (event.target.files && event.target.files.length) {
      var file = event.target.files[0];
      var tmpfile = file.name.split('.');
      if (tmpfile[1] == 'pl') this.retrieveInformationFromPrologFileComplete(file);
      else this.openErrorDialog('File extension not correct');
    }
  }

  uploadInfrastructurePartial(event) {
    this.hideCode();
    if (event.target.files && event.target.files.length) {
      var file = event.target.files[0];
      var tmpfile = file.name.split('.');
      if (tmpfile[1] == 'pl') this.retrieveInformationFromPrologFileComplete(file);
      else this.openErrorDialog('File extension not correct');
    }
  }*/

  save() {
    var file = this.createInfrastructureFile();
    let blob = new Blob([file.join('\n')], {
      type: "plain/text"
    });
    var fname = this.createFileName();
    fname = fname + '.pl';
    FileSaver.saveAs(blob, fname);
  }

  saveJSON() {
    var JSONFile = [];
    var tmp = [];
    for (var i in this.nodes) {
      var nj = JSON.stringify(this.nodes[i], function replacer(key, value) {
        if (this && key === "svg")
          return undefined;
        return value;
      });
      tmp.push(nj);
      //JSONFile.push(tmp);
    }
    JSONFile.push(JSON.stringify(tmp));
    tmp = [];
    for (var i in this.links) {
      var lj = JSON.stringify(this.links[i], function replacer(key, value) {
        if (this && key === "svg")
          return undefined;
        return value;
      });
      tmp.push(lj);
      //JSONFile.push(tmp);
    }
    JSONFile.push(JSON.stringify(tmp));
    let blob = new Blob([JSONFile.join('\n')], {
      type: "plain/text"
    });
    var fname = this.createFileName();
    fname = fname + '.eu';
    FileSaver.saveAs(blob, fname);
  }

  createFileName(): string {
    var splitted = this.title.split(" ");
    var title = '';
    for (var i in splitted) {
      if (Number(i) == 0) title = splitted[i];
      else title = title + '_' + splitted[i];
    }
    return title.toLocaleLowerCase();
  }

  createInfrastructureFile() {
    var file = [];
    var j = 0;
    var tmp = '';
    var i = 0;

    for (i = 0; i < this.nodes.length; i++) {
      var node = this.nodes[i];
      if (node.probabilistic == true) {
        //Case node with probability
        for (var k in node.probs) {
          tmp = 'node(' + node.name + ', ' 
                 + node.probs[k].value.hwCaps + ', [' 
                 + node.createProbIoTCaps(node.probs[k]) 
                 + '], [' + node.createProbSecCaps(node.probs[k]) + '])';
          if (node.probs[k].prob < 0) {
            //Do nothing, probably return error if we are in complete case
          }
          else {
            var probd = node.probs[k].prob;
            tmp = probd + '::' + tmp;
            if (!file[j]) file[j] = tmp;
            else file[j] = file[j] + ';'+ tmp;
          }
        }
        file[j] = file[j] + '.';
        j++;
      }
      else {
        //Case node without probability
        tmp = 'node(' + node.name + ', ' + node.singleValue.hwCaps + ', [' + node.createIoTCaps() + '], [' + node.createSecCaps() + ']).' 
        file[j] = tmp;
        j++;
      }
    }
    for (var k in this.links) {
      var link = this.links[k];
      if (link.probabilistic == true) {
        for (var k in link.probs) {
          tmp = 'link(' + link.fromNode + ', ' + link.toNode + ', ' + link.probs[k].latvalue + ', ' + link.probs[k].bandvalue  + ')';
          if (link.probs[k].prob < 0) {
            //Do nothing
          }
          else {
            var probd = link.probs[k].prob;
            //probd = Math.round((probd + Number.EPSILON) * 1000) / 1000;
            tmp = probd + '::' + tmp;
            if (!file[j]) file[j] = tmp;
            else file[j] = file[j] + ';' + tmp;
          }
        }
        file[j] = file[j] + '.';
        j++;
      }
      else {
        tmp = 'link(' + link.fromNode + ', ' + link.toNode + ', ' + link.latency + ', ' + link.bandwidth  + ').';
        file[j] = tmp;
        j++;
      }
    }
    
    return file;
    /*
    if (this.probabilisticMode == 'static') {
      file[j] = '% Nodes';
      j++;
      //Create node(NodeId, HWCaps, IoTCaps, SecCaps).
      for (i = 0; i < this.nodes.length; i++) {
        var node = this.nodes[i];
        tmp = 'node(' + node.name + ', ' + node.singleValue.hwCaps + ', [' + node.createIoTCaps() + '], [' + node.createSecCaps() + ']).' 
        file[j] = tmp;
        j++;
      }
      file[j] = '% Links';
      j++;
      //Create link(NodeA, NodeB, Latency, Bandwidth).
      for (var k in this.links) {
        var link = this.links[k];
        tmp = 'link(' + link.fromNode + ', ' + link.toNode + ', ' + link.latency + ', ' + link.bandwidth  + ').';
        file[j] = tmp;
        j++;
      }
    }
    else if (this.probabilisticMode != 'static') {
      for (i = 0; i < this.nodes.length; i++) {
        var node = this.nodes[i];
        for (var k in node.probs) {
          tmp = 'node(' + node.name + ', ' 
                 + node.probs[k].value.hwCaps + ', [' 
                 + node.createProbIoTCaps(node.probs[k]) 
                 + '], [' + node.createProbSecCaps(node.probs[k]) + '])';
          if (node.probs[k].prob == 0) {
            //Do nothing, probably return error if we are in complete case
          }
          else {
            var probd = node.probs[k].prob;
            tmp = probd + '::' + tmp;
            if (!file[j]) file[j] = tmp;
            else file[j] = file[j] + ';'+ tmp;
          }
        }
        file[j] = file[j] + '.';
        j++;
      }
      for (var z in this.links) {
        var link = this.links[z];
        for (var k in link.probs) {
          tmp = 'link(' + link.fromNode + ', ' + link.toNode + ', ' + link.probs[k].latvalue + ', ' + link.probs[k].bandvalue  + ')';
          if (link.probs[k].prob == 0) {
            //Do nothing
          }
          else {
            var probd = link.probs[k].prob;
            //probd = Math.round((probd + Number.EPSILON) * 1000) / 1000;
            tmp = probd + '::' + tmp;
            if (!file[j]) file[j] = tmp;
            else file[j] = file[j] + ';' + tmp;
          }
        }
        file[j] = file[j] + '.';
        j++;
      }
    }*/
  }

//---------------------------------------------------------------------------------------------------------------------------------------
  /*--- MOUSE EVENTS HANDLING ---*/

  onMouseDown(event) {
    //if (event.button == 0) {
    if (event.target == document.getElementById('svgelem')) {
      var x = event.offsetX;
      var y = event.offsetY;
      this.lastX = (x - this.svgPanZoom.getPan().x) / this.svgPanZoom.getZoom();
      this.lastY = (y - this.svgPanZoom.getPan().y) / this.svgPanZoom.getZoom();
      this.dragging = true;
      if (event.button == 0) {
        this.clickToCreate = true;
      }
    }
    //}
  }

  onMouseWheel(event) {
    event.preventDefault();
  }

  onMouseMove(event) {
    //Get the coordinates in the svg
    var x = (event.offsetX - this.svgPanZoom.getPan().x) / this.svgPanZoom.getZoom();
    var y = (event.offsetY - this.svgPanZoom.getPan().y) / this.svgPanZoom.getZoom();
    //console.log(x,y);
    if (this.dragging) {
      var deltaX = Math.abs(x - this.lastX);
      var deltaY = Math.abs(y - this.lastY);
      this.movementX += deltaX;
      this.movementY += deltaY;
      this.redrawMenus();
    }
    else if (this.movedSquare >= 0) {
      document.getElementById('node'+this.nodes[this.movedSquare].id).style.cursor = 'move';
      var index = this.indexOfSquareById(this.movedSquare);
      this.nodes[index].x = x;
      //var y = (panZoomHeight - divY - (panZoomHeight-(viewboxHeight*realZoom)) + currentPan.y) / realZoom;    
      this.nodes[index].y = y;
      //Update the lines
      for (var i in this.links) {
        if (this.links[i].fromNode == this.nodes[index].name) {
          //this.links[i].x1 = this.nodes[index].x;
          //this.links[i].y1 = this.nodes[index].y;
          this.links[i].modifyLinkFrom(this.nodes[index]);
          this.localStorageService.modifyLink(this.links[i]);
        }
        if (this.links[i].toNode == this.nodes[index].name) {
          //this.links[i].x2 = this.nodes[index].x;
          //this.links[i].y2 = this.nodes[index].y;
          this.links[i].modifyLinkto(this.nodes[index]);
          this.localStorageService.modifyLink(this.links[i]);
        }
      }
    }
    else if (this.isDrawingLine == true) {
      //Set the coordinates of the temporary link
      if (x < this.tmpLink.x1) {
        this.tmpLink.x2 = x + 3;
      }
      else if (x > this.tmpLink.x1) {
        this.tmpLink.x2 = x - 3;
      }
      else {
        this.tmpLink.x2 = x;
      }
      if (y < this.tmpLink.y1) {
        this.tmpLink.y2 = y + 3;
      }
      else if (y > this.tmpLink.y1) {
        this.tmpLink.y2 = y - 3;
      }
      else {
        this.tmpLink.y2 = y;
      }
    }
  }
  
  onMouseUp(event) {
    event.preventDefault();
    var x = (event.offsetX - this.svgPanZoom.getPan().x) / this.svgPanZoom.getZoom();
    var y = (event.offsetY - this.svgPanZoom.getPan().y) / this.svgPanZoom.getZoom();
    if (event.button == 0) {
      if (this.movementX > 5 || this.movementY > 5) {
        //Case pan moving: do nothing
      }
      //Check where the click happen
      else if (event.target != document.getElementById("svgelem")) {
        if (event.target.id == 'tmp-link') {
          this.cancelTmpLink();
        }
        else if (event.target.class == "node") {
          //Case node
        }
        else if (event.target.class == 'link') {
          //Case link
        }
      }
      else {
        if (this.movedSquare >= 0) {
          document.getElementById('node'+this.nodes[this.movedSquare].id).style.cursor = 'move';
          var index = this.indexOfSquareById(this.movedSquare);
          this.nodes[index].x = x;
          //var y = (panZoomHeight - divY - (panZoomHeight-(viewboxHeight*realZoom)) + currentPan.y) / realZoom;    
          this.nodes[index].y = y;
          //Update the lines
          for (var i in this.links) {
            if (this.links[i].fromNode == this.nodes[index].name) {
              this.links[i].modifyLinkFrom(this.nodes[index]);
              this.localStorageService.modifyLink(this.links[i]);
              //this.links[i].x1 = this.nodes[index].x;
              //this.links[i].y1 = this.nodes[index].y;
            }
            if (this.links[i].toNode == this.nodes[index].name) {
              this.links[i].modifyLinkto(this.nodes[index]);
              this.localStorageService.modifyLink(this.links[i]);
              //this.links[i].x2 = this.nodes[index].x;
              //this.links[i].y2 = this.nodes[index].y;
            }
          }
        } 
        else if (this.isDrawingLine == true) {
          this.isDrawingLine = false;
          this.cancelTmpLink();
        }
        else if (this.clickToCreate == true) {
          var n = new Node(this);
          n.x = x;
          n.y = y;
          n.id = this.nodeId;
          n.name = 'Node name';
          if (this.tooCloseToAnotherNode(n) == false) {
            this.openNodeDialog(n);
          }
          else {
            this.openErrorDialog('Too close to another node!');
          }
        }
      }
      this.localStorageService.storeInfrastructureFile(this.createInfrastructureFile());
    }
    this.lastX = -1;
    this.lastY = -1;
    this.movementY = 0;
    this.movementX = 0;
    this.dragging = false;
    this.clickToCreate = false;
  }

  onMouseLeave() {
    //if (this.movedSquare >= 0) this.movedSquare = -1;
    if (this.isDrawingLine == true) {
      this.cancelTmpLink();
      this.isDrawingLine = false;
      this.svgPanZoom.enablePan();
    }
    if (this.dragging == true) {
      this.dragging = false;
      this.lastX = -1;
      this.lastY = -1;
      this.movementY = 0;
      this.movementX = 0;
    }
    this.clickToCreate = false;
  }

//---------------------------------------------------------------------------------------------------------------------------------------
  /*--- DATA STRUCTURES HANDLING ---*/

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
  
  cancelTmpLink() {
    this.isDrawingLine = false;
    this.svgPanZoom.enablePan();
    this.node1 = null;
    //document.getElementById('tmp-link').style.display = 'none';
    this.tmpLink.x1 = 0;
    this.tmpLink.y1 = 0;
    this.tmpLink.x2 = 0;
    this.tmpLink.y2 = 0;
  }

  indexOfSquareById(id: number) {
    for (var i in this.nodes) {
      if (this.nodes[i].id == id) return Number(i);    
    }
    return -1;
  }

  indexOfLink(id:number) {
    for (var i in this.links) {
      if (this.links[i].id == id) return Number(i);
    }
    return -1;
  }

  tooCloseToAnotherNode(node1: Node) {
    //Limit of this node
    var right = node1.x + node1.width/2;
    var left = node1.x - node1.width/2;
    var bottom = node1.y + node1.height/2;
    var top = node1.y - node1.height/2;
    //console.log(right, left, top, bottom); 
    for (var i in this.nodes) {
      if (this.nodes[i].id != node1.id) {
        //Limit of the node i
        var node = this.nodes[i];
        var rightLimit = node.x + node.width/2;
        var leftLimit = node.x - node.width/2;
        var bottomLimit = node.y + node.height/2;
        var topLimit = node.y - node.height/2;
        //console.log(rightLimit, leftLimit, topLimit, bottomLimit);
        /*
        if ((right > leftLimit && right < rightLimit) || (left < rightLimit && left > leftLimit)) {
          if ((top < bottomLimit && top > topLimit) || (bottom > topLimit && bottom < bottomLimit)) {
            return true;
          }
        }*/
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

  createLinkTo(node2: Node) {
    if (this.node1 != null) {
      //Create a link
      var l = new Link(this);
      var node1 = this.node1;
      //Distance on x and y
      var dx: number;
      var dy: number;
      dx = node2.x - node1.x;
      dy = node2.y - node1.y;
      //Distance between centers using pitagora
      var ln = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
      //Ratio for the radius
      var r1l = (node1.width/2) / ln;
      var r2l = (node2.width/2) / ln;
      //Coordinates for the line
      l.x1 = node1.x + (dx * r1l);
      l.x2 = node2.x - (dx * r2l);
      l.y1 = node1.y + (dy * r1l);
      l.y2 = node2.y - (dy * r2l);

      var x1 = node1.x;
      var x2 = node2.x;
      var y1 = node1.y;
      var y2 = node2.y;
      //Case node2 up
      if (y2 < y1 && Math.abs(x2 - x1) < node1.width) {
        x1 = x1 + 10;
        y1 = y1 - node1.height / 2;
        x2 = x2 + 10;
        y2 = y2 + node2.height / 2;
        l.vdirection = 'up';
        l.x1 -= 5;
        l.x2 -= 5;
      }
      //Case node2 down
      else if (y2 > y1 && Math.abs(x2 - x1) < node1.width) {
        x1 = x1 - 10;
        y1 = y1 + node1.height / 2;
        x2 = x2 - 10;
        y2 = y2 - node2.height / 2;
        l.vdirection = 'down';
        l.x1 += 5;
        l.x2 += 5;
      }
      //Case node2 right
      else if (x2 > x1) {
        x1 = x1 + node1.width / 2;
        y1 = y1 + 10;
        x2 = x2 - node2.width / 2;
        y2 = y2 + 10;
        l.hdirection = 'right';
        l.y1 -= 5;
        l.y2 -= 5;
      }
      //Case node2 left
      else if (x2 < x1) {
        x1 = x1 - node1.width / 2;
        y1 = y1 - 10;
        x2 = x2 + node2.width / 2;
        y2 = y2 - 10;
        l.hdirection = 'left';
        l.y1 += 5;
        l.y2 += 5;
      }
      l.fromNode = this.node1.name;
      l.toNode = node2.name;
      l.type = 'wired';
      l.id = this.linkId;
      //Check if the link is a duplicate
      var dup = false;
      for (var i in this.links) {
        var l2 = this.links[i];
        if ((l2.fromNode == l.fromNode && l2.toNode == l.toNode)) {
          dup = true;
          break;
        }
      }
      if (dup == true) {
        this.openErrorDialog('This link is a duplicate');
      }
      else {
        this.openLinkDialog(l);
      }
      this.node1 = null;
      this.tmpLink.x1 = 0;
      this.tmpLink.y1 = 0;
      this.tmpLink.x2 = 0;
      this.tmpLink.y2 = 0;
    }
  }

  deleteLink(link: Link) {
    for (var i=0; i<this.links.length; i++) {
      if (this.links[i].id == link.id) {
        this.localStorageService.deleteLink(link);
        this.links.splice(i, 1);
        i--;
        break;
      }
    }
    this.localStorageService.storeInfrastructureFile(this.createInfrastructureFile());
  }

  deleteNode(node: Node) {
    for (var i=0; i<this.nodes.length; i++) {
      if (this.nodes[i].id == node.id) {
        for (var j=0; j<this.links.length; j++) {
          if (this.links[j].fromNode == node.name || this.links[j].toNode == node.name) {
            this.localStorageService.deleteLink(this.links[j]);
            this.links.splice(j, 1);
            j--;
          }
        }
        this.localStorageService.deleteNode(node);
        this.nodes.splice(i, 1);
        i--;
        break;
      }
    }
    this.localStorageService.storeInfrastructureFile(this.createInfrastructureFile());
  }

//-------------------------------------------------------------------------------------------------------------------------------------

/*--- DIALOGS METHODS ---*/

  closeAllDialogs() {
    this.dialog.closeAll();
    this.openNodeDialogs = [];
    this.openLinkDialogs = [];
  }

  closeDialogLinkConnectedTo(node: Node) {
    for (var i in this.links) {
      if (this.links[i].fromNode == node.name || this.links[i].toNode == node.name) {
        for (var j in this.openLinkDialogs) {
          if (this.openLinkDialogs[j] == this.links[i].id) {
            this.dialog.getDialogById('link-menu'+this.openLinkDialogs[j]).close();
            this.openLinkDialogs.splice(Number(j), 1);
            break;
          }
        }
      }
    }
  }
  

  openNodeDialog(node: Node) {
    var prevName = node.name;
    const dialogRef = this.dialog.open(NodeDialogComponent, {
      //width: '30%',
      autoFocus: false,
      data: {
        name: node.name,
        singleValue: node.singleValue,
        id: node.id,
        imageUrl: node.imageUrl,
        probabilisticMode: node.probabilistic,
        probs: node.probs,
        nodes: this.nodes,
      }
    });

    dialogRef.componentInstance.deleteSquare.subscribe((squareId) => {
      this.deleteNode(node);
    });

    dialogRef.componentInstance.createSquare.subscribe(result => {
      node.id = result.id;
      node.name = result.name;
      node.singleValue = result.singleValue;
      node.imageUrl = result.imageUrl;
      node.probs = result.probs;
      node.probabilistic = result.probabilisticMode;
      this.nodes.push(node);
      this.localStorageService.storeNode(node);
      this.localStorageService.storeInfrastructureFile(this.createInfrastructureFile());
      this.nodeId++;
    });

  }

  openLinkDialog(link: Link) {
    const dialogRef = this.dialog.open(LinkDialogComponent, {
      autoFocus: false,
      //width: '30%',
      data: {
        probs: link.probs,
        bandwidth: link.bandwidth,
        latency: link.latency,
        probabilisticMode: link.probabilistic,
        from: link.fromNode,
        to: link.toNode,
        id: link.id,
        type: link.type,
      },
    });

    dialogRef.componentInstance.deleteLine.subscribe((data) => {
      //Delete the line
      this.deleteLink(link);
    });

    dialogRef.componentInstance.createLine.subscribe(result => {
      
      link.id = result.id;
      link.latency = result.latency;
      link.probs = result.probs;
      link.bandwidth = result.bandwidth;
      link.type = result.type;
      link.probabilistic = result.probabilisticMode;
      this.links.push(link);
      link.createPath();
      link.createTitle();
      this.localStorageService.storeLink(link);
      this.localStorageService.storeInfrastructureFile(this.createInfrastructureFile());
      this.linkId++;


    });
  }

  openNodeMenu(node: Node) {
    var prevName = node.name;
    var dialogRef;
    var corner = '';
    //Calculate the coordinate in the page
    var p = document.getElementById('svgelem').getBoundingClientRect();
    //(panZoomHeight - divY - (panZoomHeight-(viewboxHeight*realZoom)) + currentPan.y) / realZoom;    
    var pageX = (node.x + this.svgPanZoom.getPan().x) / this.svgPanZoom.getZoom() + p.left;
    var pageY = (node.y + this.svgPanZoom.getPan().y) / this.svgPanZoom.getZoom() + p.top;
    pageX = (node.x * this.svgPanZoom.getZoom() + this.svgPanZoom.getPan().x) + p.left;
    pageY = (node.y * this.svgPanZoom.getZoom() + this.svgPanZoom.getPan().y) + p.top;
    //pageX = this.svgPanZoom.getSizes().height - node.x - (this.svgPanZoom.getSizes().height - (p.height*this.svgPanZoom.getZoom()) + this.svgPanZoom.getPan().x) / this.svgPanZoom.getZoom();
    var hd = 300;
    var wd = 300;
    corner = 'topLeft';
    if (pageY+ hd > p.bottom) {
      pageY = pageY - hd;
      corner = 'bottomLeft';
    }
    if (pageX + wd > p.right) {
      pageX = pageX - wd;
      if (corner == 'bottomLeft') corner = 'bottomRight';
      else corner = 'topRight';
    }
    dialogRef = this.dialog.open(NodeMenuComponent, {
      width: '300px',
      height: '300px',
      position: {
        top: pageY+'px',
        left: pageX+'px'
      },
      disableClose: true,
      autoFocus: false,
      hasBackdrop: false,
      data: {
        name: node.name,
        singleValue: node.singleValue,
        id: node.id,
        imageUrl: node.imageUrl,
        probabilisticMode: node.probabilistic,
        probs: node.probs,
        nodes: this.nodes,
      },
      id: 'node-menu' + node.id
    });

    //Set the style for this dialog
    var d = document.getElementsByClassName('mat-dialog-container') as HTMLCollectionOf<HTMLElement>;
    var c = document.getElementsByClassName('mat-dialog-content') as HTMLCollectionOf<HTMLElement>;
    var t = document.getElementsByClassName('mat-dialog-title') as HTMLCollectionOf<HTMLElement>;
    var a = document.getElementsByClassName('mat-dialog-actions') as HTMLCollectionOf<HTMLElement>;
    var cpc = document.getElementsByClassName('mat-expansion-panel-content') as HTMLCollectionOf<HTMLElement>;
    d[d.length-1].id = 'function-menu' + node.id;
    d[d.length-1].style.padding = '5px';
    d[d.length-1].style.borderRadius = '15px';
    d[d.length-1].style.border = 'solid 1px';
    d[d.length-1].style.borderColor = 'rgb(33, 117, 173)';
    if (corner == 'topLeft') d[d.length-1].style.borderTopLeftRadius = '0px';
    else if (corner == 'bottomLeft') d[d.length-1].style.borderBottomLeftRadius = '0px';
    else if (corner == 'bottomRight') d[d.length-1].style.borderBottomRightRadius = '0px';
    else if (corner == 'topRight') d[d.length-1].style.borderTopRightRadius = '0px';
    c[c.length-1].style.padding = '0px';
    c[c.length-1].style.margin = '0px';
    c[c.length-1].style.maxHeight= 'none';
    c[c.length-1].style.fontSize = '60%';
    a[a.length-1].style.minHeight = '0';
    cpc[cpc.length-1].style.fontSize = '90%';

    dialogRef.componentInstance.deleteSquare.subscribe((squareId) => {
      this.deleteNode(node);
      this.removeNodeDialog(node.id);
    });

    dialogRef.componentInstance.closeClick.subscribe(() => {
      this.removeNodeDialog(node.id);
    });

    dialogRef.componentInstance.moveSquare.subscribe((n) => {
      //Get the node interested
      this.closeDialogLinkConnectedTo(node);
      this.movedSquare = node.id;
      this.isDrawingLine = false;
      this.svgPanZoom.enablePan();
      this.removeNodeDialog(node.id);
    });

    dialogRef.componentInstance.createSquare.subscribe(result => {
      node.id = result.id;
      node.name = result.name;
      node.singleValue = result.singleValue;
      node.probs = result.probs;        
      node.imageUrl = result.imageUrl; 
      node.probs = result.probs;
      node.probabilistic = result.probabilisticMode;
      if (node.probabilistic == false) {
        //Clear the probs array
        node.probs = [];
        //Add a single 100% prob to the array
        var prob: NodeProb = {
          prob: 100,
          value: result.singleValue,
        }
        node.probs.push(prob);
      }
      else {
        var maxIndex = 0;
        var maxProb = 0;
        //Search the index of the max probability element
        for (var i in result.probs) {
          if (result.probs[i].prob > maxProb) {
            maxProb = result.probs[i].prob;
            maxIndex = Number(i);
          }
        }
        //Assign the max probability value to the single element
        node.singleValue = node.probs[maxIndex].value;
      }
      if (node.name != prevName) {
        //Update the links interested
        for (var i in this.links) {
          if (this.links[i].fromNode == prevName) {
            var l = this.links[i];
            l.fromNode = node.name;
            this.localStorageService.modifyLink(l);
          }
          if (this.links[i].toNode == prevName) {
            var l = this.links[i];
            l.toNode = node.name;
            this.localStorageService.modifyLink(l);
          }
        }
      }
      this.localStorageService.modifyNode(node);
      this.localStorageService.storeInfrastructureFile(this.createInfrastructureFile());
      this.removeNodeDialog(node.id);
    });
  }

  openLinkMenu(link: Link) {
    var dialogRef;
    var corner = '';
    //Calculate the coordinate in the page
    var p = document.getElementById('svgelem').getBoundingClientRect();
    var l: SVGPathElement;
    l = <SVGPathElement><any>document.getElementById('link' + link.id);
    // Get the length of the path
    var pathLen = l.getTotalLength();
    // How far along the path to we want the position?
    var pathDistance = pathLen * 0.5;
    var middle = l.getPointAtLength(pathDistance);
    var x = middle.x;
    var y = middle.y;
    //var x = (link.x1 + link.x2)/2;
    //var y = (link.y1 + link.y2)/2;
    var pageX = (x + this.svgPanZoom.getPan().x) / this.svgPanZoom.getZoom() + p.left;
    var pageY = (y + this.svgPanZoom.getPan().y) / this.svgPanZoom.getZoom() + p.top;
    pageX = (x * this.svgPanZoom.getZoom() + this.svgPanZoom.getPan().x) + p.left;
    pageY = (y * this.svgPanZoom.getZoom() + this.svgPanZoom.getPan().y) + p.top;
    var hd = 230;
    var wd = 250;
    corner = 'topLeft';
    if (pageY + hd > p.bottom) {
      pageY = pageY - hd;
      corner = 'bottomLeft';
    }
    if (pageX + wd > p.right) {
      pageX = pageX - wd;
      if (corner == 'bottomLeft') corner = 'bottomRight';
      else corner = 'topRight';
    }

    dialogRef = this.dialog.open(LinkMenuComponent, {
      width: '250px',
      height: '230px',
      position: {
        top: pageY+'px',
        left: pageX+'px'
      },
      hasBackdrop: false,
      disableClose: true,
      autoFocus: false,
      data: {
        bandwidth: link.bandwidth,
        latency: link.latency,
        probs: link.probs,
        probabilisticMode: link.probabilistic,
        from: link.fromNode,
        to: link.toNode,
        type: link.type,
        id: link.id,
      },
      id: 'link-menu' + link.id
    });

    //Set the style for this dialog
    //Set the behaviour of the background of the dialog
    //var b = document.getElementsByClassName('cdk-overlay-dark-backdrop') as HTMLCollectionOf<HTMLElement>;
    //b[b.length-1].style.opacity = '0';
    //Set the behaviour of the dialog
    var d = document.getElementsByClassName('mat-dialog-container') as HTMLCollectionOf<HTMLElement>;
    var c = document.getElementsByClassName('mat-dialog-content') as HTMLCollectionOf<HTMLElement>;
    var a = document.getElementsByClassName('mat-dialog-actions') as HTMLCollectionOf<HTMLElement>;
    //var cpc = document.getElementsByClassName('mat-expansion-panel-content') as HTMLCollectionOf<HTMLElement>;
    //b[b.length-1].style.pointerEvents ='none';
    d[d.length-1].id = 'flow-menu' + link.id;
    d[d.length-1].style.padding = '5px';
    d[d.length-1].style.borderRadius = '15px';
    d[d.length-1].style.border = 'solid 1px';
    d[d.length-1].style.borderColor = 'rgb(33, 117, 173)';
    //d[d.length-1].style.overflow = 'hidden';      
    if (corner == 'topLeft') d[d.length-1].style.borderTopLeftRadius = '0px';
    else if (corner == 'bottomLeft') d[d.length-1].style.borderBottomLeftRadius = '0px';
    else if (corner == 'bottomRight') d[d.length-1].style.borderBottomRightRadius = '0px';
    else if (corner == 'topRight') d[d.length-1].style.borderTopRightRadius = '0px';
    c[c.length-1].style.padding = '0px';
    c[c.length-1].style.margin = '0px';
    c[c.length-1].style.maxHeight= 'none';
    c[c.length-1].style.fontSize = '60%';
    a[a.length-1].style.minHeight = '0';

    dialogRef.componentInstance.deleteLine.subscribe((data) => {
      //Delete the line
      this.deleteLink(link);
      this.removeLinkDialog(link.id);
    });

    dialogRef.componentInstance.createLine.subscribe(result => {
      //Modify the line
      link.type = result.type;
      link.probabilistic = result.probabilisticMode;
      if (link.probabilistic == false) {
        link.bandwidth = result.bandwidth;
        link.latency = result.latency;
        var prob: LinkProb = {
          prob: 100,
          bandvalue: result.bandwidth,
          latvalue: result.latency,
        }
        link.probs.push(prob);
      }
      else {
        link.probs = result.probs;
        var maxIndex = 0;
        var maxProb = 0;
        for (var i in result.probs) {
          if (result.probs[i].prob > maxProb) {
            maxProb = result.probs[i].prob;
            maxIndex = Number(i);
          }
        }
        link.bandwidth = result.probs[i].bandvalue;
        link.latency = result.probs[i].latvalue;
      }
      link.createTitle();
      this.localStorageService.modifyLink(link);
      this.localStorageService.storeInfrastructureFile(this.createInfrastructureFile());
      this.removeLinkDialog(link.id);
    });

    dialogRef.componentInstance.closeClick.subscribe(() => {
      this.removeLinkDialog(link.id);
    })

  }

  openConfirmationDialog(text: string, type: string) {
    const dialogRef = this.dialog.open(ConfirmationRequestComponent, {
      autoFocus: false,
      data: {
        text: text,
        type: type,
      }
    });

    this.hideCode();

    dialogRef.componentInstance.positiveClick.subscribe(() => {
      if (type == 'reset') {
        this.new();
      }
      //Pass to no-probs mode
      /*else if (type == 'no-probs') {
        //Close all opened dialogs
        this.dialog.closeAll();
        this.openLinkDialogs = [];
        this.openNodeDialogs = [];
        if (this.probabilisticMode != 'static') {
          this.probabilisticMode = 'static';
          this.localStorageService.setProbabilisticMode(this.probabilisticMode);
          //Update the probability values of all nodes
          for (var i in this.nodes) {
            var node = this.nodes[i];
            var maxProbIndex = 0;
            var maxProbValue = 0;
            //Search the max probability
            for (var j=0; j<node.probs.length; j++) {
              if (node.probs[j].prob > maxProbValue) {
                maxProbIndex = j;
                maxProbValue = node.probs[j].prob;
              }
            }
            node.singleValue = node.probs[maxProbIndex].value;
            this.localStorageService.modifyNode(node);
          }
          for (var i in this.links) {
            var link = this.links[i];
            var maxProbIndex = 0;
            var maxProbValue = 0;
            //Search the max probability
            for (var j=0; j<link.probs.length; j++) {
              if (link.probs[j].prob > maxProbValue) {
                maxProbIndex = j;
                maxProbValue = link.probs[j].prob;
              }
            }
            link.bandwidth = link.probs[maxProbIndex].bandvalue;
            link.latency = link.probs[maxProbIndex].latvalue;
            this.localStorageService.modifyLink(link);
          }
        }
      }
      //Pass to complete or partial mode
      else if (type == 'complete') {
        this.dialog.closeAll();
        this.openLinkDialogs = [];
        this.openNodeDialogs = [];
        if (this.probabilisticMode == 'static') {
          this.probabilisticMode = type;
          this.localStorageService.setProbabilisticMode(this.probabilisticMode);
          //TODO: non fare nulla se il nodo contiene già dei valori di probabilità
          for (var i in this.nodes) {
            var node = this.nodes[i];
            console.log(node.name + ': ' + node.probs.length);
            if (node.probs.length == 0) {
              var nodeProb: NodeProb = {
                value: node.singleValue,
                prob: 1,
              }
              node.probs.push(nodeProb);
              this.localStorageService.modifyNode(node);
            }
            console.log(node.probs);
          }
          for (var i in this.links) {
            var link = this.links[i];
            if (link.probs.length == 0) {
              var prob: LinkProb = {
                bandvalue: link.bandwidth,
                latvalue: link.latency,
                prob: 1,
              }
              link.probs.push(prob);
              this.localStorageService.modifyLink(link);
            }
          }
        }
        else if (this.probabilisticMode == 'partial') {
          this.probabilisticMode = 'complete';
          this.localStorageService.setProbabilisticMode(this.probabilisticMode);
          //TODO: aggiungere la differenza settata con tutti 1
        }
      }
      else if (type == 'partial') {
        if (this.probabilisticMode == 'static') {
          this.probabilisticMode = 'partial';
          this.localStorageService.setProbabilisticMode(this.probabilisticMode);
          //TODO creare una probabilità, probabilmente con 100%
        }
        else if (this.probabilisticMode == 'complete') {
          this.probabilisticMode = 'partial';
          this.localStorageService.setProbabilisticMode(this.probabilisticMode);
          //TODO mantenere solo la probabilità maggiore oppure lasciare uguale
        }
      }*/
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

  redrawMenus() {
    var index;
    var pageX: number;
    var pageY: number;
    var corner = '';
    for (var i=0; i<this.openNodeDialogs.length; i++) {
      var dialogRef = this.dialog.getDialogById('node-menu' + this.openNodeDialogs[i]);
      index = this.indexOfSquareById(this.openNodeDialogs[i]);
      if (index != -1) {
        var node = this.nodes[index];
        //Calculate the coordinate in the page
        var p = document.getElementById('svgelem').getBoundingClientRect();
        pageX = (node.x * this.svgPanZoom.getZoom() + this.svgPanZoom.getPan().x) + p.left;
        pageY = (node.y * this.svgPanZoom.getZoom() + this.svgPanZoom.getPan().y) + p.top;
        var h = 300;
        var w = 300;
        corner = 'topLeft';
        if (pageY + h > p.bottom) {
          pageY = pageY - h;
          corner = 'bottomLeft';
        }
        if (pageX + w > p.right) {
          pageX = pageX - w;
          if (corner == 'bottomLeft') corner = 'bottomRight';
          else corner = 'topRight';
        }
        var d = document.getElementById('node-menu' + node.id);
        d.style.borderRadius = '15px';
        if (corner == 'topLeft') d.style.borderTopLeftRadius = '0px';
        else if (corner == 'bottomLeft') d.style.borderBottomLeftRadius = '0px';
        else if (corner == 'bottomRight') d.style.borderBottomRightRadius = '0px';
        else if (corner == 'topRight') d.style.borderTopRightRadius = '0px';
        if (pageX < p.left || pageX + w > p.right || pageY < p.top || pageY + h > p.bottom) {
          d.style.display = 'none';
        }
        else {
          d.style.display = 'block';
        }
        const matDialogConfig = new MatDialogConfig();
        matDialogConfig.position = {
          top: pageY+'px',
          left: pageX+'px'
        }
        dialogRef.updatePosition(matDialogConfig.position);
      }
    }
    for (var i=0; i<this.openLinkDialogs.length; i++) {
      var dialogRef = this.dialog.getDialogById('link-menu' + this.openLinkDialogs[i]);
      index = this.indexOfLink(this.openLinkDialogs[i]);
      var link = this.links[index];
      //Calculate the coordinate in the page
      var p = document.getElementById('svgelem').getBoundingClientRect();
      var l: SVGPathElement;
      l = <SVGPathElement><any>document.getElementById('link' + link.id);
      // Get the length of the path
      var pathLen = l.getTotalLength();
      // How far along the path to we want the position?
      var pathDistance = pathLen * 0.5;
      var middle = l.getPointAtLength(pathDistance);
      var x = middle.x;
      var y = middle.y;
      //var x = (link.x1 + link.x2)/2;
      //var y = (link.y1 + link.y2)/2;
      //var pageX = (x + this.svgPanZoom.getPan().x) / this.svgPanZoom.getZoom() + p.left;
      //var pageY = (y + this.svgPanZoom.getPan().y) / this.svgPanZoom.getZoom() + p.top;
      pageX = (x * this.svgPanZoom.getZoom() + this.svgPanZoom.getPan().x) + p.left;
      pageY = (y * this.svgPanZoom.getZoom() + this.svgPanZoom.getPan().y) + p.top;
      var h = 230;
      var w = 250;
      var corner = 'topLeft';
      if (pageY + h > p.bottom) {
        pageY = pageY - h;
        corner = 'bottomLeft';
      }
      if (pageX + w > p.right) {
        pageX = pageX - w;
        if (corner == 'bottomLeft') corner = 'bottomRight';
        else corner = 'topRight';
      }
      var d = document.getElementById('link-menu' + link.id);
      d.style.borderRadius = '15px';
      if (corner == 'topLeft') d.style.borderTopLeftRadius = '0px';
      else if (corner == 'bottomLeft') d.style.borderBottomLeftRadius = '0px';
      else if (corner == 'bottomRight') d.style.borderBottomRightRadius = '0px';
      else if (corner == 'topRight') d.style.borderTopRightRadius = '0px';
      
      if (pageX < p.left || pageX + w > p.right || pageY < p.top || pageY + h > p.bottom) {
        d.style.display = 'none';
      }
      else {
        d.style.display = 'block';
      }
      const matDialogConfig = new MatDialogConfig();
      matDialogConfig.position = {
        top: pageY+'px',
        left: pageX+'px'
      }
      dialogRef.updatePosition(matDialogConfig.position);
    }
  }

}
