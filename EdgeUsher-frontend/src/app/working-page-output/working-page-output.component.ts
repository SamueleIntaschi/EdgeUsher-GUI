import { Component, OnInit, ViewChild } from '@angular/core';
import { SvgOutputComponent } from '../svg-output/svg-output.component';
import { ChainCodeComponent } from '../chain-code/chain-code.component';
import { Placement } from '../execution-dialog/execution-dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ExecutionDialogComponent } from '../execution-dialog/execution-dialog.component';
import { ChainErrorCheckingService } from '../chain-error-checking.service';

@Component({
  selector: 'app-working-page-output',
  templateUrl: './working-page-output.component.html',
  styleUrls: ['./working-page-output.component.css']
})
export class WorkingPageOutputComponent implements OnInit {

  @ViewChild(SvgOutputComponent, {static: false}) private svg: SvgOutputComponent;
  @ViewChild(ChainCodeComponent, {static: false}) private code: ChainCodeComponent;
  placements = Array<Placement>();
  selectedPlacement: Placement;
  indexSelectedPlacement = -1;
  constructor(public dialog: MatDialog, private errorService: ChainErrorCheckingService) { }

  ngOnInit(): void {
    document.getElementById("code").style.display = 'none';
    document.getElementById('dot-navigation-component').style.display = 'block';
  }

  newPlacement() {
    this.svg.newPlacement();
  }

  clearPlacements() {
    this.placements = [];
  }

  save() {
    this.svg.saveSelectedPlacementAsFile();
  }

  onLogoClick() {
    this.svg.dialog.closeAll();
    document.getElementById('dot-navigation-component').style.display = 'none';
  }

  exe() {

  }

  onChClick() {

  }

  changeSelectedPlacement(event) {
    this.svg.selectedPlacement = event;
    this.svg.userPlacement.placement = this.selectedPlacement;
    this.svg.setSelectedPlacement();
    this.svg.placeServices();
    console.log(this.svg.selectedPlacement);
  }
  
  onChangePlacements(event) {
    this.placements = event;
  }

  setFirstSelPlacement(event) {
    this.indexSelectedPlacement = event;
    this.selectedPlacement = this.placements[event];
  }

  onCodeClick(type: number) {
    if (type == 1) {
      var p: string;
      p = this.svg.createFullPlacement();
      console.log(p);
      var p0 = Array<string>();
      p0.push(p);
      this.code.setCode(p0);
      var d = document.getElementsByClassName("CodeMirror-scroll") as HTMLCollectionOf<HTMLElement>;
      var d1 = document.getElementsByClassName("CodeMirror-gutter") as HTMLCollectionOf<HTMLElement>;
      document.getElementById("svgplacement").style.display = 'none';
      document.getElementById("code").style.display = 'block';
      this.code.refresh();
    }
    else if (type == 2) {
      document.getElementById("svgplacement").style.display = 'block';
      document.getElementById("code").style.display = 'none';
    }
  }

  openExecutionDialog() {
    //Store the placement to get it from the dialog
    this.svg.localStorageService.storeActualPlacement(this.svg.selectedPlacement);
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
        disableClose: true,
        data: {
          type: 1,
          placement: this.svg.selectedPlacement,
        },
      });

      dialogRef.componentInstance.reloadPage.subscribe(() => {
        location.reload();
      });
    }
    else {
      this.svg.openErrorDialog('The chain is uncorrect, please check if there are cycles or if the services is correctly connected');
    }

  }
}
