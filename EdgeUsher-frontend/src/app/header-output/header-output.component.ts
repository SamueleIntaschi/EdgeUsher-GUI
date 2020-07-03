import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Placement, Place } from '../execution-dialog/execution-dialog.component';


@Component({
  selector: 'app-header-output',
  templateUrl: './header-output.component.html',
  styleUrls: ['./header-output.component.css']
})
export class HeaderOutputComponent implements OnInit {
  
  @Output() savePlacement = new EventEmitter<number>();
  @Output() codeClick = new EventEmitter<number>();
  //@Output() onChClick = new EventEmitter<number>();
  @Output() openSettings = new EventEmitter<number>();
  @Output() logoClick = new EventEmitter<number>();
  @Output() exeEU = new EventEmitter<number>();
  @Output() changeSelectedPlacement = new EventEmitter<Placement>();
  @Output() addNewPlacement = new EventEmitter<number>();
  @Output() tutorialClick = new EventEmitter<number>();
  @Input() placements: Array<Placement>;
  @Input() selectedPlacement: Placement;
  @Input() indexSelectedPlacement: number;
  selectedPId = -1;
  codeMode = false;
  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
  }

  newPlacement() {
    this.addNewPlacement.emit(1);
  }

  tutorial() {
    this.tutorialClick.emit(1);
  }

  onChange() {
    //TODO: a questo punto, se il placement è stato restituito dalla versione euristica, ricalcolare la probabilità (forse)
    this.selectedPlacement = this.placements[this.indexSelectedPlacement];
    this.changeSelectedPlacement.emit(this.selectedPlacement);
  }

  exe() {
    this.exeEU.emit(1);
  }

  onLogoClick() {
    this.logoClick.emit(1);
  }

  /*
  onChangeClick() {
    this.onChClick.emit(1);
  }
  */

  save() {
    this.savePlacement.emit(1);
  }

  onCodeClick(type) {
    if (this.codeMode == false && type == 1) {
      this.codeMode = true;
      this.codeClick.emit(1);
    }
    else if (this.codeMode == true && type == 2) {
      this.codeMode = false;
      this.codeClick.emit(2);
    }
  }

}
