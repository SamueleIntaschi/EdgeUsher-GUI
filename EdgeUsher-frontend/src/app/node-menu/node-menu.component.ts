import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {Component, Inject, Output, EventEmitter, OnInit} from '@angular/core';
import {DialogData, NodeProb, NodeFields, SecurityCapabilities} from '../node-dialog/node-dialog.component';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';


@Component({
  selector: 'app-node-menu',
  templateUrl: './node-menu.component.html',
  styleUrls: ['./node-menu.component.css']
})
export class NodeMenuComponent implements OnInit {

  err = '';
  probs: Array<NodeProb> = JSON.parse(JSON.stringify(this.data.probs));
  singleValue: NodeFields = JSON.parse(JSON.stringify(this.data.singleValue));
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
  ]

  constructor(public dialogRef: MatDialogRef<NodeMenuComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData, public dialog: MatDialog) {    }

  @Output() deleteSquare = new EventEmitter<number>();
  @Output() createSquare = new EventEmitter<DialogData>();
  @Output() moveSquare = new EventEmitter<number>();
  @Output() closeClick = new EventEmitter<number>();

  ngOnInit() {
  }

  onChangeProb(event) {
    
  }

  /*--- DIALOG ACTIONS ---*/

  /*--- IOT device connected ---*/
  addDevice(prob: NodeProb) {
    if (this.data.probabilisticMode == false) {
      var device = '';
      this.singleValue.iotCaps.push(device);
    }
    else {
      var device = '';
      prob.value.iotCaps.push(device);
    }
  }

  deleteDevice(s: string, prob: NodeProb) {
    if (this.data.probabilisticMode == false) {
      for (var i=0; i<this.singleValue.iotCaps.length; i++) {
        if (this.singleValue.iotCaps[i] == s) {
          this.singleValue.iotCaps.splice(i, 1);
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
    console.log(this.probs);
  }

  deleteProbability(prob: NodeProb) {
    for (var i=0; i < this.probs.length; i++) {
      if (this.probs[i] == prob) {
        this.probs.splice(i, 1);
        break;
      }
    }
  }

  onIconClick(event) {
    var icons = document.getElementsByClassName('icon') as HTMLCollectionOf<HTMLElement>;
    for (var i=0; i<icons.length; i++) {
      icons[i].style.border = 'none';
    }
    if (event.button == 0) {
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
    var errs = this.checkIfCorrect() ;
    if (errs == 0) {
      this.data.probs = this.probs;
      this.data.singleValue = this.singleValue;
      this.createSquare.emit(data);
      this.dialogRef.close();
    }
  }

  onMoveClick(event) {
    this.moveSquare.emit(1);
  }

  onClose() {
    this.closeClick.emit(1);
    this.dialogRef.close();
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
    }
    if ((errType = this.checkName()) != 1) {
      if (errType == -1) this.err = 'Node name not specified';
      else if (errType == -2) this.err = 'There are spaces in the name';
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
      var cnter = this.data.name.indexOf('::') + this.data.name.indexOf('[') +
      this.data.name.indexOf(']') + this.data.name.indexOf('(') + this.data.name.indexOf(')');
      if (cnter >= 0) return -4;
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
        if (this.data.nodes[i].name == this.data.name && this.data.nodes[i].id != this.data.id) {
          return -3;
        }
      } 
      
    }
    
    return 1;
  }

  checkProbability() {
    //Check if the sum of probabilities is 100%
    var sum = 0;
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
        else if (Number(p.value.hwCaps) < 0) {
          return -4;
        }
        p.value.hwCaps = Number(p.value.hwCaps);
      }
    }
    else {
      if (!this.singleValue.hwCaps) return -3;
      else if (isNaN(Number(this.singleValue.hwCaps)) == true) return -2;
      else if (Number(this.singleValue.hwCaps) < 0) {
        return -4;
      }
      this.singleValue.hwCaps = Number(this.singleValue.hwCaps);
    }
    return 1;
  }

  checkIotCaps() {
    if (this.data.probabilisticMode == false) {
      for (var i=0; i<this.singleValue.iotCaps.length; i++) {
        var elem = this.singleValue.iotCaps[i];
        //Remove the element if it's empty
        if (!elem || elem == '' || elem == ' ') {
          this.singleValue.iotCaps.splice(i, 1);
          i--;
        }
        //Check if there are spaces in the device name
        else if (elem.indexOf(' ') >= 0) {
          var input = document.getElementById('node-' + this.data.id +  '-device-no-probs-' + i);
          input.style.border = 'solid';
          input.style.borderColor = 'red';
          return false;
        }
        else {
          elem = elem.trim().toLowerCase();
          var input = document.getElementById('node-' + this.data.id +  '-device-no-probs-' + i);
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
            p.value.iotCaps.splice(i, 1);
          }
          //Check if there are spaces in the device name
          else if (elem.indexOf(' ') >= 0) {
            var input = document.getElementById('node-' + this.data.id + '-device-' + i + '-prob-' + Number(j));
            input.style.border = 'solid';
            input.style.borderColor = 'red';
            return false;
          }
          else {
            var input = document.getElementById('node-' + this.data.id + '-device-' + i + '-prob-' + Number(j));
            input.style.border = 'none';
            input.style.borderColor = 'black';
          }
        }
      }
    }
  }
}
