import {Component, Inject, Output, EventEmitter} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import { FlowDialogData } from '../flow-dialog/flow-dialog.component';


@Component({
  selector: 'app-flow-menu',
  templateUrl: './flow-menu.component.html',
  styleUrls: ['./flow-menu.component.css']
})
export class FlowMenuComponent {

  err = '';

  constructor(public dialogRef: MatDialogRef<FlowMenuComponent>, @Inject(MAT_DIALOG_DATA) public data: FlowDialogData, public dialog: MatDialog) {}

  @Output() deleteLine = new EventEmitter<number[]>();
  @Output() createLine = new EventEmitter<FlowDialogData>();
  @Output() closeClick = new EventEmitter<number>();

  onDeleteClick(event): void {
    var coord = [event.offsetX, event.offsetY];
    this.deleteLine.emit(coord);
    this.dialogRef.close();
  }

  onCreateClick(data): void {
    var errs = this.checkIfErrors();
    if (errs == 0) {
      this.data.bandwidth = Number(this.data.bandwidth);
      this.createLine.emit(data);
      this.dialogRef.close();
    }
  }

  onClose() {
    this.closeClick.emit(1);
    this.dialogRef.close();
  }

  /*--- ERROR CHECKING ---*/

  checkIfErrors(): number {
    var errs = 0;
    //TODO: la banda deve essere una stringa altrimenti se non inserisco niente nell'input viene considerato corretto
    if (isNaN(Number(this.data.bandwidth)) == true) {
      this.err = 'The bandwidth value must be a numeric value';
      errs++;
    }
    else if (Number(this.data.bandwidth) < 0) {
      this.err = 'The bandwidth value must be a positive number';
      errs++;
    }
    return errs;
  }

}