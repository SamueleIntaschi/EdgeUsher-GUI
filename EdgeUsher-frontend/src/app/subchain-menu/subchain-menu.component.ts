import {Component, Inject, Output, EventEmitter, OnInit} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import { Service } from '../svg-chain/service';
import { ChainDialogData } from '../chain-dialog/chain-dialog.component';

@Component({
  selector: 'app-subchain-menu',
  templateUrl: './subchain-menu.component.html',
  styleUrls: ['./subchain-menu.component.css']
})
export class SubchainMenuComponent implements OnInit {

  err = '';
  constructor(public dialogRef: MatDialogRef<SubchainMenuComponent>, @Inject(MAT_DIALOG_DATA) public data: ChainDialogData, public dialog: MatDialog) {}

  @Output() chainClick = new EventEmitter<number>();
  @Output() cancelClick = new EventEmitter<number>();
  @Output() modifyClick = new EventEmitter<number>();
  @Output() closeClick = new EventEmitter<number>();

  ngOnInit() {

  }

  onClose() {
    this.closeClick.emit(1);
    this.dialogRef.close();
  }

  onSaveClick(data) {
    var errs = this.check();
    if (errs == 0) {
      this.chainClick.emit(data);
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
