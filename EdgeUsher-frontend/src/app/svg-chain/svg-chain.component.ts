import { Component, OnInit, ElementRef, EventEmitter, Output, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Service } from './service';
import { Flow } from './flow';
import { FlowDialogComponent} from '../flow-dialog/flow-dialog.component';
import { LocalStorageService } from '../local-storage-service';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import * as FileSaver from 'file-saver';
import * as SvgPanZoom from 'svg-pan-zoom';
import { ConfirmationRequestComponent } from '../confirmation-request/confirmation-request.component';
import { FunctionMenuComponent } from '../function-menu/function-menu.component';
import { FlowMenuComponent } from '../flow-menu/flow-menu.component';
import { ServiceDialogComponent, Rule } from '../function-dialog/function-dialog.component';
import { Subchain } from './subchain';
import { ChainDialogComponent } from '../chain-dialog/chain-dialog.component';
import { SubchainMenuComponent } from '../subchain-menu/subchain-menu.component';
import { ChainErrorCheckingService } from '../chain-error-checking.service';

@Component({
  selector: 'app-svg-chain',
  templateUrl: './svg-chain.component.html',
  styleUrls: ['./svg-chain.component.css']
})

export class SvgChainComponent implements OnInit, AfterViewInit {

  @ViewChild('svgchainelem', { static: true }) svg: ElementRef<SVGSVGElement>;
  @Output() onChangeTitleFromUpload = new EventEmitter<string>();
  //Variables for services, flows and max latency constraints
  services = Array<Service>();
  flows = Array<Flow>();
  subchains = Array<Subchain>();
  //Ids
  serviceId = 0;
  flowId = 0;
  subchainId = 0;
  //Temporary flow for flow creation
  tmpFlow = new Flow(this);
  //Service when moving
  movedService = -1;
  //First service for flow creation
  service1: Service;
  //State drawing a line
  isDrawingLine = false;
  //State creation of service
  clickToCreate = false;
  //State moving service
  isMovingService = false;
  //State max latency constraint creation
  isChainMode: number = -1;
  //Name of the chain, chainId
  title = 'Untitled chain';
  //Instance of svg for zoom and panning
  svgPanZoom: SvgPanZoom.Instance;
  //Variables for control of dragging
  movementX = 0;
  movementY = 0;
  lastX = -1;
  lastY = -1;
  //State dragging for mouse events
  dragging = false;
  //Mouse leaved recently
  leaved = -1;
  //Dialogs open
  openServiceDialogs = Array<number>();
  openFlowDialogs = Array<number>();
  openSubchainDialogs = Array<number>();
  //Temporary subchain during the creation
  tmpSubchain: Subchain;

  constructor(public dialog: MatDialog, 
    public localStorageService: LocalStorageService,
    public errorService: ChainErrorCheckingService) {}

  ngOnInit(): void {
    //Don't display the temporary flow
    document.getElementById('tmp-flow').style.display = 'none';
    //Get the information from local storage
    this.retrieveInformation();
  }

