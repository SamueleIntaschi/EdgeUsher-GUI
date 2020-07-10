import {Component, Inject, Output, EventEmitter, OnInit} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import { Node } from '../svg-infrastructure/node';
import { HttpService } from '../http-service.service';
import { ChainErrorCheckingService } from '../chain-error-checking.service';

//TODO: gestire procedura per recuperare icone tramite il server

export interface SecurityCapabilities {
  virtualisation: {
    accessLogs: boolean,
    auth: boolean,
    hIds: boolean,
    procIsol: boolean,
    permMdl: boolean,
    resMon: boolean,
    restPnts: boolean,
    userIsol: boolean
  };
  communications: {
    certificates: boolean,
    firewall: boolean,
    dataEncr: boolean,
    nodeIsol: boolean,
    netIDS: boolean,
    keyCrypt: boolean,
    wirelessSec: boolean
  };
  data: {
    backup: boolean,
    encrStorage: boolean,
    obfsStorage: boolean
  };
  physical: {
    accessCtrl: boolean,
    antiTamp: boolean
  },
  other: {
    audit: boolean
  }
}

export interface NodeFields {
  hwCaps: number;
  iotCaps: Array<string>;
  secCaps: SecurityCapabilities;
}

export interface DialogData {
  name: string;
  id: number;    
  singleValue: NodeFields;
  probs: Array<NodeProb>;
  imageUrl: string;
  probabilisticMode: boolean;
  nodes: Array<Node>;
}

export interface NodeProb {
  prob: number,
  value: NodeFields,
}

@Component({
  selector: 'app-node-dialog',
  templateUrl: './node-dialog.component.html',
  styleUrls: ['./node-dialog.component.css']
})
export class NodeDialogComponent implements OnInit {

  err = '';
  icons: Array<string> = [
    "../../icons/network/file-server.svg",
    "../../icons/network/micro-webserver.svg",
    "../../icons/network/cloud.svg",
    "../../icons/network/building.svg",
    "../../icons/network/pc.svg",
    "../../icons/network/relational-database.svg",
    "../../icons/network/server.svg",
    "../../icons/network/external-media-drive.svg",
    "../../icons/network/ring-network.svg",
    "../../icons/network/ups.svg",
  ];
  probs: Array<NodeProb> = this.data.probs;
  
  constructor(private http: HttpService, 
    public dialogRef: MatDialogRef<NodeDialogComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: DialogData, 
    public dialog: MatDialog,
    private errorService: ChainErrorCheckingService) {    }

  @Output() deleteSquare = new EventEmitter<number>();   
  @Output() createSquare = new EventEmitter<DialogData>();

  /*--- DIALOG ACTIONS ---*/

  ngOnInit() {
    /*this.http.getIcons().then(result => {
      console.log(result);
    });*/
  }

  onClose() {
    this.dialogRef.close();
  }

  onChangeProb(event) {
    if (event == true) {
      //Case pass from no probs to probs
      this.data.probabilisticMode = true;
    }
    else {
      //Case pass from probs to no probs
      this.data.probabilisticMode = false;
    }
  }

  /*--- IOT device connected ---*/
  addDevice(prob: NodeProb) {
    if (this.data.probabilisticMode == false) {
      var device = '';
      this.data.singleValue.iotCaps.push(device);
    }
    else {
      var device = '';
      prob.value.iotCaps.push(device);
    }
  }

  deleteDevice(s: string, prob) {
    if (this.data.probabilisticMode == true) {
      for (var i=0; i<this.data.singleValue.iotCaps.length; i++) {
        if (this.data.singleValue.iotCaps[i] == s) {
          this.data.singleValue.iotCaps.splice(i, 1);
          i--;
          break;
        }
      }
    }
    else {
      for (var i=0; i<prob.value.iotCaps.length; i++) {
        if (prob.value.iotCaps[i] == s) {
          prob.value.iotCaps.splice(i, 1);
          i--;
          break;
        }
      }
    }
  }

  createIotReqString(iots: Array<string>) {
    var str = '';
    if (this.data.probabilisticMode == false) {
      for (var i=0; i<iots.length; i++) {
        if (i == 0) str = iots[i];
        else str = str + ', ' + iots[i];
      }
    }
    str = '[' + str + ']';
    return str;
  }

  trackByFn(index: any, item: any) {
    return index;
  } 

