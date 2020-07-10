import {Component, Inject, Output, EventEmitter} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import { QueryBuilderConfig } from 'angular2-query-builder';
import { Service } from '../svg-chain/service';
import { ChainErrorCheckingService } from '../chain-error-checking.service';

export interface DialogData {
  name: string;
  id: number;    
  serviceTime: number;
  hwReqs: number;
  iotReqs: Array<IotRequirement>;
  functions: Array<Service>;
  cond: string;
  securityRequirements: Array<Rule>;
}

export interface IotRequirement {
  device: string;
  imgUrl: string;
  //Coordinate for the icons
  x: number;
  y: number;
}

export interface Rule {
  cond: string;
  singleReq: string;
  nestedRules: Array<Rule>;
}

export class SecRequirement {
  name: string;
  id: string;
}
  
@Component({
  selector: 'function-dialog',
  templateUrl: 'function-dialog.component.html',
  styleUrls: ['function-dialog.component.css']
})

export class ServiceDialogComponent {

  err = '';
  secRequisites = [
    {name: 'Access logs', id: 'access_logs'},
    {name: 'Authentication', id: 'authentication'},
    {name: 'Host IDS', id: 'host_IDS'},
    {name: 'Process isolation', id: 'process_isolation'},
    {name: 'Permission model', id: 'permission_model'},
    {name: 'Resource usage monitoring', id: 'resource_monitoring'},
    {name: 'Restore points', id: 'restore_points'},
    {name: 'User data isolation', id: 'user_data_isolation'},
    {name: 'Certificates', id: 'certificates'},
    {name: 'Firewall', id: 'firewall'},
    {name: 'IoT data encryption', id: 'iot_data_encryption'},
    {name: 'Node isolation mechanisms', id: 'node_isolation_mechanisms'},
    {name: 'Network IDS', id: 'network_IDS'},
    {name: 'Public key cryptography', id: 'pki'},
    {name: 'Wireless security', id: 'wireless_security'},
    {name: 'Backup', id: 'backup'},
    {name: 'Encrypted storage', id: 'encrypted_storage'},
    {name: 'Obfuscated storage', id: 'obfuscated_storage'},
    {name: 'Access control', id: 'access_control'},
    {name: 'Anti-tampering capabilities', id: 'anti_tampering'},
    {name: 'Audit', id: 'audit'}
  ];
  icons: Array<string> = [
    "../../icons/devices/light.png",
    "../../icons/devices/bicycle.png",
    "../../icons/devices/camera.png",
    "../../icons/devices/coffeepot.png",
    "../../icons/devices/doorlock.png",
    "../../icons/devices/car.png",
    "../../icons/devices/generic.png"
  ];
  firstRule = this.data.securityRequirements;
  cond = 'list';
  rules: Array<Rule> = this.data.securityRequirements;

  constructor(private errorService: ChainErrorCheckingService, 
    public dialogRef: MatDialogRef<ServiceDialogComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: DialogData, 
    public dialog: MatDialog) {}

  @Output() deleteSquare = new EventEmitter<number>();   
  @Output() createSquare = new EventEmitter<DialogData>();
  @Output() moveSquare = new EventEmitter<number>();
  @Output() closeClick = new EventEmitter<number>();


  /*--- IOT device connected ---*/

  onIconClick(event, device) {
    event.preventDefault();
    if (event.button == 0) {
      //Border all icon with none
      var index = this.indexOfDevice(device);
      var icons = document.getElementsByClassName('icon' + index) as HTMLCollectionOf<HTMLElement>;
      for (var i=0; i<icons.length; i++) {
        icons[i].style.border = 'none';
      }
      //Set the icon selected and border this with red
      device.imgUrl = event.target.src;
      document.getElementById(event.target.id).style.border = '1px solid';
      document.getElementById(event.target.id).style.borderColor = 'red';
    }
  }

  addDevice() {
    var device = {
      device: '',
      imgUrl: '',
      x: 0,
      y: 0,
    }
    this.data.iotReqs.push(device);
  }

  deleteDevice(s: string) {
    for (var i=0; i<this.data.iotReqs.length; i++) {
      if (this.data.iotReqs[i].device == s) {
        this.data.iotReqs.splice(i, 1);
        i--;
        break;
      }
    }
  }

  indexOfDevice(s: string) {
    for (var i=0; i<this.data.iotReqs.length; i++) {
      if (this.data.iotReqs[i].device == s) return i;
    }
    return -1;
  }

  createIotReqString() {
    var str = '';
    for (var i=0; i<this.data.iotReqs.length; i++) {
      if (i == 0) str = this.data.iotReqs[i].device;
      else str = str + ', ' + this.data.iotReqs[i].device;
    }
    str = '[' + str + ']';
    return str;
  }

  trackByFn(index: any, item: any) {
    return index;
  } 

