import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-header-infrastructure',
  templateUrl: './header-infrastructure.component.html',
  styleUrls: ['./header-infrastructure.component.css']
})
export class HeaderInfrastructureComponent implements OnInit {

  @Output() reset = new EventEmitter<number>();
  @Output() saveInfrastructure = new EventEmitter<number>();
  @Output() uploadInfrastructureProject = new EventEmitter<any>();
  @Output() uploadInfrastructureNoProbs = new EventEmitter<any>();
  @Output() uploadInfrastructureComplete = new EventEmitter<any>();
  @Output() uploadInfrastructurePartial = new EventEmitter<any>();
  @Output() uploadInfrastructureFile = new EventEmitter<any>();
  @Output() changeTitle = new EventEmitter<string>();
  @Output() codeClick = new EventEmitter<number>();
  @Output() probClick = new EventEmitter<string>();
  @Output() onChainClick = new EventEmitter<number>();
  @Output() logoClick = new EventEmitter<number>();
  @Output() saveJSON = new EventEmitter<number>();
  @Output() exeEU = new EventEmitter<number>();
  @Output() tutorialClick = new EventEmitter<number>();
  @Input() title: string;
  codeMode = false;
  constructor() { }

  ngOnInit(): void {
  }

  new() {
    this.reset.emit(1);
  }

  exe() {
    this.exeEU.emit(1);
  }

  saveJson() {
    this.saveJSON.emit(1);
  }

  onLogoClick() {
    this.logoClick.emit(1);
  }

  chainClick() {
    this.onChainClick.emit(1);
  }

  save() {
    this.saveInfrastructure.emit(1);
  }

  upload(event, type) {
    if (type == 0) this.uploadInfrastructureProject.emit(event);
    else if (type == 1) this.uploadInfrastructureNoProbs.emit(event);
    else if (type == 2) this.uploadInfrastructurePartial.emit(event);
    else if (type == 3) this.uploadInfrastructureComplete.emit(event);
  }

  upload2(event) {
    this.uploadInfrastructureFile.emit(event);
  }

  onChangeTitle(event) {
    this.changeTitle.emit(event);
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

  setProbabilisticMode(mode) {
    this.probClick.emit(mode);
  }

  tutorial() {
    this.tutorialClick.emit(1);
  }

}
