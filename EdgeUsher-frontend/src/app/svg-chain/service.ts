import { Rule, DialogData } from '../function-dialog/function-dialog.component';
import { SvgChainComponent } from '../svg-chain/svg-chain.component';
import { IotRequirement } from '../function-dialog/function-dialog.component';

export class Service {
  x = 0;
  y = 0;
  r = 0;
  connectedServices = Array<number>();
  id: number;
  name = 'Service name';
  serviceTime: number;
  hwReqs: number;
  iotReqs = Array<IotRequirement>();
  //securityRequirements = new Rule();
  securityRequirements = Array<Rule>();
  svg: SvgChainComponent;
  data: DialogData;
  cond = 'list';

  constructor(s: SvgChainComponent) {
    //Standard value for radius
    this.r = 35;
    this.svg = s;
  }

  //Place the iot icons inside the circle
  placeIotIcons() {
    var s = this.iotReqs;
    var radius = this.r/2;
    var angle = 0;
    for (var j=0; j<s.length; j++) {
      var elem = s[j];
      angle = ((j / s.length) * (2 * Math.PI));
      elem.x = this.x + (radius * Math.cos(angle));
      elem.y = this.y + (radius * Math.sin(angle));
    }
    this.svg.localStorageService.modifyService(this);
    this.svg.localStorageService.storeChainFile(this.svg.createChainFile());
  }

  /*--- MOUSE EVENTS HANDLING ---*/

  onMouseDown(event) {
    event.preventDefault();
    if (event.button == 0) {
      if (this.svg.movedService >= 0) {
        if (this.id != this.svg.movedService) {
          this.svg.openErrorDialog('Too close to another service');
        }
      }
      else if (this.svg.isChainMode >= 0) {
        //Do nothing
      }
      else {
        //Disable panning
        this.svg.svgPanZoom.disablePan();
        //Start to draw a flow
        this.svg.isDrawingLine = true;
        //Initialize the temporary flow
        this.svg.tmpFlow.coord1.x = this.x;
        this.svg.tmpFlow.coord1.y = this.y;
        this.svg.tmpFlow.coord2.x = this.x;
        this.svg.tmpFlow.coord2.y = this.y;
        //Show the temporary flow
        document.getElementById('tmp-flow').style.display = 'block';
        //Save the starting service (this)
        this.svg.service1 = this;
      }
    }
  }

  onMouseUp(event) {
    event.preventDefault();
    if (event.button == 0) {
      
      if (this.svg.isChainMode >= 0) {
        //If subchain contains this service remove it from subchain
        if (this.svg.tmpSubchain.containsById(this)) {
          this.svg.tmpSubchain.removeService(this);
        }
        //If subchain not contains this service add it
        else {
          this.svg.tmpSubchain.insertService(this);
        }
      }
      else if (this.svg.movedService == this.id) {
        if (this.svg.tooCloseToAnotherService(this) == false) {
          document.getElementById('service'+this.id).style.cursor = 'pointer';
          var index = this.svg.indexOfServiceById(this.svg.movedService);
          for (var i in this.svg.flows) {
            if (this.svg.flows[i].fromService == this.svg.services[index].name) {
              this.svg.modifyFlowFrom(this.svg.flows[i], this);
              this.svg.updateSubchainInterestedByFlow(this.svg.flows[i], 0);
              //Save the modified link
              this.svg.localStorageService.modifyFlow(this.svg.flows[i]);
            }
            if (this.svg.flows[i].toService == this.svg.services[index].name) {
              this.svg.modifyFlowTo(this.svg.flows[i], this);
              this.svg.updateSubchainInterestedByFlow(this.svg.flows[i], 0);
              this.svg.localStorageService.modifyFlow(this.svg.flows[i]);
            }
          }
          this.svg.movedService = -1;
          this.svg.localStorageService.modifyService(this);
          for (var j in this.svg.subchains) {
            if (this.svg.subchains[j].containsById(this)) {
              this.svg.subchains[j].modifyService(this);
              this.svg.localStorageService.modifySubchain(this.svg.subchains[j]);
            }
          }
        }
        else this.svg.openErrorDialog('Too close to another service');
      }
      else if (this.svg.isDrawingLine == true) {
        if (this.svg.service1.id == this.id) {
          if (this.svg.isOpenService(this.id) == false) {
            this.svg.openServiceMenu(this);
          }
          this.svg.cancelTmpFlow();
          this.svg.isDrawingLine = false;
          this.svg.svgPanZoom.enablePan();
        }
        else {
          this.svg.createFlowTo(this);
          this.svg.cancelTmpFlow();
          this.svg.isDrawingLine = false;
          this.svg.svgPanZoom.enablePan();
        }
      }
      this.svg.localStorageService.storeChainFile(this.svg.createChainFile());
    }
    this.svg.isDrawingLine = false;
    this.svg.clickToCreate = false;
    if (this.svg.dragging == true) {
      this.svg.lastX = -1;
      this.svg.lastY = -1;
      this.svg.movementY = 0;
      this.svg.movementX = 0;
    }
  }

