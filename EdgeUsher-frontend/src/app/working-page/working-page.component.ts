import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ChainCodeComponent } from '../chain-code/chain-code.component';
import { SvgChainComponent } from '../svg-chain/svg-chain.component';
import { HttpService } from '../http-service.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ExecutionDialogComponent } from '../execution-dialog/execution-dialog.component';
import { TutorialDialogComponent } from '../tutorial-dialog/tutorial-dialog.component';
import { ChainErrorCheckingService } from '../chain-error-checking.service';
import { SplitScreenComponent } from '../split-screen/split-screen.component';


@Component({
  selector: 'app-working-page',
  templateUrl: './working-page.component.html',
  styleUrls: ['./working-page.component.css']
})
export class WorkingPageComponent implements OnInit, AfterViewInit {

  @ViewChild(SvgChainComponent, {static: false}) private svg: SvgChainComponent;
  @ViewChild(ChainCodeComponent, {static: false}) private code: ChainCodeComponent;
  @ViewChild(SplitScreenComponent, {static: true}) private splitScreen: SplitScreenComponent;
  //@ViewChild(HeaderChainComponent, {static: false}) private header: HeaderChainComponent;
  modifyFlow = Array<string>();
  modifySubChain: number;
  saves = 0;
  substart = 0;
  substop = 0;
  isCodeView = false;
  title = 'Untitled chain';
  constructor(private http: HttpService, public dialog: MatDialog, private errorService: ChainErrorCheckingService) { }

  ngOnInit(): void {
    document.getElementById("code").style.display = 'none';
    document.getElementById("split-screen").style.display = 'none';
    document.getElementById('dot-navigation-component').style.display = 'block';
  }

  ngAfterViewInit() {
    document.getElementById("code").style.display = 'none';
  }

  save() {
    this.svg.save();
  }

  saveJson() {
    this.svg.saveJSON();
  }

  new() {
    this.svg.openConfirmationDialog('Are you sure you want to reset?', 'reset');
  }

  upload(event) {
    this.svg.uploadChain(event);
  }

  onChangeTitle(event) {
    this.svg.title = event;
    this.svg.localStorageService.setChainTitle(event);
  }

  changeTitleFromUpload(event) {
    //this.header.title = event;
    this.title = event;
  }

  onLogoClick() {
    this.svg.closeAllDialogs();
    this.svg.localStorageService.storeChainFile(this.svg.createChainFile());
    document.getElementById("dot-navigation-component").style.display ='none';
  }

  onCodeClick(type: number) {
    if (type == 1) {
      this.svg.dialog.closeAll();
      this.svg.openFlowDialogs = [];
      this.svg.openServiceDialogs = [];
      var chain: Array<string>;
      chain = this.svg.createChainFile();
      this.code.setCode(chain);
      var d = document.getElementsByClassName("CodeMirror-scroll") as HTMLCollectionOf<HTMLElement>;
      //d[0].style.backgroundColor = 'lightblue';
      var d1 = document.getElementsByClassName("CodeMirror-gutter") as HTMLCollectionOf<HTMLElement>;
      //d1[0].style.backgroundColor = 'lightblue';
      document.getElementById("svg").style.display = 'none';
      document.getElementById("code").style.display = 'block';
      document.getElementById("split-screen").style.display = 'none';
      this.code.refresh();
      this.isCodeView = true;
    }
    else if (type == 2) {
      document.getElementById("svg").style.display = 'block';
      document.getElementById("code").style.display = 'none';
      document.getElementById("split-screen").style.display = 'none';
      this.isCodeView = false;
    }
    else if (type == 3) {
      this.svg.dialog.closeAll();
      this.svg.openFlowDialogs = [];
      this.svg.openServiceDialogs = [];
      this.splitScreen.resetZoom();
      this.splitScreen.resetPan();
      document.getElementById("svg").style.display = 'none';
      document.getElementById("code").style.display = 'none';
      document.getElementById("split-screen").style.display = 'block';
      this.isCodeView = false;
    }
  }

  exe() {
    this.sendInfrastructureFile();
    var chain: Array<string>;
    chain = this.svg.createChainFile();
    let blob = new Blob([chain.join('\n')], {
      type: 'plain/text'
    });
    const formData: FormData = new FormData();
    formData.append('chain.pl', blob);
    this.http.postFile('http://127.0.0.1:5000/chain/', formData);
    this.http.postFile('http://127.0.0.1:5000/exe/', null);
  }

  sendInfrastructureFile() {
    var infra = this.svg.localStorageService.getInfrastructureFile();
    let blob = new Blob([infra.join('\n')], {
      type: 'plain/text'
    });
    const formData: FormData = new FormData();
    formData.append('infra.pl', blob);
    this.http.postFile('http://127.0.0.1:5000/infrastructure/', formData);
  }


  onInfClick() {
    this.svg.closeAllDialogs();
    this.svg.localStorageService.storeChainFile(this.svg.createChainFile());
  }

  subchain() {
    if (this.svg.subchains.length == 0) {
      if (this.svg.isChainMode >= 0) {
        console.log('stop subchain');
        this.svg.onSubchainStopClick();
      }
      else {
        console.log('start subchain');
        this.svg.onSubchainStartClick();
      }
    }
    else {
      this.svg.openErrorDialog('There must be one max latency constraint');
    }
  }

  openTutorialDialog() {
    var dialogRef = this.dialog.open(TutorialDialogComponent, {
      width: '80%',
      autoFocus: false,
      data: {
        from: 'chain'
      }
    });
  }

  

  openExecutionDialog() {

    //Store the chain file to get it from the dialog
    //this.svg.localStorageService.storeChainFile(this.svg.createChainFile());
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
      this.svg.hideCode();
      this.svg.closeAllDialogs();
      var dialogRef = this.dialog.open(ExecutionDialogComponent, {
        width: '50%',
        autoFocus: false,
        data: {
          type: 0,
        },
      });
    }
    else {
      this.svg.openErrorDialog('The chain is uncorrect, please check if there are cycles or if the services is correctly connected');
    }
    
  }
    
}