  /*- Hardware capabilities -*/
  addProbability() {
    this.probs.push({
      prob: 0,
      value: {
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
    });
  }

  deleteProbability(prob) {
    for (var i=0; i < this.probs.length; i++) {
      if (this.probs[i] == prob) {
        this.probs.splice(i, 1);
        break;
      }
    }
  }

  /*--- Icons methods ---*/

  onIconClick(event) {
    event.preventDefault();
    if (event.button == 0) {
      var icons = document.getElementsByClassName('icon') as HTMLCollectionOf<HTMLElement>;
      for (var i=0; i<icons.length; i++) {
        icons[i].style.border = 'none';
      }
      this.data.imageUrl = event.target.src;
      document.getElementById(event.target.id).style.border = '1px solid';
      document.getElementById(event.target.id).style.borderColor = 'red';
    }
  }


  /*--- BUTTONS ACTION ---*/

  onDeleteClick(event): void {
      this.deleteSquare.emit(this.data.id);
      this.dialogRef.close();
  }

  onCreateClick(data): void {
      var errs = this.checkIfCorrect();
      if (errs == 0) {
        this.createSquare.emit(data);
        this.dialogRef.close();
      }
  }

  /*--- ERROR CHECKING ---*/
  checkIfCorrect(): number {
    var errs = 0;
    var errType = 0;
    if (this.data.probabilisticMode == true) {
      errType = this.checkProbability();
      if (errType == -1) {
        this.err = "The total probability is not correct";
        errs++;
      }
      else if (errType == -2) {
        this.err = 'No probability specified';
        errs++;
      }
    }
    if ((errType = this.checkName()) != 1) {
      if (errType == -1) this.err = 'Node name not specified';
      //else if (errType == -2) this.err = 'There are spaces in the name';
      else if (errType == -3) this.err = 'A node with this name already exists';
      else if (errType == -4) this.err = 'There is characters in the name that are not allowed';
      errs++;
    }
    else if ((errType = this.checkHardwareCaps()) != 1) {
      if (errType == -1) this.err = 'An hardware capability is not a number';
      else if (errType == -2) this.err = 'The hardware capability is not a number';
      else if (errType == -3) this.err = 'Hardware capability not specified';
      else if (errType == -4) this.err = 'Hardware capability must be a positive number';
      errs++;
    }
    else if (this.checkIotCaps() == false) {
      this.err = 'There are spaces in an IoT device connected';
      errs++;
    }
    else if (this.data.imageUrl == undefined || this.data.imageUrl == '') {
      this.err = 'No icon selected';
      errs++;
    }
    return errs;
  }

  checkName() {
    if (!this.data.name) return -1;
    else if (this.data.name == '') {
      return -1;
    }
    else {
      if (this.errorService.checkSpecialCharacters(this.data.name) != 1) return -4;
      if (this.data.name.indexOf(' ') >= 0) {
        //Delete the spaces in the name
        var splitted = this.data.name.split(" ");
        for (var i in splitted) {
          if (Number(i) == 0) this.data.name = splitted[i];
          else this.data.name = this.data.name + '_' + splitted[i];
        }
        //Delete the upper case
        this.data.name = this.data.name.toLowerCase();
      }
      //Delete the uppercase from the starting character
      this.data.name = this.data.name[0].toLowerCase() + this.data.name.substr(1);
      //Check if now there are duplicates
      for (var i in this.data.nodes) {
        if (this.data.nodes[i].name == this.data.name) {
          return -3;
        }
      } 
    }
    return 1;
  }

  checkProbability() {
    var sum = 0;
    if (this.data.probs.length == 0) {
      return -2;
    }
    for (var i in this.probs) {
      if (isNaN(Number(this.probs[i].prob)) == true) return -1;
      sum += Number(this.probs[i].prob);
    }
    if (Number(sum) > 1 || Number(sum < 0)) return -1;
    else return 1;
  }

  checkHardwareCaps(): number {
    if (this.data.probabilisticMode == true) {
      for (var j in this.probs) {
        var p = this.probs[j];
        if (!p.value.hwCaps) return -3;
        else if (isNaN(Number(p.value.hwCaps)) == true) {
          return -1;
        }
        else if (Number(p.value.hwCaps) < 0 ) {
          return -4;
        }
        p.value.hwCaps = Number(p.value.hwCaps);
      }
    }
    else {
      if (!this.data.singleValue.hwCaps) return -3;
      else if (isNaN(Number(this.data.singleValue.hwCaps)) == true) return -2;
      else if (Number(this.data.singleValue.hwCaps) < 0) return -4;
      this.data.singleValue.hwCaps = Number(this.data.singleValue.hwCaps);
    }
    
    return 1;
  }

  checkIotCaps() {
    if (this.data.probabilisticMode == false) {
      for (var i=0; i<this.data.singleValue.iotCaps.length; i++) {
        var elem = this.data.singleValue.iotCaps[i];
        //Remove the element if it's empty
        if (elem == '') {
          this.data.singleValue.iotCaps.splice(i, 1);
        }
        else if (this.errorService.checkSpecialCharacters(elem) != 1) {
          var input = document.getElementById('device' + i);
          input.style.border = 'solid';
          input.style.borderColor = 'red';
          return false;
        }
        //Check if there are spaces in the device name
        else if (elem.indexOf(' ') >= 0) {
          var input = document.getElementById('device' + i);
          input.style.border = 'solid';
          input.style.borderColor = 'red';
          return false;
        }
        else {
          var input = document.getElementById('device' + i);
          input.style.border = 'none';
          input.style.borderColor = 'black';
        }
      }
    }
    else {
      for (var j in this.probs) {
        var p = this.probs[j];
        for (var i=0; i<p.value.iotCaps.length; i++) {
          var elem = p.value.iotCaps[i];
          //Remove the element if it's empty
          if (elem == '') {
            this.data.singleValue.iotCaps.splice(i, 1);
          }
          else if (this.errorService.checkSpecialCharacters(elem) != 1) {
            var input = document.getElementById('device' + i);
            input.style.border = 'solid';
            input.style.borderColor = 'red';
            return false;
          }
          //Check if there are spaces in the device name
          else if (elem.indexOf(' ') >= 0) {
            var input = document.getElementById('device' + i);
            input.style.border = 'solid';
            input.style.borderColor = 'red';
            return false;
          }
          else {
            var input = document.getElementById('device' + i);
            input.style.border = 'none';
            input.style.borderColor = 'black';
          }
        }
      }
    }
  }

  
}
