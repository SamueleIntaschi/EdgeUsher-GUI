import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ChainCodeComponent } from '../chain-code/chain-code.component';
import { SvgChainComponent } from '../svg-chain/svg-chain.component';
import { HttpService } from '../http-service.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ExecutionDialogComponent } from '../execution-dialog/execution-dialog.component';
import { TutorialDialogComponent } from '../tutorial-dialog/tutorial-dialog.component';


@Component({
  selector: 'app-working-page',
  templateUrl: './working-page.component.html',
  styleUrls: ['./working-page.component.css']
})
export class WorkingPageComponent implements OnInit, AfterViewInit {

  @ViewChild(SvgChainComponent, {static: false}) private svg: SvgChainComponent;
  @ViewChild(ChainCodeComponent, {static: false}) private code: ChainCodeComponent;
  //@ViewChild(HeaderChainComponent, {static: false}) private header: HeaderChainComponent;
  modifyFlow = Array<string>();
  modifySubChain: number;
  saves = 0;
  substart = 0;
  substop = 0;
  isCodeView = false;
  title = 'Untitled chain';
  constructor(private http: HttpService, public dialog: MatDialog) { }

  ngOnInit(): void {
    document.getElementById("code").style.display = 'none';
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
      this.code.refresh();
      this.isCodeView = true;
    }
    else if (type == 2) {
      document.getElementById("svg").style.display = 'block';
      document.getElementById("code").style.display = 'none';
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
    if (this.svg.isChainMode >= 0) {
      console.log('stop subchain');
      this.svg.onSubchainStopClick();
    }
    else {
      console.log('start subchain');
      this.svg.onSubchainStartClick();
    }
  }

  openTutorialDialog() {
    var text= 'To insert a service, click with the mouse on the drawing area and insert the requirements.\n' + 
    'To insert a flow, press on the service from which the flow must start and drag it to the service on which it must end, then insert the requirements.';
    var dialogRef = this.dialog.open(TutorialDialogComponent, {
      width: '30%',
      autoFocus: false,
      data: {
        text: text,
      }
    });
  }

  openExecutionDialog() {
    //Store the chain file to get it from the dialog
    //this.svg.localStorageService.storeChainFile(this.svg.createChainFile());
    var nservices = this.svg.localStorageService.getServices().length;
    var chainFile: Array<String>;
    if (nservices > 0) chainFile = this.svg.localStorageService.getChainFile();
    var infrasFile: Array<String>;
    var nnodes = this.svg.localStorageService.getNodes().length;
    if (nnodes > 0) infrasFile = this.svg.localStorageService.getInfrastructureFile();
    console.log(chainFile, infrasFile);
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
        width: '30%',
        autoFocus: false,
        data: {
          type: 0,
        },
      });
    }
    
  }
    
}
