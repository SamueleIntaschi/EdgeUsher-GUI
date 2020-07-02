import { Component, OnInit, ViewChild } from '@angular/core';
import { SvgInfrastructureComponent } from '../svg-infrastructure/svg-infrastructure.component';
import { ChainCodeComponent } from '../chain-code/chain-code.component';
import { ExecutionDialogComponent } from '../execution-dialog/execution-dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';


@Component({
  selector: 'app-working-page-infrastructure',
  templateUrl: './working-page-infrastructure.component.html',
  styleUrls: ['./working-page-infrastructure.component.css']
})
export class WorkingPageInfrastructureComponent implements OnInit {

  @ViewChild(SvgInfrastructureComponent, {static: false}) private svg: SvgInfrastructureComponent;
  @ViewChild(ChainCodeComponent, {static: false}) private code: ChainCodeComponent;
  //@ViewChild(HeaderInfrastructureComponent, {static: false}) header: HeaderInfrastructureComponent;
  title = 'Untitled infrastructure';
  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
    document.getElementById("code").style.display = 'none';
    document.getElementById('dot-navigation-component').style.display = 'block';
  }

  exe() {

  }

  saveJson() {
    this.svg.saveJSON();
  }

  save() {
    this.svg.save();
  }

  new() {
    this.svg.openConfirmationDialog('Are you sure you wat to restart? All progress will be lost.', 'reset');
  }

  uploadInfrastructure(event) {
    this.svg.uploadInfrastructure(event);
  }

  onLogoClick() {
    this.svg.dialog.closeAll();
    this.svg.openLinkDialogs = [];
    this.svg.openNodeDialogs = [];
    this.svg.localStorageService.storeInfrastructureFile(this.svg.createInfrastructureFile());
    document.getElementById('dot-navigation-component').style.display = 'none';
  }

  onCodeClick(type: number) {
    if (type == 1) {
      this.svg.dialog.closeAll();
      this.svg.openNodeDialogs = [];
      this.svg.openLinkDialogs = [];
      var infr: Array<string>;
      infr = this.svg.createInfrastructureFile();
      this.code.setCode(infr);
      var d = document.getElementsByClassName("CodeMirror-scroll") as HTMLCollectionOf<HTMLElement>;
      //d[0].style.backgroundColor = 'lightblue';
      var d1 = document.getElementsByClassName("CodeMirror-gutter") as HTMLCollectionOf<HTMLElement>;
      //d1[0].style.backgroundColor = 'lightblue';
      document.getElementById("svg").style.display = 'none';
      //document.getElementById("header").style.display = 'none';
      document.getElementById("code").style.display = 'block';
      this.code.refresh();
    }
    else if (type == 2) {
      document.getElementById("svg").style.display = 'block';
      //document.getElementById("header").style.display = 'block';
      document.getElementById("code").style.display = 'none';
    }
  }

  onChainClick() {
    this.svg.dialog.closeAll();
    this.svg.openLinkDialogs = [];
    this.svg.openNodeDialogs = [];
    //Save infrastructure file in the memory in order to get it accessible from chain page
    this.svg.localStorageService.storeInfrastructureFile(this.svg.createInfrastructureFile());
  }

  onReturnClick() {
    
  }

  onChangeTitle(event) {
    this.svg.title = event;
  }

  changeTitleFromUpload(event) {
    this.title = event;
  }

  setProbabilisticMode(event) {
    if (event == 'no-probs') this.svg.openConfirmationDialog('Are you sure you want to change?', 'no-probs');
    else if (event == 'partial') this.svg.openConfirmationDialog('Are you sure you want to change?', 'partial');
    else if (event == 'complete') this.svg.openConfirmationDialog('Are you sure you want to change?', 'complete');
  }

  openExecutionDialog() {
    //Store the chain file to get it from the dialog
    //this.svg.localStorageService.storeInfrastructureFile(this.svg.createInfrastructureFile());
    var nservices = this.svg.localStorageService.getServices().length;
    var chainFile: Array<String>;
    if (nservices > 0) chainFile = this.svg.localStorageService.getChainFile();
    var infrasFile: Array<String>;
    var nnodes = this.svg.localStorageService.getNodes().length;
    if (nnodes > 0) infrasFile = this.svg.localStorageService.getInfrastructureFile();
    if (!chainFile && !infrasFile) {
      this.svg.openErrorDialog('Chain and infrastructure is missing');
    }
    else if (!chainFile) {
      this.svg.openErrorDialog('Chain is missing');
    }
    else if (!infrasFile) {
      this.svg.openErrorDialog('Infrastructure is missing');
    }
    else {
      var dialogRef = this.dialog.open(ExecutionDialogComponent, {
        //width: '30%',
        autoFocus: false,
        data: {
          type: 0,
          placement: null
        },
      });
    }
  }

}