  /*--- SECURITY REQUIREMENTS METHODS ---*/

  updateSecRules(event) {
    this.data.securityRequirements = event;
  }

  updateCond(event) {
    this.data.cond = event;
  }

  /*--- DIALOG METHOD ---*/

  onClose() {
    this.closeClick.emit(1);
    this.dialogRef.close();
  }

  onCreateClick(data): void {
    //Check if there are errors and adjust the parameters
    var errs = this.checkIfErrors();
    if (errs == 0) { 
      this.createSquare.emit(data);
      this.dialogRef.close();
    }
  }

  onMoveClick(event) {
    this.moveSquare.emit(1);
    this.dialogRef.close();
  }

  onDeleteClick(event): void {
    this.deleteSquare.emit(this.data.id);
    this.dialogRef.close();
  }

  /*--- ERRORS CHECKING ---*/
  checkIfErrors(): number {
    var errs = 0;
    var errType = 0;
    //Check for name
    if ((errType = this.checkName()) != 1) {
      if (errType == -1) this.err = 'Function name not specified';
      //else if (errType == -2) this.err = 'There must be no spaces in the name';
      else if (errType == -3) this.err = 'A function with this name already exists';
      else if (errType == -4) this.err = 'There is characters in the name that are not allowed';
      errs++;
    }
    //Check for service time
    else if ((errType = this.checkServiceTime()) != 1) {
      if (errType == -1) this.err = 'Average service processing time not specified';
      else if (errType == -2) this.err = "Service time must be a numeric value";
      else if (errType == -3) this.err = 'Service time must be a positive number';
      errs++;
    }
    //Check for hardware requirements
    else if ((errType = this.checkHardwareReqs()) != 1) {
      if (errType == -1) this.err = "Service hardware capacity required not specified";
      else if (errType == -2) this.err = 'Service hardware requirements must be a numeric value';
      else if (errType == -3) this.err = 'Service hardware requirements must be a positive value';
      errs++;
    }
    //Check for iot requirements and delete the undefined
    else if (this.checkIotReqs() == false) {
      this.err = 'There are invalid characters in an IoT device connected';
      errs++;
    }
    //Security requirements correct for construction
    return errs;
  }

  /*
  Not allowed characters in the name:
  - ::
  - [ ]
  - ( )
  - Uppercase letter for first
  - 
  */
  checkName(): number {
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
      //Delete the upper case
      this.data.name = this.data.name.toLowerCase();
      //Check if now there are duplicates
      for (var i in this.data.functions) {
        var f = this.data.functions[i];
        if (f.name == this.data.name && this.data.id != f.id) {
          return -3;
        }
      }
    }
    return 1;
  }

  checkServiceTime(): number {
    if (!this.data.serviceTime) return -1;
    /*else if (this.data.serviceTime == '') {
      //Average service processing time not specified
      return -1;
    }*/
    //Control for the service time parameter
    else if (isNaN(Number(this.data.serviceTime)) == true) {
      return -2;
    }
    else if (Number(this.data.serviceTime) < 0) {
      return -3;
    }
    this.data.serviceTime = Number(this.data.serviceTime);
    return 1;
  }

  checkHardwareReqs(): number {
    if (!this.data.hwReqs) return -1;
    /*else if (this.data.hwReqs == '') {
      return -1;
    }*/
    //Control of the hw requirements parameter
    else if (isNaN(Number(this.data.hwReqs)) == true) {
      return -2;
    }
    else if (Number(this.data.hwReqs) < 0) {
      return -3;
    }
    //Delete the leading zeros
    this.data.hwReqs = Number(this.data.hwReqs);
    return 1;
  }

  checkIotReqs(): boolean {
    for (var i=0; i<this.data.iotReqs.length; i++) {
      var elem = this.data.iotReqs[i].device;
      //Remove the element if it's empty
      if (elem == '') {
        this.data.iotReqs.splice(i, 1);
      }
      else if (this.errorService.checkSpecialCharacters(elem) != 1) {
        var input = document.getElementById('device' + i);
        input.style.border = 'solid';
        input.style.borderColor = 'red';
        return false;
      }
      //Check if there are spaces in the device name
      else if (elem.indexOf(' ') >= 0) {
        //Border of red if there is an error here
        var input = document.getElementById('device' + i);
        input.style.border = 'solid';
        input.style.borderColor = 'red';
        return false;
      }
      else if (this.data.iotReqs[i].imgUrl == '' || !this.data.iotReqs[i].imgUrl) {
        //Set the standard url
        this.data.iotReqs[i].imgUrl = '../../icons/devices/generic.png';
      }
      else {
        //Border with black if this is ok
        var input = document.getElementById('device' + i);
        input.style.border = 'none';
        input.style.borderColor = 'black';
      }
    }
  }

}