  ngAfterViewInit(): void {
    //Initialization of svg-pan-zoom
    this.svgPanZoom = SvgPanZoom('#svgchainelem',  {
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
    this.redrawMenus();
  }

  //Hide the code and show the svg
  hideCode() {
    document.getElementById("svg").style.display = 'block';
    document.getElementById("code").style.display = 'none';
    document.getElementById("split-screen").style.display = "none";
    var elem = <any>document.getElementById("left-radio-button") as HTMLInputElement;
    elem.checked = false;
    elem = <any>document.getElementById("right-radio-button");
    elem.checked = true;
  }

  //------------------------------------------------------------------------------------------------------------------------------------
  /*--- DATA METHODS ---*/

  retrieveInformation(): void {
    //Get the chain name
    var t = this.localStorageService.getChainTitle();
    //Update the chain name if it exists
    if (t) {
      this.title = t;
    }
    this.onChangeTitleFromUpload.emit(this.title);
    var ss = this.localStorageService.getServices() as Array<Service>;
    //Get services, flows and subchains information
    for (var i in ss) {
      var s = new Service(this);
      s.x = ss[i].x;
      s.y = ss[i].y;
      s.r = ss[i].r;
      s.id = ss[i].id;
      s.iotReqs = ss[i].iotReqs;
      s.name = ss[i].name;
      s.securityRequirements = ss[i].securityRequirements;
      s.serviceTime = ss[i].serviceTime;
      s.hwReqs = ss[i].hwReqs;
      s.connectedServices = ss[i].connectedServices;
      s.cond = ss[i].cond;
      this.services.push(s);
      this.serviceId = s.id + 1;
    }
    var fs = this.localStorageService.getFlows();
    for (var i in fs) {
      var f = new Flow(this);
      f.fromService = fs[i].fromService;
      f.toService = fs[i].toService;
      f.coord1 = fs[i].coord1;
      f.coord2 = fs[i].coord2;
      f.coordBox = fs[i].coordBox;
      f.bandwidth = fs[i].bandwidth;
      f.id = fs[i].id;
      this.flows.push(f);
      this.flowId = f.id + 1;
    }
    var subs = this.localStorageService.getSubchains();
    for (var i in subs) {
      var sub = new Subchain(this);
      sub.maxLatency = subs[i].maxLatency;
      sub.id = subs[i].id;
      sub.services = subs[i].services;
      sub.path = subs[i].path;
      sub.textpath = subs[i].textpath;
      this.subchains.push(sub);
      this.subchainId = sub.id + 1;
    }
    this.localStorageService.storeChainFile(this.createChainFile());
  }

  //Get the information from file of extension .eu (JSON)
  retrieveInformationFromFile(file: File): void {
    this.new();
    this.title = file.name.split('.')[0];
    this.onChangeTitleFromUpload.emit(this.title);
    this.localStorageService.setChainTitle(this.title);
    let fileReader = new FileReader();
    fileReader.onloadend = (e) => {
      var lines = (fileReader.result as string).split('\n');
      for (var line=0; line<lines.length; line++) {
        if (line == 0) {
          var ss = JSON.parse(lines[line]);
          for (var i in ss) {
            var sj = JSON.parse(ss[i]);
            var s = new Service(this);
            s.x = sj.x;
            s.y = sj.y;
            s.r = sj.r;
            s.id = sj.id;
            s.iotReqs = sj.iotReqs;
            s.name = sj.name;
            s.securityRequirements = sj.securityRequirements;
            s.serviceTime = sj.serviceTime;
            s.hwReqs = sj.hwReqs;
            s.connectedServices = sj.connectedServices;
            s.cond = sj.cond;
            this.services.push(s);
            this.localStorageService.storeService(s);
            this.serviceId = s.id + 1;
          }
        }
        else if (line == 1) {
          var fs = JSON.parse(lines[line]);
          for (var i in fs) {
            var fj = JSON.parse(fs[i]);
            var f = new Flow(this);
            f.fromService = fj.fromService;
            f.toService = fj.toService;
            f.coord1 = fj.coord1;
            f.coord2 = fj.coord2;
            f.coordBox = fj.coordBox;
            f.bandwidth = fj.bandwidth;
            f.id = fj.id;
            this.flows.push(f);
            this.localStorageService.storeFlow(f);
            this.flowId = f.id + 1;
          }
        }
        else if (line == 2) {
          var subs = JSON.parse(lines[line]);
          for (var i in subs) {
            var subj = JSON.parse(subs[i]);
            var sub = new Subchain(this);
            sub.services = subj.services;
            sub.id = subj.id;
            sub.maxLatency = subj.maxLatency;
            //sub.flows = subj.flows;
            sub.path = subj.path;
            sub.textpath = subj.textpath;
            this.subchains.push(sub);
            this.localStorageService.storeSubchain(sub);
            this.subchainId = sub.id + 1;
          }
        }
      }
      this.localStorageService.storeChainFile(this.createChainFile());
    }
    fileReader.readAsText(file);
  }

  //Get the information from a problog file
  retrieveInformationFromPrologFile(file: File) {
    //Reset the chain
    this.new();
    //Variable for errors
    var cntChain = 0;
    //Variable that indicate the number of lines that contains errors
    var lineerrs = Array<number>();
    let fileReader = new FileReader();
    //Parse file by lines
    fileReader.onloadend = (e) => {

      var lines = (fileReader.result as string).split('\n');
      for (var line=0; line<lines.length; line++) {
        var l = lines[line];
        var tmp = l.trim().split('(');

        //Case line starts with chain, only one can start with chain
        if (tmp[0].trim() == 'chain' && cntChain == 0) {
          cntChain++;
          //Get the chain title
          var t = tmp[1].trim().split(',')[0];
          //Check if the title is valid
          if (t != '' && this.errorService.checkSpecialCharacters(t) == 1) {
            this.title = t;
            this.onChangeTitleFromUpload.emit(this.title);
            this.localStorageService.setChainTitle(this.title);
          } 
          else {
            if (lineerrs.indexOf(line) < 0) lineerrs.push(line);
          }
        }

        //Case line starts with service
        else if (tmp[0].trim() == 'service') {

          //Get the parameters
          var str = tmp[1].trim().split(')')[0].trim();
          //Get array of parameters
          var params = str.split(',');
          //Create new service and assign an id
          var service = new Service(this);
          service.id = this.serviceId;

          //Get the service name
          var name = params[0].trim();
          if (name != '' && name.indexOf(' ') < 0 && this.errorService.checkSpecialCharacters(name) == 1) {
            service.name = name;
          }
          else {
            //Case no name for service or invalid name
            if (lineerrs.indexOf(line) < 0) lineerrs.push(line);
          }

          //Get the service time
          var stime = Number(params[1].trim());
          if (isNaN(stime) == false && stime > 0) {
            service.serviceTime = stime;
          }
          else {
            //Case no service time specified or wrong value for it
            if (lineerrs.indexOf(line) < 0) lineerrs.push(line);
          }

          //Get the hardware requirements
          var hwr = Number (params[2].trim());
          if (isNaN(hwr) == false && hwr > 0) {
            service.hwReqs = hwr;
          }
          else {
            //Case no hw requirements or wrong value for it
            if (lineerrs.indexOf(line) < 0) lineerrs.push(line);
          }

          //Create the iot devices connected
          var iot = Array<string>();
          //First iot device
          var firstiot = params[3].trim().split('[')[1].trim();
          var i = 3;
          if (firstiot == ']') {
            //Case no devices connected
            iot.push('');
          }
          else if (firstiot.indexOf(']') >= 0) {
            //Case only one device connected
            var firstiot2 = firstiot.split(']')[0].trim();
            if (firstiot2 != '' && firstiot2.indexOf(' ') < 0 && this.errorService.checkSpecialCharacters(firstiot2) == 1) {
              iot.push(firstiot2);
            }
            else {
              //Case device contains spaces or is empty
              console.log('Case device contains spaces or is empty');
              if (lineerrs.indexOf(line) < 0) lineerrs.push(line);
            }
          }
          else {
            //Add the first device if it not contains space inside or is not empty
            if (firstiot != '' && firstiot.indexOf(' ') < 0 && this.errorService.checkSpecialCharacters(firstiot) == 1) {
              iot.push(firstiot);
            }
            else {
              //Case device contains spaces or is empty
              console.log('Case device contains spaces or is empty');
              if (lineerrs.indexOf(line) < 0) lineerrs.push(line);
            }
            //We are at fifth element of params
            i = 4;
            var stop = false;
            while (!stop) {
              if (params[i].indexOf(']') >= 0) {
                //Case this is the last device connected
                var pi = params[i].trim().split(']')[0].trim();
                if (pi != '' && pi.indexOf(' ') < 0) iot.push(pi);
                stop = true;
              }
              //Case this is not the last
              else if (params[i].trim() != '' && params[i].trim().indexOf(' ') < 0 && this.errorService.checkSpecialCharacters(params[i].trim()) == 1) {
                iot.push(params[i].trim());
              }
              i++;
            }
          }
          //Add a generic image for every iot device connected
          for (var k in iot) {
            if (iot[k] != '') {
              service.iotReqs.push({
                //Device name to lower case 
                device: iot[k].toLowerCase(),
                imgUrl: '../../icons/devices/generic.png',
                x: 0,
                y: 0
              });
            }
          }
          //Case iot string: service.iotReqs = iot;

          //If i == 3 i is not updated by searching iot devices and update to 4 now
          if (i == 3) i = 4;

          //Create security requisites
          var sec = Array<Rule>();
          //List security requisites case
          if (params[i].indexOf('[') >= 0) {
            //First security requisite
            var firstsec = params[i].trim().split('[')[1].trim();
            if (firstsec == ']') {
              //Case last security requisite, empty
              var firstRule: Rule = {
                cond: 'single',
                singleReq: '',
                nestedRules: [],
              };
              sec.push(firstRule);
            }
            else if (firstsec.indexOf(']') >= 0) {
              var secr = firstsec.split(']')[0].trim();
              //Case only one security requisite
              if (secr.indexOf(' ') < 0 && this.errorService.checkSpecialCharacters(secr) == 1) {
                var firstRule: Rule = {
                  cond: 'single',
                  singleReq: secr,
                  nestedRules: [],
                };
                sec.push(firstRule);
              }
              else {
                //Case spaces in the security requisite
                if (lineerrs.indexOf(line) < 0) lineerrs.push(line);
              }
            }
            else {
              //Case more than one security requisite
              var firstRule: Rule = {
                cond: 'single',
                singleReq: firstsec,
                nestedRules: [],
              };
              sec.push(firstRule);
              //Update i;
              i++;
              var stop = false;
              while (!stop) {
                if (params[i].indexOf(']') >= 0) {
                  var secr = params[i].trim().split(']')[0].trim();
                  //Case final requisite
                  if (secr.indexOf(' ') < 0 && this.errorService.checkSpecialCharacters(secr) == 1) {
                    var rule = {
                      cond: 'single',
                      singleReq: secr,
                      nestedRules: [],
                    }
                    sec.push(rule);
                  }
                  else {
                    //Case contains spaces inside
                    if (lineerrs.indexOf(line) < 0) lineerrs.push(line);
                  }
                  stop = true;
                }
                else { 
                  var secr = params[i].trim();
                  if (secr.indexOf(' ') < 0 && this.errorService.checkSpecialCharacters(secr) == 1)  {
                    var rule = {
                      cond: 'single',
                      singleReq: secr,
                      nestedRules: [],
                    }
                    sec.push(rule);
                  }
                  else {
                    //Case contains spaces inside
                  }
                }
                i++;
              }
            }
          }
          //Case security as and/or composition
          else {
            sec = this.retrieveSecReqsComposition(lines[line], service);
          }
          service.securityRequirements = sec;

          this.services.push(service);
          this.localStorageService.storeService(service);
          this.serviceId++;

        }

        else if (tmp[0] == 'flow') {

          var str = tmp[1].trim().split(')')[0].trim();
          //Create a new flow and assign an id
          var flow = new Flow(this);
          flow.id = this.flowId;
          //Get the parameters
          var params = str.split(',');

          //Get the first service name
          var servicename = params[0].trim();
          if (servicename != '' && servicename.indexOf(' ') < 0 && this.indexOfServiceByName(servicename) != -1) {
            flow.fromService = servicename.toLowerCase();
          }
          else {
            //Case service name contains wrong characters
            if (lineerrs.indexOf(line) < 0) lineerrs.push(line);
          }

          //Get the second service name
          servicename = params[1].trim();
          if (servicename != '' && servicename.indexOf(' ') < 0 && this.indexOfServiceByName(servicename) != -1) {
            flow.toService = servicename.toLowerCase();
          }
          else {
            //Case service name contains wrong characters
            if (lineerrs.indexOf(line) < 0) lineerrs.push(line);
          }
          
          //Get the bandwidth
          var bandwidth = Number(params[2].trim());
          if (isNaN(bandwidth) == false && bandwidth > 0) {
            flow.bandwidth = bandwidth;
          }
          else {
            //Case wrong bandwidth value
            if (lineerrs.indexOf(line) < 0) lineerrs.push(line);
          }

          this.flows.push(flow);
          this.localStorageService.storeFlow(flow);
          this.flowId++;

        }
        else if (tmp[0] == 'maxLatency') {

          //TODO: salvare la stringa e poi creare la subchain alla fine, quando si è sicuri di aver tutti gli altri dati

          //Get the parameters
          var str = tmp[1].trim().split(')')[0].trim();
          var params = str.split(',');
          var subchain = new Subchain(this);
          subchain.id = this.subchainId;
          var services = Array<Service>();
          var firstservice = params[0].trim().split('[')[1];
          var index = this.indexOfServiceByName(firstservice);
          if (index == -1) {
            console.log(line);
            if (lineerrs.indexOf(line) < 0) lineerrs.push(line);
          }
          else {
            //Empty subchain
            if (firstservice == ']') {
              //Error
            }
            //Subchain with only one service
            else if (firstservice.indexOf(']') >= 0) {
              //ERROR
            }
            //Correct subchain
            else {
              var tmpservice = this.services[this.indexOfServiceByName(firstservice)];
              services.push(tmpservice);
              i = 1;
              var stop = false;
              while (!stop) {
                if (params[i].indexOf(']') >= 0) {
                  var pi = params[i].trim().split(']')[0].trim();
                  var index = this.indexOfServiceByName(pi);
                  if (index != -1) {
                    tmpservice = this.services[index];
                    services.push(tmpservice);
                    stop = true;
                  }
                }
                else services.push(this.services[this.indexOfServiceByName(params[i].trim())]);
                i++;
              }
            }
          }
          subchain.services = services;

          var latency = Number(params[i].trim());
          if (isNaN(latency) == false && latency > 0) {
            subchain.maxLatency = latency;
          }
          else {
            console.log(line);
            if (lineerrs.indexOf(line) < 0) lineerrs.push(line);
          }

          this.subchains.push(subchain);
          this.localStorageService.storeSubchain(subchain);
          this.subchainId++;
        }
      }

      if (lineerrs.length > 0) {
        //Case there are errors in the parsing
        var error = 'Errors at lines: ';
        for (var k in lineerrs) {
          error = error + '\n' + lineerrs[k];
          console.log(lines[lineerrs[k]]);
        }
        this.new();
        this.openErrorDialog(error);
      }
      else {
        //Control if the chain is connected and correct and connect the various services
        for (var z in this.flows) {
          var errs = 0;
          var flow = this.flows[z];
          //console.log('flow from ' + flow.fromService + ' to ' + flow.toService)
          var fromIndex = this.indexOfServiceByName(flow.fromService);
          if (fromIndex == -1) {
            this.openErrorDialog('The service ' + flow.fromService + " doesn' t exist");
            errs++;
          }
          var toIndex = this.indexOfServiceByName(flow.toService);
          if (toIndex == -1) {
            this.openErrorDialog('The service ' + flow.toService + " doesn' t exist");
            errs++;
          }
          if (errs == 0) {
            var from = this.services[fromIndex];
            var to = this.services[toIndex];
            //console.log(flow.toService + ' of index ' + this.indexOfServiceByName(flow.toService));
            from.addConnectedService(to.id);
          }
          else {
            this.new();
          }
        }
        //Collocate the ordered services in the space
        this.collocateInSpace();
        //Create the path for the eventual subchains
        for (var z in this.subchains) {
          this.subchains[z].createPath();
          this.localStorageService.modifySubchain(this.subchains[z]);
        }
      }
      this.localStorageService.storeChainFile(this.createChainFile());
    }
    fileReader.readAsText(file);
    
  }

  //Get the security requirements as and/or composition
  retrieveSecReqsComposition(line, service) {
    if (line.indexOf('%') >= 0) {
      //Case comment in the line, exclude it
      line = line.substring(0, line.indexOf('%'));
    }
    //Search the and/or
    var andindex = line.indexOf('and');
    var orindex = line.indexOf('or');
    var substr = '';
    //Rules array
    var rules = Array<Rule>();

    if (andindex >= 0 || orindex >= 0) {
      //Case and/or present together
      if (andindex >= 0 && orindex >= 0) {
        if (andindex < orindex) {
          //Case and before or
          service.cond = 'and';
          substr = line.substring(andindex+3);
        }
        else if (orindex < andindex) {
          //Case or before and
          service.cond = 'or';
          substr = line.substring(orindex+2);
        }
      }
      else if (orindex == -1) {
        //Case or not present
        service.cond = 'and';
        substr = line.substring(andindex+3);
      }
      else if (andindex == -1) {
        //Case and not present
        service.cond = 'or';
        substr = line.substring(orindex+2);
      }
      
      var tmp2 = substr.split(/;|,|\(| /);
      var j = -1;
      var cntp = 0;
      var lastRules = Array<Rule>();
      var stop = false;
      var i = 0;
      while(!stop || i < tmp2.length-1) {
        var elem = tmp2[i].trim();
        if (elem.indexOf('.') >= 0) {
          var elem2 = elem.split(')')[0];
          if (this.errorService.checkSpecialCharacters(elem2) == 1) {
            var rule2 = Array<Rule>();
            var rule = {
              cond: 'single',
              singleReq: elem2,
              nestedRules: rule2,
            };
            if (lastRules.length > 0) lastRules[lastRules.length-1].nestedRules.push(rule);
            else rules.push(rule);
            var count = (elem.match(/\)/g) || []).length;
            var j = 0;
            while (j < count) {
              lastRules.pop();
              j++;
              stop = true;
            }
          }
          else {
            this.openErrorDialog('There is an error in the security requirements specification');
          }
          
        }
        else if (elem.indexOf(')') >= 0) {
          cntp--;
          lastRules.pop();
        }
        else if ((elem == 'and' || elem == 'or') && lastRules.length == 0) {
          var rules2 = Array<Rule>();
          var rule = {
            cond: elem,
            singleReq: '',
            nestedRules: rules2,
          };
          rules.push(rule);
          lastRules.push(rule);
        }
        else if ((elem == 'and' || elem == 'or') && lastRules.length > 0) {
          var rules2 = Array<Rule>();
          var rule = {
            cond: elem,
            singleReq: '',
            nestedRules: rules2
          };
          lastRules[lastRules.length - 1].nestedRules.push(rule);
          lastRules.push(rule);
        }
        else if (elem != ' ' &&  elem != '' && this.errorService.checkSpecialCharacters(elem) == 1 && lastRules.length > 0) {
          var rule = {
            cond: 'single',
            singleReq: elem,
            nestedRules: Array<Rule>()
          };
          lastRules[lastRules.length - 1].nestedRules.push(rule);
        }
        else if (elem != ' ' &&  elem != '' && this.errorService.checkSpecialCharacters(elem) == 1 && lastRules.length == 0) {
          var rule = {
            cond: 'single',
            singleReq: elem,
            nestedRules: Array<Rule>()
          };
          rules.push(rule);
        }
        else if (this.errorService.checkSpecialCharacters(elem) == -1) {
          this.openErrorDialog('There is an error in the security requirements specification');
        }
        i++;
      }
    }
    return rules;
  }

  resetPlacement() {
    this.localStorageService.storeActualPlacement(null);
    this.localStorageService.storePlacements([]);
  }

  new(): void {
    this.closeAllDialogs();
    this.localStorageService.storeChainFile([]);
    //Delete all services, flows and subchains
    for (var i=0; i<this.services.length; i++) {
      var service = this.services[i];
      for (var j=0; j<this.flows.length; j++) {
        if (this.flows[j].fromService == service.name || this.flows[j].toService == service.name) {
          this.localStorageService.deleteFlow(this.flows[j]);
          this.flows.splice(j, 1);
          j--;
        }
      }
      //Delete all from local storage
      this.localStorageService.deleteService(service);
      this.services.splice(i, 1);
      i--;
    }
    //Delete all the subchains from the storage, it can be done also in the elimination of the services and flow
    for (var i=0; i<this.subchains.length; i++) {
      this.localStorageService.deleteSubchain(this.subchains[i]);
      this.subchains.splice(i, 1);
      i--;
    }
    this.services = [];
    this.flows = [];
    this.subchains = [];
    //Delete chain file from local storage
    this.localStorageService.cleanChainFile();
    //Reset the placements
    this.resetPlacement();
    //Reset all state variables
    this.tmpSubchain = null;
    this.serviceId = 0;
    this.flowId = 0;
    this.subchainId = 0;
    this.cancelTmpFlow();
    this.movedService = -1;
    this.isDrawingLine = false;
    this.isMovingService = false;
    this.clickToCreate = false;
    this.isChainMode = -1;
    this.title = 'Untitled chain';
    this.movementX = 0;
    this.movementY = 0;
    this.lastX = -1;
    this.lastY = -1;
    this.dragging = false;
    //this.leaved = -1;
    this.svgPanZoom.resetZoom();
    this.localStorageService.setChainTitle(this.title);
    this.onChangeTitleFromUpload.emit(this.title);
  }

  //Upload a chain file (.eu or .pl)
  uploadChain(event) {
    if (event.target.files && event.target.files.length) {
      //Hide the code if it is visible
      this.hideCode();
      var file = event.target.files[0];
      var tmpfile = file.name.split('.');
      if (tmpfile[1] == 'eu') this.retrieveInformationFromFile(file);
      else if (tmpfile[1] == 'pl') this.retrieveInformationFromPrologFile(file);
      else this.openErrorDialog('Wrong file extension');
    }
  }

  //Create the chain file as array of lines of the file, without any check
  createChainFile(): Array<string> {
    var file = Array<string>();
    var j = 0;
    var tmp = 'chain(' + this.createFilename() + ', [';
    var i = 0;
    for (var i=0; i<this.services.length; i++) {
      var s = this.services[i];
      if (i != this.services.length - 1) tmp = tmp + s.name + ', ';
      else tmp = tmp + s.name;
    }
    file[j] = tmp + ']).';
    j++;
    file[j] = '% Services';
    j++;
    for (var i=0; i<this.services.length; i++) {
      var s = this.services[i];
      tmp = 'service(' + s.name + ', ' + s.serviceTime + ', ' + s.hwReqs + ', [' + s.createIoTReqs() + '], ' + s.createSecReqs() + ').';
      file[j] = tmp;
      j++;
    }
    file[j] = '% Links';
    j++;
    for (var k in this.flows) {
      var f = this.flows[k];
      tmp = 'flow(' + f.fromService + ', ' + f.toService + ', ' + f.bandwidth + ').';
      file[j] = tmp;
      j++;
    }
    for (var k in this.subchains) {
      var sub = this.subchains[k];
      //Examples:
      //maxlatency([F1, F2, ..., FN], MaxLatency).
      //maxLatency([cctv_driver, feature_extr, lw_analytics, alarm_driver], 150).
      for (var z=0; z<sub.services.length; z++) {
        if (z == 0) tmp = sub.services[z].name;
        else tmp = tmp + ', ' + sub.services[z].name;
      }
      tmp = 'maxLatency([' + tmp + '], ' + sub.maxLatency + ').';
      file[j] = tmp;
      j++;
    }
    return file;
  }

  //Create the name of the chain
  createFilename(): string {
    //Delete the spaces from the name and replace with an '_'
    var splitted = this.title.split(" ");
    var title = '';
    for (var i in splitted) {
      if (Number(i) == 0) title = splitted[i];
      else title = title + '_' + splitted[i];
    }
    //Get the name to lower case
    return title.toLowerCase();
  }

  //Save chain project in JSON
  saveJSON() {
    var JSONFile = [];
    var tmp = [];
    //Line 1 represents the services
    for (var i in this.services) {
      var sj = JSON.stringify(this.services[i], function replacer(key, value) {
        if (this && key === "svg")
          return undefined;
        return value;
      });
      tmp.push(sj);
    }
    JSONFile.push(JSON.stringify(tmp));
    tmp = [];
    //Line 2 represents the flows
    for (var i in this.flows) {
      var fj = JSON.stringify(this.flows[i], function replacer(key, value) {
        if (this && key === "svg")
          return undefined;
        return value;
      });
      tmp.push(fj);
    }
    JSONFile.push(JSON.stringify(tmp));
    tmp = [];
    //Line 3 represents the subchains
    for (var i in this.subchains) {
      var sj = JSON.stringify(this.subchains[i], function replacer(key, value) {
        if (this && key === "svg")
          return undefined;
        return value;
      });
      tmp.push(sj);
    }
    JSONFile.push(JSON.stringify(tmp));
    let blob = new Blob([JSONFile.join('\n')], {
      type: "plain/text"
    });
    //Filename represents the chain name
    var fname = this.createFilename();
    fname = fname + '.eu';
    FileSaver.saveAs(blob, fname);
  }

  //Download the chain file in user storage
  save() {
    //Variable if a cycle is detected
    var isCycle = false;
    //Variable for the root services
    var roots = Array<Service>();
    var root = 1;
    for (var p=0; p<this.services.length; p++) {
      //Check if the node is a root
      var h = 0;
      while (h < this.services.length && root != -1) {
        if (h != p) {
          //If the square p is connected to square h, the square p is not a root (h --> p)
          if (this.services[h].hasConnectedService(this.services[p].id)) {
            root = -1;
          }
        }
        h++;
      }
      //If root is still 1 the node is a root and add it to the roots
      if (root == 1) {
        roots.push(this.services[p]);
      }
      //else if root = -1 root = 1 for the next iteration
      else root = 1;
    }
    //If there aren't roots, there is a cycle for sure
    if (roots.length == 0) {
      console.log('there is not roots');
      isCycle = true;
    }
    else {
      //For every root do DFS to detect cycles
      for (var p=0; p<roots.length; p++) {
        //DFS return true if it detects a cycle in the chain
        isCycle = this.DFS(roots[p].id, roots[p].connectedServices, []);
        //Break the loop if there is a cycle
        if (isCycle == true) break;
      }
    }
    if (isCycle == false) {
      //If there aren't cycles check if the chain is connected correctly 
      var isConnected = this.checkIfConnected(roots);
      if (isConnected == true) {
        if (this.subchains.length == 1) {
          //Case chain connected: download the file
          var file = this.createChainFile();
          let blob = new Blob([file.join('\n')], {
            type: 'plain/text'
          });
          var fname = this.createFilename();
          fname = fname + '.pl';
          FileSaver.saveAs(blob, fname);
        }
        else {
          this.openErrorDialog('There must be one max latency constraint');
        }
      }
      else {
        //Case chain not properly connected
        this.openErrorDialog('The chain is not connected');
      }
        
    }
    else {
      //Case cycle in the chain
      this.openErrorDialog('There is a cycle in the graph');
    }
  }

  /*--- DATA METHODS ---*/

  //Delete the temporary flow, used for flow creation
  cancelTmpFlow(): void {
    this.isDrawingLine = false;
    this.svgPanZoom.enablePan();
    this.service1 = null;
    document.getElementById('tmp-flow').style.display = 'none';
    this.tmpFlow.coord1.x = 0;
    this.tmpFlow.coord1.y = 0;
    this.tmpFlow.coord2.x = 0;
    this.tmpFlow.coord2.y = 0;
  }

  //Get the index of a service by the name
  indexOfServiceByName(name: string) {
    for (var i in this.services) {
      if (this.services[i].name == name) return Number(i);
    }
    return -1;
  }

  //Get the index of a service by its id
  indexOfServiceById(id: number) {
    for (var i in this.services) {
      if (this.services[i].id == id) return Number(i);
    }
    return -1;
  }

  //Get the index of a flow by its id
  indexOfFlow(id: number) {
    for (var i in this.flows) {
      if (this.flows[i].id == id) return Number(i);
    }
    return -1;
  }

  //Get the index of a subchain by its id
  indexOfSubchain(id: number) {
    for (var i in this.subchains) {
      if (this.subchains[i].id == id) return Number(i);
    }
    return -1;
  }

  //When modifying service where the flow ends
  modifyFlowTo(flow: Flow, service2: Service) {
    var i = this.indexOfServiceByName(flow.fromService);
    if (i != -1) {
      var service1 = this.services[i];
      //Distance on x and y
      var dx: number;
      var dy: number;
      dx = service2.x - service1.x;
      dy = service2.y - service1.y;
      //Distance between centers using pitagora
      var l = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
      //Ratio for the radius
      var r1l = service1.r / l;
      var r2l = service2.r / l;
      //Coordinates for the line
      flow.coord1.x = service1.x + (dx * r1l);
      flow.coord2.x = service2.x - (dx * r2l);
      flow.coord1.y = service1.y + (dy * r1l);
      flow.coord2.y = service2.y - (dy * r2l);
    }
  }

  //When modifyin service where the flow starts
  modifyFlowFrom(flow: Flow, service1: Service) {
    var i = this.indexOfServiceByName(flow.toService);
    if (i != -1) {
      var service2 = this.services[i];
      //Distance on x and y
      var dx: number;
      var dy: number;
      dx = service2.x - service1.x;
      dy = service2.y - service1.y;
      //Distance between centers using pitagora
      var l = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
      //Ratio for the radius
      var r1l = service1.r / l;
      var r2l = service2.r / l;
      //Coordinates for the line
      flow.coord1.x = service1.x + (dx * r1l);
      flow.coord2.x = service2.x - (dx * r2l);
      flow.coord1.y = service1.y + (dy * r1l);
      flow.coord2.y = service2.y - (dy * r2l);
    }
  }

  //Create a flow to service2 from service1, that is a global variable
  createFlowTo(service2: Service) {
    if (this.service1 != null) {
      var f = new Flow(this);
      var service1 = this.service1;
      //Distance on x and y
      var dx: number;
      var dy: number;
      dx = service2.x - service1.x;
      dy = service2.y - service1.y;
      //Distance between centers using pitagora
      var l = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
      //Ratio for the radius
      var r1l = service1.r / l;
      var r2l = service2.r / l;
      //Coordinates for the line
      f.coord1.x = service1.x + (dx * r1l);
      f.coord2.x = service2.x - (dx * r2l);
      f.coord1.y = service1.y + (dy * r1l);
      f.coord2.y = service2.y - (dy * r2l);
      f.fromService = this.service1.name;
      f.toService = service2.name;
      f.id = this.flowId;
      //Check if the flow is a duplicate
      var dup = false;
      for (var i in this.flows) {
        var f2 = this.flows[i];
        if ((f2.fromService == f.fromService && f2.toService == f.toService) || (f2.fromService == f.toService && f2.toService == f.fromService)) {
          dup = true;
          break;
        }
      }
      if (dup == false) {
        //Case correct flow
        this.openFlowDialog(f);
      }
      else {
        //Case duplicate flow
        this.openErrorDialog('This link is a duplicate');
      }
      //Reset temporary flow
      this.service1 = null;
      this.cancelTmpFlow();
    }
  }

  //Delete a flow
  deleteFlow(flow: Flow) {
    for (var i=0; i< this.flows.length; i++) {
      if (this.flows[i].id == flow.id) {
        //Update the connected services
        var service1 = this.services[this.indexOfServiceByName(this.flows[i].fromService)];
        var service2 = this.services[this.indexOfServiceByName(this.flows[i].toService)];
        //Tell at service1 that is no longer connected with service2
        service1.removeConnectedService(service2.id);
        //Update the service in local storage
        this.localStorageService.modifyService(service1);
        //Update the subchain interested by these services
        for (var j in this.subchains) {
          if (this.subchains[j].containsById(service1)) {
            this.subchains[j].modifyService(service1);
            this.localStorageService.modifySubchain(this.subchains[j]);
          }
        }
        //Check if all the subchains is correct after the changes
        for (var k=0; k<this.subchains.length; k++) {
          if (this.checkSubchain(this.subchains[k]) != 1) {
            this.removeOpenedSubchainDialog(this.subchains[k].id);
            this.localStorageService.deleteSubchain(this.subchains[k]);
            this.subchains.splice(k, 1);
            k--;
          } 
        }
        //Delete the flow from local storage
        this.localStorageService.deleteFlow(flow);
        this.flows.splice(i, 1);
        i--;
        break;
      }
    }
    this.localStorageService.storeChainFile(this.createChainFile());
  }

  //Delete service
  deleteService(s: Service) {
    for (var i=0; i<this.services.length; i++) {
      var s2 = this.services[i];
      if (s2.id == s.id) {
        //Update/delete the flows and the connection interested by this service
        for (var j=0; j<this.flows.length; j++) {
          var f = this.flows[j];
          if (f.fromService == s.name || f.toService == s.name) {
            this.localStorageService.deleteFlow(f);
            if (f.toService == s.name) {
              var s1 = this.services[this.indexOfServiceByName(f.fromService)];
              s1.removeConnectedService(s2.id);
            }
            this.flows.splice(j, 1);
            j--;
          }
        }
        //Update the subchain interested by this service
        for (var k=0; k<this.subchains.length; k++) {
          if (this.subchains[k].containsById(s)) {
            this.localStorageService.deleteSubchain(this.subchains[k]);
            this.removeOpenedSubchainDialog(this.subchains[k].id);
            this.subchains.splice(k, 1);
            k--;
          }
        }
        //Delete the service from local storage
        this.localStorageService.deleteService(s);
        this.services.splice(i, 1);
        i--;
        break;
      }
    }
    this.localStorageService.storeChainFile(this.createChainFile());
  }

  //Check if a service is being create too close to another service
  tooCloseToAnotherService(service1: Service) {
    
    //Distance on x and y
    var dx: number;
    var dy: number;
    //Other service
    var service2: Service;
    var l: number;
    var minDist: number;
    for (var i=0; i<this.services.length; i++) {
      if (this.services[i].id != service1.id) {
        service2 = this.services[i];
        dx = service2.x - service1.x;
        dy = service2.y - service1.y;
        //Distance between centers using pitagora        
        var l = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        minDist = service1.r + service2.r;
        if (l < minDist) return true;
      }
    }
    return false;
  }

  /*--- SUBCHAIN METHODS ---*/

  //Start to create a subchain
  onSubchainStartClick() {
    this.tmpSubchain = new Subchain(this);
    this.tmpSubchain.id = this.subchainId;
    this.isChainMode = this.tmpSubchain.id;
    //Color the subchain button
    const button = document.getElementById('subchain-button');
    button.style.border = "2px solid red";
  }

  //Stop the creation of a subchain
  onSubchainStopClick() {
    if (this.isChainMode != -1) {
      //Check if the subchain is correct and sort its services
      var ok = this.checkSubchain(this.tmpSubchain);
      if (ok == 1) {
        //If the subchain is correct and after it has been ordered, check if it's a duplicate
        var dup = this.dupSubchain(this.tmpSubchain);
        if (dup == false) {
          this.openSubchainDialog(this.tmpSubchain);
        }
        else {
          //Case subchain not correct
          this.isChainMode = -1;
          this.tmpSubchain = null;
          this.openErrorDialog('The subchain is a duplicate');
        }
      }
      else if (ok == -1) {
        this.isChainMode = -1;
        this.tmpSubchain = null;
        this.openErrorDialog('The subchain is too short');
      }
      else if (ok == -2) {
        this.isChainMode = -1;
        this.tmpSubchain = null;
        this.openErrorDialog('The subchain is not connected');
      }
      for (var i in this.services) {
        document.getElementById('service'+this.services[i].id).style.stroke = 'black';
      }
      const button = document.getElementById('subchain-button');
      button.style.border = "none";
      //document.getElementById('subchain-button').style.backgroundColor = 'lightblue';
    }
  }

  dupSubchain(s: Subchain) {

    for (var i in this.subchains) {
      var s2 = this.subchains[i];
      if (s.id != s2.id) {
        //If they have different lenghts, they are different for sure
        if  (s2.services.length != s.services.length) {
          //Do nothing
        }
        else {
          for (var j=0; j<s.services.length; j++) {
            if (s2.services[j] != undefined) {
              if (s2.services[j].id == s.services[j].id && j == s.services.length - 1) return true;
              else if (s.services[j].id != s2.services[j].id) {
                break;
              }
            }
            else break;
          }
        }
      }
    }
    return false;
  }

  deleteSubChainFromId(id: number) {
    for (var i=0; i<this.subchains.length; i++) {
      if (this.subchains[i].id == id) {
        this.localStorageService.deleteSubchain(this.subchains[i]);
        this.removeOpenedSubchainDialog(this.subchains[i].id);
        this.subchains.splice(i, 1);
        i--;
        break;
      }
    }
    this.localStorageService.storeChainFile(this.createChainFile());
  }

  updateSubchainInterestedByFlow(f: Flow, type: number) {
    for (var i=0; i<this.subchains.length; i++) {
      var sub = this.subchains[i];
      var ok = this.checkSubchain(sub);
      if (ok != 1) {
        this.localStorageService.deleteSubchain(sub);
        this.subchains.splice(i, 1);
        i--;
      }
    }
    this.localStorageService.storeChainFile(this.createChainFile());
  }

  /*--- MOUSE EVENTS HANDLING ---*/

  onMouseDown(event) {
    event.preventDefault();
    //if (event.button == 0) {
    if (event.target == document.getElementById('svgchainelem')) {
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

  onMouseLeave() {
    if (this.isDrawingLine == true) {
      this.cancelTmpFlow();
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

  onMouseMove(event) {
    var x = (event.offsetX - this.svgPanZoom.getPan().x) / this.svgPanZoom.getZoom();
    var y = (event.offsetY - this.svgPanZoom.getPan().y) / this.svgPanZoom.getZoom();
    if (this.dragging == true) {
      var deltaX = Math.abs(x - this.lastX);
      var deltaY = Math.abs(y - this.lastY);
      this.movementX += deltaX;
      this.movementY += deltaY;
      this.redrawMenus();
    }
    else if (this.movedService >= 0) {
      var index = this.indexOfServiceById(this.movedService);
      var s = this.services[index];
      document.getElementById('service'+s.id).style.cursor = 'move';
      //Update the coordinate of the service
      s.x = x;
      s.y = y;
      s.placeIotIcons();
      //Update the connected flows
      for (var i in this.flows) {
        var f = this.flows[i];
        if (this.flows[i].fromService == s.name) {
          //this.flows[i].coord1.x = s.x;
          //this.flows[i].coord1.y = s.y;
          this.modifyFlowFrom(this.flows[i], s);
          this.updateSubchainInterestedByFlow(this.flows[i], 1);
          //this.localStorageService.modifyFlow(this.flows[i]);
        }
        else if (this.flows[i].toService == s.name) {
          //this.flows[i].coord2.x = s.x;
          //this.flows[i].coord2.y = s.y;
          this.modifyFlowTo(this.flows[i], s);
          this.updateSubchainInterestedByFlow(this.flows[i], 1);
          //this.localStorageService.modifyFlow(this.flows[i]);
        }
      }
      //Update the connected subchain but not save it
      for (var j in this.subchains) {
        if (this.subchains[j].containsById(s)) {
          this.subchains[j].createPath();
          this.subchains[j].modifyService(s);
        }
      }
    }
    else if (this.isDrawingLine == true) {
      //Set the coordinates of the temporary link
      if (x < this.tmpFlow.coord1.x) {
        this.tmpFlow.coord2.x = x + 3;
      }
      else if (x > this.tmpFlow.coord1.x) {
        this.tmpFlow.coord2.x = x - 3;
      }
      else {
        this.tmpFlow.coord2.x = x;
      }
      if (y < this.tmpFlow.coord1.y) {
        this.tmpFlow.coord2.y = y + 3;
      }
      else if (y > this.tmpFlow.coord1.y) {
        this.tmpFlow.coord2.y = y - 3;
      }
      else {
        this.tmpFlow.coord2.y = y;
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
      else if (event.target != document.getElementById("svgchainelem")) {
        if (event.target.id == 'tmp-link') {
          this.cancelTmpFlow();
        }
        else if (event.target.class == "node") {
          //Case node
        }
        else if (event.target.class == 'link') {
          //Case link
        }
      }
      else {
        if (this.isChainMode >= 0) {
          //Do nothing
        }
        else if (this.movedService >= 0) {
          document.getElementById('node'+this.services[this.movedService].id).style.cursor = 'move';
          var index = this.indexOfServiceById(this.movedService);
          this.services[index].x = x;
          this.services[this.movedService].y = y;
          //Update the lines
          for (var i in this.flows) {
            if (this.flows[i].fromService == this.services[index].name) {
              this.flows[i].coord1.x = this.services[index].x;
              this.flows[i].coord1.y = this.services[index].y;
            }
            if (this.flows[i].toService == this.services[index].name) {
              this.flows[i].coord2.x = this.services[index].x;
              this.flows[i].coord2.y = this.services[index].y;
            }
          }
        }
        else if (this.isDrawingLine == true) {
          this.isDrawingLine = false;
          this.cancelTmpFlow();
        }
        else if (this.clickToCreate == true) {
          var s = new Service(this);
          s.x = x;
          s.y = y;
          s.id = this.serviceId;
          s.name = 'Service name';
          if (this.tooCloseToAnotherService(s) == false) {
            this.openServiceDialog(s);
          }
          else {
            this.openErrorDialog('Too close to another node!');
          }
        }
      }
    }
    else {
      //Case right click: do nothing
    }
    //Always set this variables
    this.cancelTmpFlow();
    this.dragging = false;
    this.clickToCreate = false;
    this.lastX = -1;
    this.lastY = -1;
    this.movementY = 0;
    this.movementX = 0;
  }

  /*--- DIALOG METHODS ---*/

  //Close all dialogs
  closeAllDialogs() {
    this.dialog.closeAll();
    this.openServiceDialogs = [];
    this.openFlowDialogs = [];
    this.openSubchainDialogs = [];
  }

  //Close the subchain dialogs if the subchains contains this service
  closeSubchainDialogsInterestedBy(s: Service) {
    for (var i in this.subchains) {
      if (this.subchains[i].containsById(s) == true) {
        for (var j=0; j<this.openSubchainDialogs.length; j++) {
          if (this.openSubchainDialogs[j] == this.subchains[i].id) {
            this.dialog.getDialogById('subchain-menu' + this.openSubchainDialogs[j]).close();
            this.openSubchainDialogs.splice(j, 1);
            j--;
            break;
          }
        }
      }
    }
  }

  //Close the dialog of the flows that interests service s
  closeDialogFlowConnectedTo(s: Service) {
    for (var i in this.flows) {
      if (this.flows[i].fromService == s.name || this.flows[i].toService == s.name) {
        for (var j=0; j<this.openFlowDialogs.length; j++) {
          if (this.openFlowDialogs[j] == this.flows[i].id) {
            this.dialog.getDialogById('flow-menu'+this.openFlowDialogs[j]).close();
            this.openFlowDialogs.splice(j, 1);
            j--;
            break;
          }
        }
      }
    }
  }

  //Check if the dialog of this service is open
  isOpenService(id: number) {
    for (var i in this.openServiceDialogs) {
      if (this.openServiceDialogs[i] == id) return true;
    }
    return false;
  }

  //Check if the dialog of this flow is open
  isOpenFlow(id: number) {
    for (var i=0; i<this.openFlowDialogs.length; i++) {
      if (this.openFlowDialogs[i] == id) {
        return true;
      }
    }
    return false;
  }

  //Check if the dialog of this subchain is open
  isOpenSubchain(id: number) {
    for (var i=0; i<this.openSubchainDialogs.length; i++) {
      if (this.openSubchainDialogs[i] == id) {
        return true;
      }
    }
    return false;
  }

  //Remove this dialog from the opened dialog
  removeOpenedSubchainDialog(id: number) {
    for (var i=0; i<this.openSubchainDialogs.length; i++) {
      if (this.openSubchainDialogs[i] == id) {
        this.openSubchainDialogs.splice(i, 1);
        i--;
        break;
      }
    }
  }

  //Remove this dialog from the opened dialog
  removeOpenedServiceDialog(id: number) {
    for (var i=0; i<this.openServiceDialogs.length; i++) {
      if (this.openServiceDialogs[i] == id) {
        this.openServiceDialogs.splice(i, 1);
        i--;
        break;
      }
    }
  }

  //Remove this dialog from the opened dialog
  removeOpenedFlowDialog(id: number) {
    for (var i=0; i<this.openFlowDialogs.length; i++) {
      //if (this.openFlowDialogs[i][0] == from && this.openFlowDialogs[i][1] == to) {
      if (this.openFlowDialogs[i] == id) {
        this.openFlowDialogs.splice(i, 1);
        i--;
        break;
      }
    }
  }

  //Open the service dialog for the first time to create a service
  openServiceDialog(s: Service) {
    var dialogRef = this.dialog.open(ServiceDialogComponent, {
      width: '40%',
      disableClose: true,
      autoFocus: false,
      data: {
        name: s.name,
        serviceTime: s.serviceTime,
        hwReqs: s.hwReqs,
        iotReqs: s.iotReqs,
        securityRequirements: s.securityRequirements,
        cond: s.cond,
        id: s.id,
        functions: this.services,
      }
    });

    //Click for cancel the operation
    dialogRef.componentInstance.deleteSquare.subscribe(service => {
      this.deleteService(service);
    });

    //Click to confirm the operation
    dialogRef.componentInstance.createSquare.subscribe(result => {
      //Assign the values at the service
      s.id = result.id;
      s.name = result.name;
      s.serviceTime = result.serviceTime;
      s.hwReqs = result.hwReqs;
      s.iotReqs = result.iotReqs;
      s.placeIotIcons();
      s.securityRequirements = result.securityRequirements;
      s.cond = result.cond;
      //Save the service 
      this.services.push(s);
      this.localStorageService.storeService(s);
      this.localStorageService.storeChainFile(this.createChainFile());
      this.serviceId++;
    });
  }

  //Open flow dialog for its creation
  openFlowDialog(flow: Flow) {
    const dialogRef = this.dialog.open(FlowDialogComponent, {
      width: '30%',
      disableClose: true,
      autoFocus: false,
      data: {
        bandwidth: flow.bandwidth,
        from: flow.fromService,
        to: flow.toService,
        id: flow.id
      }
    });

    //Click to cancel the operation
    dialogRef.componentInstance.deleteLine.subscribe((data) => {
      //Delete the flow
      this.deleteFlow(flow);
    });

    //Click to confirm
    dialogRef.componentInstance.createLine.subscribe(result => {
      flow.bandwidth = result.bandwidth;
      //Create the flow
      this.flows.push(flow);
      this.localStorageService.storeFlow(flow);
      this.flowId++;
      //Add the connected service to the other service
      var service1 = this.services[this.indexOfServiceByName(flow.fromService)];
      var service2 = this.services[this.indexOfServiceByName(flow.toService)];
      service1.addConnectedService(service2.id);
      this.localStorageService.modifyService(service1);
      //Update the subchain services (maybe needless)
      for (var j in this.subchains) {
        if (this.subchains[j].containsById(service1)) {
          this.subchains[j].modifyService(service1);
          this.localStorageService.modifySubchain(this.subchains[j]);
        }
      }
      this.localStorageService.storeChainFile(this.createChainFile());
    });
  }

  //Open subchain dialog for its creation
  openSubchainDialog(s: Subchain) {
    const dialogRef = this.dialog.open(ChainDialogComponent, {
      width: '30%',
      disableClose: true,
      autoFocus: false,
      data: {
        id: s.id,
        maxLatency: s.maxLatency,
        services: this.services,
      }
    });

    //Click to confirm
    dialogRef.componentInstance.chainClick.subscribe((result) => {
      //Assign the values to the subchain
      s.maxLatency = result;
      //Save the subchain
      this.subchains.push(s);
      this.subchainId++;
      this.localStorageService.storeSubchain(s);
      this.localStorageService.storeChainFile(this.createChainFile());
      this.isChainMode = -1;
      this.tmpSubchain = null;
      for (var i in this.services) {
        document.getElementById('service'+this.services[i].id).style.stroke = 'black';
      }
      s.createPath();
    });

    //Click to cancel
    dialogRef.componentInstance.cancelClick.subscribe(() => {
      this.isChainMode = -1;
      this.tmpSubchain = null;
    });

  }

  //Open service menu for its modification
  openServiceMenu(s: Service) {
    var prevname = s.name;
    var dialogRef;
    //Corner where the dialog touch the circle (without round border)
    var corner = '';
    var p = document.getElementById('svgchainelem').getBoundingClientRect();
    var pageX = (s.x * this.svgPanZoom.getZoom() + this.svgPanZoom.getPan().x) + p.left;
    var pageY = (s.y * this.svgPanZoom.getZoom() + this.svgPanZoom.getPan().y) + p.top;
    var hd = 255;
    var wd = 300;
    corner = 'topLeft';
    //Search for page coordinates
    if (pageY + hd > p.bottom) {
      pageY = pageY - hd;
      corner = 'bottomLeft';
    }
    if (pageX + wd > p.right) {
      pageX = pageX - wd;
      if (corner == 'bottomLeft') corner = 'bottomRight';
      else corner = 'topRight';
    }

    dialogRef = this.dialog.open(FunctionMenuComponent, {
      width: 255 + 'px',
      height: 300 + 'px',
      position: {
        top: pageY + 'px',
        left: pageX + 'px'
      },
      disableClose: true,
      autoFocus: false,
      hasBackdrop: false,
      data: {
        name: s.name,
        securityRequirements: s.securityRequirements,
        serviceTime: s.serviceTime,
        hwReqs: s.hwReqs,
        iotReqs: s.iotReqs,
        id: s.id,
        cond: s.cond,
        functions: this.services
      },
      id: 'service-menu' + s.id,
    });

    //Add this to the open dialogs
    this.openServiceDialogs.push(s.id);

    //Set dinamically the style for this dialog
    var d = document.getElementsByClassName('mat-dialog-container') as HTMLCollectionOf<HTMLElement>;
    var c = document.getElementsByClassName('mat-dialog-content') as HTMLCollectionOf<HTMLElement>;
    var t = document.getElementsByClassName('mat-dialog-title') as HTMLCollectionOf<HTMLElement>;
    var a = document.getElementsByClassName('mat-dialog-actions') as HTMLCollectionOf<HTMLElement>;
    var cpc = document.getElementsByClassName('mat-expansion-panel-content') as HTMLCollectionOf<HTMLElement>;
    d[d.length-1].id = 'function-menu' + s.id;
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

    //Click on delete
    dialogRef.componentInstance.deleteSquare.subscribe(() => {
      //console.log('delete' + s.id)
      this.deleteService(s);
      this.removeOpenedServiceDialog(s.id);
    });

    //Close the dialog without changes
    dialogRef.componentInstance.closeClick.subscribe(() => {
      this.removeOpenedServiceDialog(s.id);
    });

    //Click to move the service
    dialogRef.componentInstance.moveSquare.subscribe(() => {
      //Close the dialogs interested by this service
      this.closeDialogFlowConnectedTo(s);
      this.removeOpenedServiceDialog(s.id);
      this.closeSubchainDialogsInterestedBy(s);
      this.movedService = s.id;
      this.isDrawingLine = false;
      //Reenable pan
      this.svgPanZoom.enablePan();
    });

    //Click to confirm the changes
    dialogRef.componentInstance.createSquare.subscribe(result => {
      //Update the values
      s.id = result.id;
      s.name = result.name;
      s.iotReqs = result.iotReqs;
      s.hwReqs = result.hwReqs;
      s.securityRequirements = result.securityRequirements;
      s.serviceTime = result.serviceTime;
      s.cond = result.cond;
      //Replace the icons
      s.placeIotIcons();
      if (prevname != s.name) {
        for (var i in this.flows) {
          var f = this.flows[i];
          if (f.fromService == prevname) {
            f.fromService = s.name;
            //Update the coordinates of the link
            this.modifyFlowFrom(f, s);
            this.updateSubchainInterestedByFlow(this.flows[i], 1);
            this.localStorageService.modifyFlow(f);
          }
          if (f.toService == prevname) {
            f.toService = s.name;
            //Update the coordinates of the link
            this.modifyFlowTo(f, s);
            this.updateSubchainInterestedByFlow(this.flows[i], 1);
            this.localStorageService.modifyFlow(f);
          }
        }
      }
      this.localStorageService.modifyService(s);
      for (var j in this.subchains) {
        if (this.subchains[j].containsById(s)) {
          this.subchains[j].modifyService(s);
          this.localStorageService.modifySubchain(this.subchains[j]);
        }
      }
      this.localStorageService.storeChainFile(this.createChainFile());
      this.removeOpenedServiceDialog(s.id);
    });
  }

  //Open subchain menu for its modification
  openSubchainMenu(s: Subchain) {
    var dialogRef;
    var corner = '';
    var p = document.getElementById('svgchainelem').getBoundingClientRect();
    var sub: SVGPathElement;
    sub = <SVGPathElement><any>document.getElementById('subchain' + s.id);
    // Get the length of the path
    var pathLen = sub.getTotalLength();
    // How far along the path to we want the position?
    var pathDistance = pathLen * 0.5;
    var middle = sub.getPointAtLength(pathDistance);
    var x = middle.x;
    var y = middle.y;
    var pageX = (x * this.svgPanZoom.getZoom() + this.svgPanZoom.getPan().x) + p.left;
    var pageY = (y * this.svgPanZoom.getZoom() + this.svgPanZoom.getPan().y) + p.top; 
    var hd = 130;
    var wd = 200;
    corner = 'topLeft';
    if (pageY + hd > p.bottom) {
      pageY = pageY + hd;
      corner = 'bottomLeft';
    }
    if (pageX + wd > p.right) {
      pageX = pageX - wd;
      if (corner == 'bottomLeft') corner = 'bottomRight';
      else corner = 'topRight';
    }

    dialogRef = this.dialog.open(SubchainMenuComponent, {
      width: 200 + 'px',
      height: 130 + 'px',
      position: {
        top: pageY + 'px',
        left: pageX + 'px',
      },
      hasBackdrop: false,
      disableClose: false,
      autoFocus: false,
      data: {
        maxLatency: s.maxLatency,
        id: s.id
      },
      id: 'subchain-menu' + s.id
    });

    //Add this to the open dialogs
    this.openSubchainDialogs.push(s.id);

    //Set dinamically the style for this dialog
    var d = document.getElementsByClassName('mat-dialog-container') as HTMLCollectionOf<HTMLElement>;
    var c = document.getElementsByClassName('mat-dialog-content') as HTMLCollectionOf<HTMLElement>;
    var a = document.getElementsByClassName('mat-dialog-actions') as HTMLCollectionOf<HTMLElement>;
    d[d.length-1].id = 'subchain-menu' + s.id;
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

    dialogRef.componentInstance.cancelClick.subscribe(data => {
      this.deleteSubChainFromId(s.id);
      this.removeOpenedSubchainDialog(s.id);
    });

    dialogRef.componentInstance.chainClick.subscribe(result => {
      s.maxLatency = result.maxLatency;
      this.localStorageService.modifySubchain(s);
      this.removeOpenedSubchainDialog(s.id);
    });

    dialogRef.componentInstance.closeClick.subscribe(() => {
      this.removeOpenedSubchainDialog(s.id);
    });

  }

  //Open flow menu for its modification
  openFlowMenu(f: Flow) {
    var dialogRef;
    var corner = '';
    var p = document.getElementById('svgchainelem').getBoundingClientRect();
    var x = (f.coord1.x + f.coord2.x) / 2;
    var y = (f.coord1.y + f.coord2.y) / 2;
    var pageX = (x * this.svgPanZoom.getZoom() + this.svgPanZoom.getPan().x) + p.left;
    var pageY = (y * this.svgPanZoom.getZoom() + this.svgPanZoom.getPan().y) + p.top; 
    var hd = 110;
    var wd = 200;
    corner = 'topLeft';
    if (pageY + hd > p.bottom) {
      pageY = pageY + hd;
      corner = 'bottomLeft';
    }
    if (pageX + wd > p.right) {
      pageX = pageX - wd;
      if (corner == 'bottomLeft') corner = 'bottomRight';
      else corner = 'topRight';
    }

    dialogRef = this.dialog.open(FlowMenuComponent, {
      width: '200px',
      height: '110px',
      position: {
        top: pageY + 'px',
        left: pageX + 'px',
      },
      hasBackdrop: false,
      disableClose: false,
      autoFocus: false,
      data: {
        bandwidth: f.bandwidth,
        from: f.fromService,
        to: f.toService,
        id: f.id
      },
      id: 'flow-menu' + f.id
    });

    //Add this to the open dialogs
    this.openFlowDialogs.push(f.id);

    //Set dinamically the style for this dialog
    var d = document.getElementsByClassName('mat-dialog-container') as HTMLCollectionOf<HTMLElement>;
    var c = document.getElementsByClassName('mat-dialog-content') as HTMLCollectionOf<HTMLElement>;
    var a = document.getElementsByClassName('mat-dialog-actions') as HTMLCollectionOf<HTMLElement>;
    d[d.length-1].id = 'flow-menu' + f.id;
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


    dialogRef.componentInstance.deleteLine.subscribe(data => {
      this.deleteFlow(f);
      this.removeOpenedFlowDialog(f.id);
    });

    dialogRef.componentInstance.createLine.subscribe(result => {
      f.bandwidth = result.bandwidth;
      this.localStorageService.modifyFlow(f);
      this.updateSubchainInterestedByFlow(f, 0);
      this.localStorageService.storeChainFile(this.createChainFile());
      this.removeOpenedFlowDialog(f.id);
    });

    dialogRef.componentInstance.closeClick.subscribe(() => {
      this.removeOpenedFlowDialog(f.id);
    });
  }

  openConfirmationDialog(text: string, type: string) {
    const dialogRef = this.dialog.open(ConfirmationRequestComponent, {
      autoFocus: false,
      data: {
        text: text,
        type: type
      }
    });

    dialogRef.componentInstance.positiveClick.subscribe(() => {
      if (type == 'reset') {
        this.new();
      }
    });

    dialogRef.componentInstance.negativeClick.subscribe(() => {
      //Do nothing
    });
  }

  //Open a dialog to show an error
  openErrorDialog(err: string) {
    const dialogRef = this.dialog.open(ErrorDialogComponent, {
      data: {
        err: err
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      //Do nothing
    });
  }

  //TODO: creare dialog specifico per il tutorial
  openTutorialDialog(text: string) {
    const dialogRef = this.dialog.open(ErrorDialogComponent, {
      data: {
        err: text,
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      
    });
  }

  //Redraw the menus when panning
  redrawMenus() {
    var index;
    var pageX: number;
    var pageY: number;
    var dialogRef;
    var corner = '';
    //Get the measurements of svg elem
    var p = document.getElementById('svgchainelem').getBoundingClientRect();
    for (var i=0; i<this.openServiceDialogs.length; i++) {
      //Get the service dialog reference
      dialogRef = this.dialog.getDialogById('service-menu' + this.openServiceDialogs[i]);
      index = this.indexOfServiceById(this.openServiceDialogs[i]);
      //If the index exists
      if (index != -1) {
        var s = this.services[index];
        //Search the page coordinate for the service
        pageX = (s.x * this.svgPanZoom.getZoom() + this.svgPanZoom.getPan().x) + p.left;
        pageY = (s.y * this.svgPanZoom.getZoom() + this.svgPanZoom.getPan().y) + p.top;
        var h = 255;
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
        var d = document.getElementById('service-menu' + s.id);
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
        //Update the position for this dialog
        dialogRef.updatePosition(matDialogConfig.position);
      }
    }
    for (var i=0; i<this.openFlowDialogs.length; i++) {
      dialogRef = this.dialog.getDialogById('flow-menu' + this.openFlowDialogs[i]);
      index = this.indexOfFlow(this.openFlowDialogs[i]);
      if (index != -1) {
        var f = this.flows[index];
        var h = 110;
        var w = 200;
        var x = (f.coord1.x + f.coord2.x) / 2;
        var y = (f.coord1.y + f.coord2.y) / 2;
        pageX = (x * this.svgPanZoom.getZoom() + this.svgPanZoom.getPan().x) + p.left;
        pageY = (y * this.svgPanZoom.getZoom() + this.svgPanZoom.getPan().y) + p.top;
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
        var d = document.getElementById('flow-menu' + f.id);
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
    for (var i=0; i<this.openSubchainDialogs.length; i++) {
      dialogRef = this.dialog.getDialogById('subchain-menu' + this.openSubchainDialogs[i]);
      index = this.indexOfSubchain(this.openSubchainDialogs[i]);
      if (i != -1) {
        var sub = this.subchains[index];
        var h = 120;
        var w = 200;
        var subp: SVGPathElement;
        subp = <SVGPathElement><any>document.getElementById('subchain' + sub.id);
        // Get the length of the path
        var pathLen = subp.getTotalLength();
        // How far along the path to we want the position?
        var pathDistance = pathLen * 0.5;
        var middle = subp.getPointAtLength(pathDistance);
        var x = middle.x;
        var y = middle.y;
        pageX = (x * this.svgPanZoom.getZoom() + this.svgPanZoom.getPan().x) + p.left;
        pageY = (y * this.svgPanZoom.getZoom() + this.svgPanZoom.getPan().y) + p.top;
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
        var d = document.getElementById('subchain-menu' + sub.id);
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

  /*--- SPACE COLLOCATION OF SERVICES ---*/

  //Check if this service is present in this array
  containsServiceById(services: Array<Service>, s: Service) {
    for (var i in services) {
      if (s.id == services[i].id) return true;
    }
    return false;
  }

  //Collocate the services in the space when a problog file is parsed
  collocateInSpace() {
    var isCycle = false;
    var roots = Array<Service>();
    var root = 1;
    //Searching for the roots of the graph
    for (var p=0; p<this.services.length; p++) {
      //Check if the node is a root
      var h = 0;
      //h is used as an index
      while (h<this.services.length && root != -1) {
        if (h != p) {
          //If the square p is connected to square h, the square p is not a root
          if (this.services[h].hasConnectedService(this.services[p].id)) {
            root = -1;
          }
        }
        h++;
      }
      //If root is still 1 the node is a root and add it to the roots array
      if (root == 1) {
        roots.push(this.services[p]);
      }
      //Else reinitialize root for the next iteration
      else root = 1;
    }
    //If there aren't roots in the graph, there is a cycle for sure
    if (roots.length == 0) {
      console.log('there is not roots');
      isCycle = true;
    }
    else {
      //For every root do DFS to detect cycles in its tree
      for (var p=0; p<roots.length; p++) {
        //DFS return true if it detects a cycle in the root's tree
        isCycle = this.DFS(roots[p].id, roots[p].connectedServices, []);
        //Break the cycle if there is a cycle
        if (isCycle == true) break;
      }
    }
    if (isCycle == false) {
      //If there aren't cycles check if the chain is connected correctly 
      var isConnected = this.checkIfConnected(roots);
      if (isConnected == true) {
        //Case chain correctly connected and without cycles
        this.services = this.sortServices(roots);
        var svgdims = document.getElementById('svgchainelem').getBoundingClientRect();
        for (var i=0; i<roots.length; i++) {
          //Set the positions for the roots (on first column)
          roots[i].x = 50;
          roots[i].y = ((i + 1) * (svgdims.height / roots.length) - 50);
          //In this case BFS is used to assign the coordinates at the services that aren't roots
          this.BFS(roots[i]);
        }
        for (var i=0; i<this.services.length; i++) {
          var s1 = this.services[i];
          //Services that overlapped one each other on x (horizontal) coordinate
          var overlapped = Array<number>();
          overlapped.push(i);
          for (var j=0; j<this.services.length; j++) {
            var s2 = this.services[j];
            if (j != i && s1.x == s2.x) {
              overlapped.push(j);
            }
          }
          //Collocate on the rows the services on the same column (overlapped on x)
          for (var z=0; z<overlapped.length; z++) {
            this.services[overlapped[z]].y = (z+1) * 100;
          }
        }
        for (var k=0; k<this.services.length; k++) {
          //Assign coordinates to the service in the local storage
          this.localStorageService.modifyService(this.services[k]);
        }
        for (var k=0; k<this.flows.length; k++) {
          //Assign the coordinates to all the flows to render its
          var flow = this.flows[k];
          var from = this.services[this.indexOfServiceByName(flow.fromService)];
          var to = this.services[this.indexOfServiceByName(flow.toService)];
          this.modifyFlowFrom(flow, from);
          this.modifyFlowTo(flow, to);
          this.localStorageService.modifyFlow(flow);
        }
        for (var k=0; k<this.services.length; k++) {
          //Place the icons for iot devices connected at the services
          this.services[k].placeIotIcons();
        }
      }
      else {
        this.openErrorDialog('The chain is not connected');
        this.new();
      }
    }
    else {
      this.openErrorDialog('There is a cycle in the graph');
      this.new();
    }
    this.localStorageService.storeChainFile(this.createChainFile());
  }

  //Sort the services starting from a roots array
  sortServices(roots: Array<Service>) {
    var services = Array<Service>();
    for (var i=0; i<roots.length; i++) {
      //If services not contains the root, add it
      if (this.containsServiceById(services, roots[i]) == false) {
        services.push(roots[i]);
      }
      //Create the subtree from the root
      var subtree = this.createSubTree(roots[i].id);
      for (var j=0; j<subtree.length; j++) {
        //For every service in the subtree add it to services
        var index = this.indexOfServiceById(subtree[j]);
        var service = this.services[index];
        if (this.containsServiceById(services, service) == false) {
          services.push(service);
        }
      }
    }
    return services;
  }

  //Create a subtree starting from a root id
  createSubTree(root: number): Array<number> {
    //Get the index of the root
    var index = this.indexOfServiceById(root);
    var a = Array<number>();
    var b = Array<number>();
    //If there aren't connected services return []
    if (this.services[index].connectedServices.length == 0) return [];
    //For every service connected add it to array and create a subtree from this service recursively
    for (var i=0; i<this.services[index].connectedServices.length; i++) {
      b.push(this.services[index].connectedServices[i]);
      a = this.createSubTree(this.services[index].connectedServices[i]);
      for (var j in a) b.push(a[j]);
    }
    return b;
  }

  //BFS in order to assign the coordinates at the services
  BFS(root: Service){
    var q = Array<Service>();
    var visited = Array<number>();
    //Add the root to the queue
    q.push(root);
    //Add the root to the visited nodes
    visited.push(root.id);
    var  i = 0;
    //Get the measurements of the svg (needless for chain because we can't go to next row fo the services)
    //var svgdims = document.getElementById('svgchainelem').getBoundingClientRect();
    while (q.length > 0) {
      //Get the first node of the queue
      var t = q.splice(i, 1);
      //Visit t
      //if (visited.indexOf(t[0].id) >= 0) visited.push(t[0].id);
      //For every node adjacent to t
      for (var j=0; j<t[0].connectedServices.length; j++) {
        var sindex = this.indexOfServiceById(t[0].connectedServices[j]);
        var s = this.services[sindex];
        //Assign the x coordinate for every level
        if (s.x == 0) s.x = t[0].x + 150;
        if(visited.indexOf(s.id) < 0) {
          //Add the node to visited
          visited.push(s.id);
          //q.push(s);
        }
        //Add the node to the queue
        q.push(s);
      }
    }
  }

  /*--- ERROR CHECKING ---*/

  //DFS to detect cycle in the chain
  DFS(id: number, toVisit: Array<number>, visitedInThePath: Array<number>): boolean {
    //If it ends there is no cycle in this chain
    //If the id is present in the visited ids return false
    var index = this.indexOfServiceById(id);
    for (var i in visitedInThePath) {
      //If a node that are visited in the past is found now there is a cycle
      if (visitedInThePath[i] == id) {
        return true;
      }
    }
    //If there aren't other services to visit return false, because there is not cycle here
    if (this.services[index].connectedServices.length == 0) return false;
    //Add this square to visited
    visitedInThePath.push(id);
    //Check if the id is in the node to visit
    var c: boolean;
    for (var i in this.services[index].connectedServices) {
      //Get the index of the square to visit
      var ind = this.indexOfServiceById(this.services[index].connectedServices[i]);
      c = this.DFS(this.services[ind].id, this.services[ind].connectedServices, visitedInThePath);
      if (c == true) {
        //In this case there is a cycle, then stop now and return true to the upper level
        return true;
      }
      visitedInThePath.splice(visitedInThePath.length-1, 1);
    }
    return false;
  }

  //Check if the services are connected to others services
  checkIfConnected(roots: Array<Service>) {
    var found = false;
    var firstSubtree = Array<number>();
    for (var i=0; i<roots.length; i++) {
      //Create the subtree from the root for every root
      if (i == 0) firstSubtree = this.checkifCon(roots[i].id);
      else var a = this.checkifCon(roots[i].id);
      //If this is not the first root, check if the nodes in the subtree are part of the other root's subtrees
      if (i != 0) {
        var found = false;
        var k = 0;
        while (!found && k < a.length) {
          var z = 0;
          while (!found && z < firstSubtree.length) {
            if (firstSubtree[z] == a[k]) {
              found = true;
              break;
            }
            z++;
          }
          if (k == a.length-1 && found == false) {
            //console.log('in a subtree the nodes are reachable only from a root that is not the first');
            return false;
          }
          else k++;
        }
      }
    }

    return true;
  }

  //Check if a subtree is connected recursively
  checkifCon(root: number): Array<number> {
    var index = this.indexOfServiceById(root);
    var a = Array<number>();
    var b = Array<number>();
    if (this.services[index].connectedServices.length == 0) return [];
    for (var i=0; i<this.services[index].connectedServices.length; i++) {
      b.push(this.services[index].connectedServices[i]);
      a = this.checkifCon(this.services[index].connectedServices[i]);
      for (var j in a) b.push(a[j]);
    }
    return b;
  }

  /*--- ERROR CHECKING FOR SUBCHAIN ---*/

  //Check errors for the subchain (max latency constraint) and sort its services if the subchain is ok
  checkSubchain(sub: Subchain): number {
    var conns = 0;
    var isconns = 0;
    var first = 0;
    var last = 0;
    if (sub.services.length < 2) {
      return -1;
    }
    //Check if all the services have exactly one of the other services connected and exactly one of the other services has this connected, except the last
    for (var i=0; i<sub.services.length; i++) {
      //Get the index of service i
      var indexi = this.indexOfServiceById(sub.services[i].id);
      var si = this.services[indexi];
      for (var j=0; j<sub.services.length; j++) {
        if (j != i) {
          //Get the index of service j
          var indexj = this.indexOfServiceById(sub.services[j].id);
          var sj = this.services[indexj];
          //Check if the service i is connected to service j
          if (si.hasConnectedService(sj.id)) conns++;
          //Check if the service j is connected to service i
          if (sj.hasConnectedService(si.id)) isconns++;
        }
      }
      //If the service has not one of the others connected, probably it is the last
      if (conns == 0) last++;
      //The service has too much services connected
      //else if (conns > 1) return false;
      //If the service is not connected to one of the others, probably it is the first
      if (isconns == 0) first++;
      //The service is connected to more services
      //else if (isconns > 1) return false;
      //If there are more last service return false
      if (conns != 1 && last > 1) {
        return -2;
      }
      //If there are more first service return false
      else if (isconns != 1 && first > 1) {
        return -2;
      }
      else {
        conns = 0;
        isconns = 0; 
      }
    }
    //If there aren't first or last nodes there is a cycle in the subchain
    //if (first == 0 || last == 0) return -3;
    this.sortSubchainServices(sub);
    console.log(sub.services);
    return 1;
  }

  //Sort the services in the subchain
  sortSubchainServices(sub: Subchain) {
    var first = -1;
    var c = 0;
    var i = 0;
    for (var i=0; i<sub.services.length; i++) {
      c = i;
      //Get the index of the service i
      var indexi = this.indexOfServiceById(sub.services[i].id);
      var si = this.services[indexi];
      for (var j=0; j<sub.services.length; j++) {
        if (j != i) {
          //Check if the service j is connected to service i for each j != i
          var indexj = this.indexOfServiceById(sub.services[j].id);
          var sj = this.services[indexj];
          if (sj.hasConnectedService(si.id) == true) c = -1;
        }
      }
      //There are not service with the service i connected, because it's the first of the subchain
      if (c == i) {
        first = i;
      }
    }
    var tmp = Array<Service>();
    i = 0;
    tmp[i] = sub.services[first];
    while(i < sub.services.length) {
      var indexi = this.indexOfServiceById(tmp[i].id);
      var si = this.services[indexi];
      for (var k=0; k<sub.services.length; k++) {
        var indexk = this.indexOfServiceById(sub.services[k].id);
        var sk = this.services[indexk];
        if (si != undefined && si.hasConnectedService(sk.id) == true) {
          tmp[i+1] = sub.services[k];
          break;
        }
      }
      i++;
    }
    sub.services = tmp;
  }

}
