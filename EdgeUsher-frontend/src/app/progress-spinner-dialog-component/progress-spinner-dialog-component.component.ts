import { Component, OnInit, Inject } from '@angular/core';
import {ThemePalette} from '@angular/material/core';
import {ProgressSpinnerMode} from '@angular/material/progress-spinner';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog'; 

@Component({
  selector: 'app-progress-spinner-dialog-component',
  templateUrl: './progress-spinner-dialog-component.component.html',
  styleUrls: ['./progress-spinner-dialog-component.component.css']
})
export class ProgressSpinnerDialogComponent implements OnInit {

  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'determinate';
  value = 50;
  constructor(public dialogRef: MatDialogRef<ProgressSpinnerDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {}  

  ngOnInit(): void {
  }

}
