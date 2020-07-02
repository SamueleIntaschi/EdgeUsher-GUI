import { Component, Output, EventEmitter, Inject, OnInit } from '@angular/core';
import { LinkDialogData, LinkProb } from '../link-dialog/link-dialog.component';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {MatSelectModule} from '@angular/material/select';

@Component({
  selector: 'app-link-menu',
  templateUrl: './link-menu.component.html',
  styleUrls: ['./link-menu.component.css']
})
export class LinkMenuComponent implements OnInit {

  err = '';
  probs = Array<LinkProb>();
  @Output() deleteLine = new EventEmitter<number[]>();
  @Output() createLine = new EventEmitter<LinkDialogData>();
  @Output() closeClick = new EventEmitter<LinkDialogData>();
  constructor(public dialogRef: MatDialogRef<LinkMenuComponent>, @Inject(MAT_DIALOG_DATA) public data: LinkDialogData, public dialog: MatDialog) {}


  ngOnInit() {
    for (var i in this.data.probs) {
      this.probs.push({
        prob: this.data.probs[i].prob,
        latvalue: this.data.probs[i].latvalue,
        bandvalue: this.data.probs[i].bandvalue
      });
    }
  }

  /*--- PROBABILITY METHODS ---*/

  addProbability() {
    this.probs.push({
      prob: 0,
      latvalue: 0,
      bandvalue: 0,
    });
  }

  deleteProbability(prob: LinkProb) {
    for (var i=0; i<this.probs.length; i++) {
      if (this.probs[i] == prob) {
        this.probs.splice(i, 1);
        i--;
        break;
      }
    }
  }

  /*--- BUTTON ACTIONS ---*/

  onDeleteClick(event): void {
    var coord = [event.offsetX, event.offsetY];
    this.deleteLine.emit(coord);
    this.dialogRef.close();
  }

  onCreateClick(data): void {
    var errs = this.checkIfErrors();
    if (errs == 0) {
      //Delete the leading zeros
      if (this.data.probabilisticMode == false) {
        this.data.bandwidth = Number(this.data.bandwidth);
        this.data.latency = Number(this.data.latency);
      }
      else {
        for (var i in this.data.probs) {
          var prob = this.data.probs[i];
          prob = {
            prob: Number(prob.prob),
            bandvalue: Number(prob.bandvalue),
            latvalue: Number(prob.latvalue)
          }
        }
      }
      this.data.probs = this.probs;
      this.createLine.emit(data);
      this.dialogRef.close();
    }
  }

  onClose() {
    this.closeClick.emit();
    this.dialogRef.close();
  }

  /*--- ERROR CHECKING ---*/

  checkIfErrors(): number {
    var errs = 0;
    if (this.data.probabilisticMode == false) {
      if (isNaN(Number(this.data.bandwidth)) == true) {
        this.err = 'The bandwidth value must be a numeric value';
        errs ++;
      }
      else if (isNaN(Number(this.data.latency)) == true) {
        this.err = 'The latency value must be a numeric value';
        errs++;
      }
      else if (Number(this.data.bandwidth < 0)) {
        this.err = 'The bandwidth value must be a positive number';
        errs++;
      }
      else if (Number(this.data.latency) < 0) {
        this.err = 'The latency value must be a positive number';
        errs++;
      }
      return errs;
    }
    else {

      var probs = this.probs;
      var sum = 0;
      for (var i in probs) {
        if (isNaN(Number(probs[i].prob)) == true) {
          this.err = 'Probability value is not a number';
          errs++;
          break;
        }
        else if (Number(probs[i].prob) < 0) {
          this.err = 'Probability values must be positive numbers';
          errs++;
          break;
        }
        else if (isNaN(Number(probs[i].bandvalue)) == true) {
          this.err = 'A bandwidth value is not a number';
          errs++;
          break;
        }
        else if (Number(probs[i].bandvalue) < 0) {
          this.err = 'Bandwidth values must be positive numbers';
          errs++;
          break;
        }
        else if (isNaN(Number(probs[i].latvalue)) == true) {
          this.err = 'A latency value is not a number';
          errs++;
          break;
        }
        else if (Number(probs[i].latvalue) < 0) {
          this.err = 'Latency values must be positive numbers';
          errs++;
          break;
        }
        else {
          sum = sum + Number(probs[i].prob);
        }
      }
      if (sum > 1 || sum < 0) {
        this.err = 'The total probability is not correct';
        errs++;
      }
      return errs;
    }
  }

}
