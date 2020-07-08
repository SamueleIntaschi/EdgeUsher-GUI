import { Component, OnInit, ViewChild } from '@angular/core';
import { SvgInfrastructureComponent } from '../svg-infrastructure/svg-infrastructure.component';
import { ChainCodeComponent } from '../chain-code/chain-code.component';
import { ExecutionDialogComponent } from '../execution-dialog/execution-dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ChainErrorCheckingService } from '../chain-error-checking.service';
import { SplitScreenComponent } from '../split-screen/split-screen.component';


@Component({
  selector: 'app-working-page-infrastructure',
  templateUrl: './working-page-infrastructure.component.html',
  styleUrls: ['./working-page-infrastructure.component.css']
})
export class WorkingPageInfrastructureComponent implements OnInit {

  @ViewChild(SvgInfrastructureComponent, {static: false}) private svg: SvgInfrastructureComponent;
  @ViewChild(ChainCodeComponent, {static: false}) private code: ChainCodeComponent;
  @ViewChild(SplitScreenComponent, {static: true}) private splitScreen: SplitScreenComponent;
  //@ViewChild(HeaderInfrastructureComponent, {static: false}) header: HeaderInfrastructureComponent;
  title = 'Untitled infrastructure';
  constructor(public dialog: MatDialog, private errorService: ChainErrorCheckingService) { }

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
      document.getElementById("split-screen").style.display = 'none';
      document.getElementById("code").style.display = 'block';
      this.code.refresh();
    }
    else if (type == 2) {
      document.getElementById("svg").style.display = 'block';
      document.getElementById("split-screen").style.display = 'none';
      document.getElementById("code").style.display = 'none';
    }
    else if (type == 3) {
      this.svg.dialog.closeAll();
      this.svg.openNodeDialogs = [];
      this.svg.openLinkDialogs = [];
      this.splitScreen.resetPan();
      document.getElementById("svg").style.display = 'none';
      document.getElementById("code").style.display = 'none';
      document.getElementById("split-screen").style.display = 'block';
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
    var chainFile: Array<string>;
    if (nservices > 0) chainFile = this.svg.localStorageService.getChainFile();
    var infrasFile: Array<string>;
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
    else if (this.errorService.checkChainFile(chainFile) == 1) {
      var dialogRef = this.dialog.open(ExecutionDialogComponent, {
        width: '50%',
        autoFocus: false,
        data: {
          type: 0,
          placement: null
        },
      });
    }
    else {
      this.svg.openErrorDialog('The chain is uncorrect, please check if there are cycles or if the services is correctly connected');
    }
  }

}
