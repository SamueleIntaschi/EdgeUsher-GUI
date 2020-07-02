import { SvgInfrastructureComponent } from './svg-infrastructure.component';
import { Link } from './link';
import { NodeProb, NodeFields, SecurityCapabilities, DialogData } from '../node-dialog/node-dialog.component';

export class Node {

  name: string;
  x: number;
  y: number;
  height: number;
  width: number;
  id: number;
  imageUrl: string;
  connectedNodes = Array<number>();
  probabilistic = false;

  probs: Array<NodeProb> = [];

  singleValue: NodeFields =  {
    hwCaps: 0,
    iotCaps: [],
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
    },
  };
  secCapsString = '';
  strHwCaps = '';
  strIotCaps = '';
  svg: SvgInfrastructureComponent;
  data: DialogData;

  constructor(s: SvgInfrastructureComponent) {
    this.svg = s;
    this.height = 50;
    this.width = 50;
  }

  onMouseDown(event) {
    event.preventDefault();
    if (event.button == 0) {
      if (this.svg.movedSquare >= 0) {
        if (this.id != this.svg.movedSquare) {
          this.svg.openErrorDialog('Too close to another node');
        }
      }
      else {
        this.svg.svgPanZoom.disablePan();
        this.svg.isDrawingLine = true;
        this.svg.tmpLink.x1 = this.x;
        this.svg.tmpLink.y1 = this.y;
        this.svg.tmpLink.x2 = this.x;
        this.svg.tmpLink.y2 = this.y;
        //document.getElementById('tmp-link').style.display = 'block';
        this.svg.node1 = this;
      }
    }
  }

  onMouseMove(event) {}

  onMouseUp(event) {
    event.preventDefault();
    if (event.button == 0) {
      
      if (this.svg.movedSquare == this.id) { 
        if (this.svg.tooCloseToAnotherNode(this) == false) {
          document.getElementById('node'+this.id).style.cursor = 'pointer';
          var index = this.svg.indexOfSquareById(this.svg.movedSquare);
          for (var i in this.svg.links) {
            if (this.svg.links[i].fromNode == this.svg.nodes[index].name) {
              //this.svg.links[i].x1 = this.svg.nodes[index].x;
              //this.svg.links[i].y1 = this.svg.nodes[index].y;
              this.svg.links[i].modifyLinkFrom(this.svg.nodes[index]);
              //Save the modified link
              this.svg.localStorageService.modifyLink(this.svg.links[i]);
            }
            if (this.svg.links[i].toNode == this.svg.nodes[index].name) {
              //this.svg.links[i].x2 = this.svg.nodes[index].x;
              //this.svg.links[i].y2 = this.svg.nodes[index].y;
              this.svg.links[i].modifyLinkto(this.svg.nodes[index]);
              this.svg.localStorageService.modifyLink(this.svg.links[i]);
            }
          }
          this.svg.movedSquare = -1;
          this.svg.localStorageService.modifyNode(this);
        }
        else this.svg.openErrorDialog('Too close to another node!');
      }
      else if (this.svg.isDrawingLine == true) {
        if (this.svg.node1.id == this.id) {
          if (this.svg.isOpenNode(this.id) == false) {
            //TODO aggiungere il dialog a quelli aperti nel metodo stesso, farlo anche per i link menu
            this.svg.openNodeDialogs.push(this.id);
            this.svg.openNodeMenu(this);
          }
          this.svg.cancelTmpLink();
          this.svg.isDrawingLine = false;
          this.svg.svgPanZoom.enablePan();
        }
        else {
          this.svg.createLinkTo(this);
          this.svg.cancelTmpLink();
          this.svg.isDrawingLine = false;
          this.svg.svgPanZoom.enablePan();
        }
      }
    }
    this.svg.localStorageService.storeInfrastructureFile(this.svg.createInfrastructureFile());
    this.svg.isDrawingLine = false;
    this.svg.clickToCreate = false;
    if (this.svg.dragging) {
      this.svg.lastX = -1;
      this.svg.lastY = -1;
      this.svg.movementY = 0;
      this.svg.movementX = 0;
    }
  }

  createIoTCaps() {
    var str = '';
    for (var i in this.singleValue.iotCaps) {
      if (str == '') str = this.singleValue.iotCaps[i];
      else str = str + ', ' + this.singleValue.iotCaps[i];
    }
    return str;
  }

  createProbIoTCaps(prob: NodeProb) {
    var str = '';
    for (var i in prob.value.iotCaps) {
      if (str == '') str = prob.value.iotCaps[i];
      else str = str + ', ' + prob.value.iotCaps[i];
    }
    return str;
  }


  updateSecCaps(sec: string) {
    //Virtualisation requisites
    if (sec == 'access_logs') {
      this.singleValue.secCaps.virtualisation.accessLogs = true;
    }
    if (sec == 'authentication') {
      this.singleValue.secCaps.virtualisation.auth = true
    }
    if (sec == 'host_IDS') {
      this.singleValue.secCaps.virtualisation.hIds = true;
    }
    if (sec == 'process_isolation') {
      this.singleValue.secCaps.virtualisation.procIsol = true;
    }
    if (sec == 'permission_model') {
      this.singleValue.secCaps.virtualisation.permMdl = true;
    }
    if (sec == 'resource_monitoring') {
      this.singleValue.secCaps.virtualisation.resMon = true;
    }
    if (sec == 'restore_points') {
      this.singleValue.secCaps.virtualisation.restPnts = true;
    }
    if (sec == 'user_data_isolation') {
      this.singleValue.secCaps.virtualisation.userIsol = true;
    }
    //Communications requisites
    if (sec == 'certificates') {
      this.singleValue.secCaps.communications.certificates = true;
    }
    if (sec == 'firewall') {
      this.singleValue.secCaps.communications.firewall = true;
    }
    if (sec == 'iot_data_encryption') {
      this.singleValue.secCaps.communications.dataEncr = true;
    }
    if (sec == 'node_isolation_mechanisms') {
      this.singleValue.secCaps.communications.nodeIsol = true;
    }
    if (sec == 'network_IDS') {
      this.singleValue.secCaps.communications.netIDS = true;
    }
    if (sec == 'pki') {
      this.singleValue.secCaps.communications.keyCrypt = true;
    }
    if (sec == 'wireless_security') {
      this.singleValue.secCaps.communications.wirelessSec = true;
    }
    //Data requisites
    if (sec == 'backup') {
      this.singleValue.secCaps.data.backup = true;
    }
    if (sec == 'encrypted_storage') {
      this.singleValue.secCaps.data.encrStorage = true;
    }
    if (sec == 'obfuscated_storage') {
      this.singleValue.secCaps.data.obfsStorage = true;
    }
    //Physiscal requisites
    if (sec == 'access_control') {
      this.singleValue.secCaps.physical.accessCtrl = true;
    }
    if (sec == 'anti_tampering') {
      this.singleValue.secCaps.physical.antiTamp = true;
    }
    //Other requisites
    if (sec == 'audit') {
      this.singleValue.secCaps.other.audit = true;
    }
  }

  createSecCaps() {
    var str = '';
    var and  = 0;
    //Virtualisation requisites
    if (this.singleValue.secCaps.virtualisation.accessLogs == true) {
      str = 'access_logs';
      and++;
    }
    if (this.singleValue.secCaps.virtualisation.auth == true) {
      if (and > 0) str = str + ', authentication';
      else str = 'authentication';
      and++;
    }
    if (this.singleValue.secCaps.virtualisation.hIds == true) {
      if (and > 0) str = str + ', host_IDS';
      else str = 'host_IDS';
      and++;
    }
    if (this.singleValue.secCaps.virtualisation.procIsol) {
      if (and > 0) str = str + ', process_isolation';
      else str = 'process_isolation';
      and++;
    }
    if (this.singleValue.secCaps.virtualisation.permMdl) {
      if (and > 0) str = str + ', permission_model';
      else str = 'permission_model';
      and++;
    }
    if (this.singleValue.secCaps.virtualisation.resMon) {
      if (and > 0) str = str + ', resource_monitoring';
      else str = 'resource_usage_monitoring';
      and++;
    }
    if (this.singleValue.secCaps.virtualisation.restPnts) {
      if (and > 0) str = str + ', restore_points';
      else str = 'restore_points';
      and++;
    }
    if (this.singleValue.secCaps.virtualisation.userIsol) {
      if (and > 0) str = str + ', user_data_isolation';
      else str = 'user_data_isolation';
      and++;
    }
    //Communications requisites
    if (this.singleValue.secCaps.communications.certificates == true) {
      if (and > 0) str = str + ', certificates';
      else str = 'certificates';
      and++;
    }
    if (this.singleValue.secCaps.communications.firewall == true) {
      if (and > 0) str = str + ', firewall';
      else str = str + 'firewall';
      and++;
    }
    if (this.singleValue.secCaps.communications.dataEncr) {
      if (and > 0) str = str + ', iot_data_encryption';
      else str = str + 'IoT_data_encryption';
      and++;
    }
    if (this.singleValue.secCaps.communications.nodeIsol) {
      if (and > 0) str = str + ', node_isolation_mechanisms';
      else str = str + 'node_isolation_mechanisms';
      and++;
    }
    if (this.singleValue.secCaps.communications.netIDS) {
      if (and > 0) str = str + ', network_IDS';
      else str = str + 'network_IDS';
      and++;
    }
    if (this.singleValue.secCaps.communications.keyCrypt) {
      if (and > 0) str = str + ', pki';
      else str = str + 'pki';
      and++;
    }
    if (this.singleValue.secCaps.communications.wirelessSec) {
      if (and > 0) str = str + ', wireless_security';
      else str = str + 'wireless_security';
      and++;
    }
    //Data requisites
    if (this.singleValue.secCaps.data.backup) {
      if (and > 0) str = str + ', backup';
      else str = str + 'backup';
      and++;
    }
    if (this.singleValue.secCaps.data.encrStorage) {
      if (and > 0) str = str + ', encrypted_storage';
      else str = str + 'encrypted_storage';
      and++;
    }
    if (this.singleValue.secCaps.data.obfsStorage) {
      if (and > 0) str = str + ', obfuscated_storage';
      else str = str + 'obfuscated_storage';
      and++;
    }
    //Physiscal requisites
    if (this.singleValue.secCaps.physical.accessCtrl) {
      if (and > 0) str = str + ', access_control';
      else str = str + 'access_control';
      and++;
    }
    if (this.singleValue.secCaps.physical.antiTamp) {
      if (and > 0) str = str + ', anti_tampering';
      else str = str + 'anti_tampering';
      and++;
    }
    //Other requisites
    if (this.singleValue.secCaps.other.audit) {
      if (and > 0) str = str + ', audit';
      else str = 'audit';
      and++;
    }
    return str;
  }

  createProbSecCaps(prob: NodeProb) {
    var str = '';
    var and  = 0;
    //Virtualisation requisites
    if (prob.value.secCaps.virtualisation.accessLogs == true) {
      str = 'access_logs';
      and++;
    }
    if (prob.value.secCaps.virtualisation.auth == true) {
      if (and > 0) str = str + ', authentication';
      else str = 'authentication';
      and++;
    }
    if (prob.value.secCaps.virtualisation.hIds == true) {
      if (and > 0) str = str + ', host_IDS';
      else str = 'host_IDS';
      and++;
    }
    if (prob.value.secCaps.virtualisation.procIsol) {
      if (and > 0) str = str + ', process_isolation';
      else str = 'process_isolation';
      and++;
    }
    if (prob.value.secCaps.virtualisation.permMdl) {
      if (and > 0) str = str + ', permission_model';
      else str = 'permission_model';
      and++;
    }
    if (prob.value.secCaps.virtualisation.resMon) {
      if (and > 0) str = str + ', resource_monitoring';
      else str = 'resource_monitoring';
      and++;
    }
    if (prob.value.secCaps.virtualisation.restPnts) {
      if (and > 0) str = str + ', restore_points';
      else str = 'restore_points';
      and++;
    }
    if (prob.value.secCaps.virtualisation.userIsol) {
      if (and > 0) str = str + ', user_data_isolation';
      else str = 'user_data_isolation';
      and++;
    }
    //Communications requisites
    if (prob.value.secCaps.communications.certificates == true) {
      if (and > 0) str = str + ', certificates';
      else str = 'certificates';
      and++;
    }
    if (prob.value.secCaps.communications.firewall == true) {
      if (and > 0) str = str + ', firewall';
      else str = str + 'firewall';
      and++;
    }
    if (prob.value.secCaps.communications.dataEncr) {
      if (and > 0) str = str + ', iot_data_encryption';
      else str = str + 'iot_data_encryption';
      and++;
    }
    if (prob.value.secCaps.communications.nodeIsol) {
      if (and > 0) str = str + ', node_isolation_mechanisms';
      else str = str + 'node_isolation_mechanisms';
      and++;
    }
    if (prob.value.secCaps.communications.netIDS) {
      if (and > 0) str = str + ', network_IDS';
      else str = str + 'network_IDS';
      and++;
    }
    if (prob.value.secCaps.communications.keyCrypt) {
      if (and > 0) str = str + ', pki';
      else str = str + 'pki';
      and++;
    }
    if (prob.value.secCaps.communications.wirelessSec) {
      if (and > 0) str = str + ', wireless_security';
      else str = str + 'wireless_security';
      and++;
    }
    //Data requisites
    if (prob.value.secCaps.data.backup) {
      if (and > 0) str = str + ', backup';
      else str = str + 'backup';
      and++;
    }
    if (prob.value.secCaps.data.encrStorage) {
      if (and > 0) str = str + ', encrypted_storage';
      else str = str + 'encrypted_storage';
      and++;
    }
    if (prob.value.secCaps.data.obfsStorage) {
      if (and > 0) str = str + ', obfuscated_storage';
      else str = str + 'obfuscated_storage';
      and++;
    }
    //Physiscal requisites
    if (prob.value.secCaps.physical.accessCtrl) {
      if (and > 0) str = str + ', access_control';
      else str = str + 'access_control';
      and++;
    }
    if (prob.value.secCaps.physical.antiTamp) {
      if (and > 0) str = str + ', anti_tampering';
      else str = str + 'anti_tampering';
      and++;
    }
    //Other requisites
    if (prob.value.secCaps.other.audit) {
      if (and > 0) str = str + ', audit';
      else str = 'audit';
      and++;
    }
    return str;
  }

    
}
