import {Component, Inject, Output, EventEmitter} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';

export interface ErrorDialogData {
  err: string;
}

@Component({
  selector: 'app-error-dialog',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.css']
})
export class ErrorDialogComponent {

  constructor(public dialogRef: MatDialogRef<ErrorDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: ErrorDialogData, public dialog: MatDialog) {}

}
