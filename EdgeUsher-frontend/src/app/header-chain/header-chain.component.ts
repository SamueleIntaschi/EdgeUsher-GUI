import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { ChainErrorCheckingService } from '../chain-error-checking.service';

@Component({
  selector: 'app-header-chain',
  templateUrl: './header-chain.component.html',
  styleUrls: ['./header-chain.component.css']
})
export class HeaderChainComponent implements OnInit {

  @Output() onSubchainClick = new EventEmitter<number>();
  @Output() startSubchain = new EventEmitter<number>();
  @Output() stopSubchain = new EventEmitter<number>();
  @Output() reset = new EventEmitter<number>();
  @Output() saveChain = new EventEmitter<number>();
  @Output() saveJSON = new EventEmitter<number>();
  @Output() uploadChain = new EventEmitter<any>();
  @Output() changeTitle = new EventEmitter<string>();
  @Output() codeClick = new EventEmitter<number>();
  @Output() onInfClick = new EventEmitter<number>();
  @Output() openSettings = new EventEmitter<number>();
  @Output() logoClick = new EventEmitter<number>();
  @Output() exeEU = new EventEmitter<number>();
  @Output() tutorialClick = new EventEmitter<number>();
  @Input() title: string;
  codeMode = false;
  constructor(private errorService: ChainErrorCheckingService) { }

  ngOnInit(): void {
  }

  tutorial() {
    this.tutorialClick.emit(1);
  }

  openSettingsDialog() {
    this.openSettings.emit(1);
  }

  onLogoClick() {
    this.logoClick.emit(1);
  }

  onInfrClick() {
    this.onInfClick.emit(1);
  }

  onSubChainStartClick() {
    this.stopSubchain.emit(1);
  }

  onSubChainStopClick() {
    this.startSubchain.emit(1);
  }

  new() {
    this.reset.emit(1);
  }

  save() {
    this.saveChain.emit(1);
  }

  saveJson() {
    this.saveJSON.emit(1);
  }

  upload(event) {
    this.uploadChain.emit(event);
  }

  onChangeTitle(event) {
    var title = event;
    if (this.errorService.checkSpecialCharacters(title) != 1) {
      document.getElementById("chain-name").style.border = "2px solid red";
    }
    else{
      document.getElementById("chain-name").style.border = "none";
      this.changeTitle.emit(event);
    }
  }

  exe() {
    this.exeEU.emit(1);
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

  subchain() {
    this.onSubchainClick.emit(1);
  }

}
