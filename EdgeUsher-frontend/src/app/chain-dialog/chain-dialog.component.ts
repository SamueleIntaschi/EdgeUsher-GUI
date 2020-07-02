import {Component, Inject, Output, EventEmitter} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import { Service } from '../svg-chain/service';

export interface ChainDialogData {
  id: number;
  maxLatency: number;
  services: Array<Service>;
}

@Component({
  selector: 'app-chain-dialog',
  templateUrl: './chain-dialog.component.html',
  styleUrls: ['./chain-dialog.component.css']
})
export class ChainDialogComponent {

  err = '';
  constructor(public dialogRef: MatDialogRef<ChainDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: ChainDialogData, public dialog: MatDialog) {}

  @Output() chainClick = new EventEmitter<number>();
  @Output() cancelClick = new EventEmitter<number>();
  @Output() modifyClick = new EventEmitter<number>();

  onSaveClick(data) {
    var errs = this.check();
    if (errs == 0) {
      this.chainClick.emit(data.maxLatency);
      this.dialogRef.close();
    }
  }

  onCancelClick() {
    this.cancelClick.emit(1);
  }

  onModifyClick(data) {
    this.modifyClick.emit(data.id);
  }

  check(): number {
    var errs = 0;
    if (isNaN(Number(this.data.maxLatency)) == true) {
      errs++;
      this.err = 'The maximum latency value must be a number';
    }
    else if (this.data.maxLatency < 0) {
      errs++;
      this.err = 'The maximum latency constraint must be a positive number';
    }
    return errs;
  }

}