  /*--- IOT REQUIREMENTS METHODS ---*/

  createIoTReqs() {
    var str = '';
    for (var i in this.iotReqs) {
      if (str == '') str = this.iotReqs[i].device;
      else str = str + ', ' + this.iotReqs[i].device;
    }
    return str;
  }

  /*--- CONNECTED SERVICES METHODS ---*/

  addConnectedService(id: number) {
    this.connectedServices.push(id);
  }
    
  removeConnectedService(id: number) {
    var i = this.connectedServices.indexOf(id);
    this.connectedServices.splice(i, 1);
  }
    
  hasConnectedService(id: number) {
    for (var i in this.connectedServices) {
      if (this.connectedServices[i] == id) return true;
    }
    return false;
  }

  /*--- SECURITY REQUIREMENTS METHODS ---*/

  saveReqCond(rule): string {
    var tmp = '';
    if (rule.cond == 'single') {
      return rule.singleReq;
    }
    else {
      for (var i in rule.nestedRules) {
        var rule1 = rule.nestedRules[i];
        if (tmp == '') tmp = this.saveReqCond(rule1);
        else tmp = tmp + ', ' + this.saveReqCond(rule1);
      }
      tmp = rule.cond + '(' + tmp +')';
    }
    return tmp
  }

  createSecReqs() {
    var secRule = '';
    if (this.cond == 'list') {
      for (var i in this.securityRequirements) {
        if (secRule == '') secRule = this.securityRequirements[i].singleReq;
        else secRule = secRule + ', ' + this.securityRequirements[i].singleReq;
      }
      secRule = '[' + secRule + ']';
    }
    else {
      var tmp = '';
      for (var i in this.securityRequirements) {
        if (tmp == '') tmp = this.saveReqCond(this.securityRequirements[i]);
        else tmp = tmp + ', ' + this.saveReqCond(this.securityRequirements[i]);
      }
      secRule = this.cond + '(' + tmp + ')';
    }
    return secRule;
    /*
    var req = '';
    if (this.securityRequirements.cond == 'list') {
      for (var i=0; i<this.securityRequirements.nestedRules.length; i++) {
        if (this.securityRequirements.nestedRules[i].cond == 'single') {
          if (req == '') req = this.securityRequirements.nestedRules[i].singleReq;
          else req = req + ', ' + this.securityRequirements.nestedRules[i].singleReq;
        }
        else {
          //Do nothing or print error
        }
      }
      req = '[' + req + ']';
    }
    else {
      for (var k in this.securityRequirements.nestedRules) {
        var rule1 = this.securityRequirements.nestedRules[k];
        var req1 = '';
        if (rule1.cond == 'single') {
          if (req == '') req = rule1.singleReq;
          else req = req + ', ' + rule1.singleReq;
        }
        else {
          for (var j in rule1.nestedRules) {
            var rule2 = rule1.nestedRules[j];
            var req2 = '';
            if (rule2.cond == 'single') {
              if (req1 == '') req1 = rule2.singleReq;
              else req1 = req1 + ', ' + rule2.singleReq;
            }
            else {
              for (var z in rule2.nestedRules) {
                var rule3 = rule2.nestedRules[z];
                if (rule3.cond == 'single') {
                  if (req2 == '') req2 = rule3.singleReq;
                  else req2 = req2 + ', ' + rule3.singleReq;
                }
                else {
                  //Not possible to reach, do nothing
                }
              }
              if (req1 == '') req1 = rule2.cond + '(' + req2 + ')';
              else req1 = req1 + ', ' + rule2.cond + '(' + req2 + ')';
            }
          }
          if (req == '') req = rule1.cond + '(' + req1 + ')';
          else req = req + ', ' + rule1.cond + '(' + req1 + ')';
        }
      }
      req = this.securityRequirements.cond + '(' + req + ')'
    }
    return req;*/
  }

}