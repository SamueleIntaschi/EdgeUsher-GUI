import {Component, Inject, Output, EventEmitter} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';

export interface ConfirmationDialogData {
  text: string;
  type: string;
}

@Component({
  selector: 'app-confirmation-request',
  templateUrl: './confirmation-request.component.html',
  styleUrls: ['./confirmation-request.component.css']
})
export class ConfirmationRequestComponent {

  constructor(public dialogRef: MatDialogRef<ConfirmationRequestComponent>, @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData, public dialog: MatDialog) {}
  
  @Output() positiveClick = new EventEmitter<number>();
  @Output() negativeClick = new EventEmitter<number>();

  onNegativeClick(): void {
    this.negativeClick.emit(1);
    this.dialogRef.close();
  }

  onPositiveClick(): void {
    this.positiveClick.emit(1);
    this.dialogRef.close();
  }
}
