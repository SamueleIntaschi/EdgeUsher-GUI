import { Component, OnInit, Inject, OnDestroy, HostListener } from '@angular/core';
import {ThemePalette} from '@angular/material/core';
import {ProgressSpinnerMode} from '@angular/material/progress-spinner';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog'; 
import { HttpService } from '../../app/http-service.service';

@Component({
  selector: 'app-progress-spinner-dialog-component',
  templateUrl: './progress-spinner-dialog-component.component.html',
  styleUrls: ['./progress-spinner-dialog-component.component.css']
})
export class ProgressSpinnerDialogComponent implements OnInit {

  @HostListener('window:beforeunload') clear() {
    /*this.http.postClearBackend('http://192.168.1.218:5000/clear/').subscribe(result => {
      console.log(result);
    });*/
  }
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'determinate';
  value = 50;
  constructor(public dialogRef: MatDialogRef<ProgressSpinnerDialogComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpService) {}  

  ngOnInit(): void {
  }

}
