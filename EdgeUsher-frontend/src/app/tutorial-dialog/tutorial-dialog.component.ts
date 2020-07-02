import {Component, Inject, Output, EventEmitter, OnInit} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';

export interface TutorialDialogData {
  text: string;
}

@Component({
  selector: 'app-tutorial-dialog',
  templateUrl: './tutorial-dialog.component.html',
  styleUrls: ['./tutorial-dialog.component.css']
})
export class TutorialDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: TutorialDialogData) { }

  ngOnInit(): void {
  }

}
