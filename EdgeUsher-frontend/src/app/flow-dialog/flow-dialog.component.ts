import {Component, Inject, Output, EventEmitter} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';

export interface FlowDialogData {
  bandwidth: number;
  from: string;
  to: string;
  id: number;
}

@Component({
  selector: 'app-flow-dialog',
  templateUrl: './flow-dialog.component.html',
  styleUrls: ['./flow-dialog.component.css']
})
export class FlowDialogComponent {

  err = '';

  constructor(public dialogRef: MatDialogRef<FlowDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: FlowDialogData, public dialog: MatDialog) {}

  @Output() deleteLine = new EventEmitter<number[]>();
  @Output() createLine = new EventEmitter<FlowDialogData>();

  ngOnInit(): void {
  }

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

  /*--- ERROR CHECKING ---*/

  checkIfErrors(): number {
    var errs = 0;
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
