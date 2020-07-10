import { LocalStorageService } from '../../app/local-storage-service';
import { HttpService } from '../../app/http-service.service';
import { Component, Inject, Output, EventEmitter, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Router, Routes } from '@angular/router';
import { catchError, retry } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ProgressSpinnerDialogComponent } from '../progress-spinner-dialog-component/progress-spinner-dialog-component.component';
import { throwError } from 'rxjs';
import { app_Init } from '../app.module';
import { SettingsService } from '../settings.service';

/*
  POSSIBLE QUERIES:
  - with affinity: query(placement(Chain, [on(F1,N1), on(F2,N2), on(F3,N2)], Routes)).
  - TODO: with antiaffinity: query(placement(Chain, [on(F1,N1), on(F2,N2), on(F3,N3)], Routes), N2 \== N3).
  - with heuristic: query(placement(Chain, Placement, Routes, ThrHW, ThrQoS)).
*/

export interface ExecutionDialogData{
  //1 if the execution is called from the placement,
  //0 if the execution is called from the chain or infrastructure
  type: number,
  //Placement if the execution is called by placement page
  placement: Placement,
}

//example: (parkingServices, mannLab, 15, [(cctv_driver, feature_extr)])
export interface Route {
  fromNode: string,
  toNode: string,
  usedBw: number,
  flows: Array<{
    from: string,
    to: string
  }>
}

//example: on(lightweight_analytics,firePolice)
export interface Place {
  service: string,
  node: string
}

export interface Placement {
  placement: Array<Place>,
  routes: Array<Route>,
  prob: number,
  id: number,
  chainId: string,
}

export interface Affinity {
  service1: string;
  service2: string;
}


@Component({
  selector: 'app-execution-dialog',
  templateUrl: './execution-dialog.component.html',
  styleUrls: ['./execution-dialog.component.css']
})

export class ExecutionDialogComponent implements OnInit {

  @Output() reloadPage = new EventEmitter<number>();
  //Affinities and anti-affinities constraints
  affinities = Array<Affinity>();
  antiAffinities= Array<Affinity>();
  //Services of the chain
  services = Array<string>();
  //Nodes of the infrastructure
  nodes = Array<string>();
  //Placements
  placements = Array<Placement>();
  //Specific placement requested for a service
  placesRequested = Array<Place>();
  //Variable that indicate that the heuristic mode is selected
  heuristicMode = false;
  //Threshold for heuristic version
  thrhw = 0;
  thrqos = 0;
  //Id of the placements
  placementId = 0;
  //Err to write in the dialog
  err = '';
  //Temporary placement
  tmpPlacement: Placement;
  //String for anti-affinity
  antiAffinityString = '';
  spinner: MatDialogRef<any>;
  chainFile = Array<String>();
  infrasFile = Array<String>();
  //Url of the server
  serverUrl: string;

  constructor(private settingService: SettingsService, 
    public dialog: MatDialog, 
    @Inject(MAT_DIALOG_DATA) public data: ExecutionDialogData, 
    private router: Router, public dialogRef: MatDialogRef<ExecutionDialogComponent>, 
    public localStorageService: LocalStorageService, private http: HttpService) {

  }

  ngOnInit(): void {
    this.serverUrl = this.settingService.settings.apiUrl;
    //Get nodes and services from storage
    var tmp = this.localStorageService.getServices();
    for (var i in tmp) this.services.push(tmp[i].name);
    var tmp2 = this.localStorageService.getNodes();
    for (var i in tmp2) this.nodes.push(tmp2[i].name);
    //Create a temporary placement
    this.tmpPlacement = {
      id: 0,
      chainId: 'Chain',
      routes: Array<Route>(),
      placement: Array<Place>(),
      prob: 0,
    };
    
  }

  /*--- DIALOGS METHODS ---*/

  //Close this dialog
  cancel() {
    this.dialogRef.close();
  }

  /*--- PLACEMENT METHODS ---*/

  //Add a partial placement
  addPlace(): void {
    this.placesRequested.push({
      service: '',
      node: ''
    });
  }

  //Delete partial placement
  deletePlace(a) {
    for (var i=0; i<this.placesRequested.length; i++) {
      var a1 = this.placesRequested[i];
      if (a1 == a) {
        this.placesRequested.splice(i, 1);
        break;
      } 
    }
  }

  //Get the partial placement for this service
  getCustomPlaceRequestedFor(service: string) {
    for (var i=0; i<this.placesRequested.length; i++) {
      if (this.placesRequested[i].service == service) {
        return this.placesRequested[i];
      }
    }
    return null;
  }


  /*--- AFFINITY METHODS ---*/

  //Add an affinity constraint
  addAffinity(): void {
    this.affinities.push({
      service1: '',
      service2: '',
    });
  }

  //Delete an affinity constraint
  deleteAffinity(a) {
    for (var i=0; i<this.affinities.length; i++) {
      var a1 = this.affinities[i];
      if (a1 == a) {
        this.affinities.splice(i, 1);
        break;
      } 
    }
  }

  //Get affinity constraints for this service
  getAffinitiesFor(service: string) {
    var affs = Array<Affinity>();
    for (var i=0; i<this.affinities.length; i++) {
      if (this.affinities[i].service1 == service || this.affinities[i].service2 == service) affs.push(this.affinities[i]);
    }
    if (affs.length > 0) return affs;
    return null;
  }

  /*--- ANTI-AFFINITY METHODS ---*/

  //Add an anti-affinity constraint
  addAntiaffinity(): void {
    this.antiAffinities.push({
      service1: '',
      service2: ''
    })
  }

  //Delete an anti-affinity constraint
  deleteAntiaffinity(a) {
    for (var i=0; i<this.antiAffinities.length; i++) {
      var a1 = this.antiAffinities[i];
      if (a1 == a) {
        this.antiAffinities.splice(i, 1);
        break;
      }
    }
  }

  //Get anti-affinity constraints for this service
  getAntiaffinitiesFor(service: string) {
    var affs = Array<Affinity>();
    for (var i=0; i<this.antiAffinities.length; i++) {
      //console.log(this.antiAffinities[i]);
      if (this.antiAffinities[i].service1 == service || this.antiAffinities[i].service2 == service) affs.push(this.antiAffinities[i]);
    }
    if (affs.length > 0) return affs;
    return null;
  }

  //-------------------------------------------------------------------------------------------------------------------------------------

  /*--- QUERY CREATION METHODS ---*/

  //Check the information when the execution is called from placement page
  checkInformation1() {
    for (var i=0; i<this.services.length; i++) {
      var s = this.services[i];
      var pl = this.getCustomPlaceRequestedFor(s);
      var aff = this.getAffinitiesFor(s);
      var anaff = this.getAntiaffinitiesFor(s);
      if (pl && (aff || anaff)) {
        //Case requested placement and affinity or anti-affinity
        this.err = 'A placement involved in a constraint is already placed';
        return -1;
      }
      else if (aff && anaff) {
        for (var j=0; j<anaff.length; j++) {
          for (var z in aff) {
            if ((aff[z].service1 == anaff[j].service1 && aff[z].service2 == anaff[j].service2) || 
            (aff[z].service2 == anaff[j].service1 && aff[z].service1 == anaff[j].service2)) {
              //Case anti-affinity = affinity
              this.err = 'Anty-affinity and affinity must not be equal';
              return -1;
            }
          }
        }
      }
      else if (pl) {
        var cntp = [];
        for (var j=0; j<this.placesRequested.length; j++) {
          var index = cntp.indexOf(this.placesRequested[j].service);
          if (index != -1) {
            //Case more than 1 placement requested
            this.err  = 'There are more than one placement requested for a service';
            return -1;
          }
          else {
            cntp.push(this.placesRequested[j].service);
          }
        }
      }
    }
    return 1;

  }

  //Check the information when the execution is called from placement page
  checkInformation2() {
    for (var i=0; i<this.services.length; i++) {
      var s = this.services[i];
      var pl = this.getPlaceNodeFor(s, this.data.placement.placement);
      var aff = this.getAffinitiesFor(s);
      var anaff = this.getAntiaffinitiesFor(s);
      if (pl && (aff || anaff)) {
        //Case requested placement and affinity or anti-affinity
        this.err = 'A placement involved in a constraint is already placed';
        return -1;
      }
      else if (aff && anaff) {
        for (var j=0; j<anaff.length; j++) {
          for (var z in aff) {
            if ((aff[z].service1 == anaff[j].service1 && aff[z].service2 == anaff[j].service2) || 
            (aff[z].service2 == anaff[j].service1 && aff[z].service1 == anaff[j].service2)) {
              //Case anti-affinity = affinity
              this.err = 'Anty-affinity and affinity must not be equal';
              return -1;
            }
          }
        }
      }
      else if (pl) {
        var cntp = [];
        for (var j=0; j<this.placesRequested.length; j++) {
          var index = cntp.indexOf(this.placesRequested[j].service);
          if (index != -1) {
            //Case more than 1 placement requested
            this.err  = 'There are more than one placement requested for a service';
            return -1;
          }
          else {
            cntp.push(this.placesRequested[j].service);
          }
        }
      }
    }
    return 1;

  }

  //Create placement with the services in the correct order 
  createPlacementBase() {
    var p = Array<string>();
    var f: Array<string> = this.localStorageService.getChainFile();
    var str: string;
    if (f) {
      str = f[0];
      str = str.split('[')[1].split(']')[0].trim();
      var tmp = str.split(',');
      for (var i in tmp) p.push(tmp[i].trim());
      return p;
    }
    return null;
  }

  //Get the node where the service is in the placement passed
  getPlaceNodeFor(service: string, p: Array<Place>) {
    for (var i=0; i<p.length; i++) {
      if (service == p[i].service) {
        return p[i].node;
      }
    }
    return null;
  }

  //Get the node where the service is in a partial placement
  getPlaceInPFor(s: string, p: Array<Place>) {
    for (var i=0; i<p.length; i++) {
      if (s == p[i].service) {
        return p[i].node;
      }
    }
    return null;
  }

  getPlaceFor(s: string, p: Array<Place>): Place {
    for (var i=0; i<p.length; i++) {
      if (s == p[i].service) {
        return p[i];
      }
    }
    return null;
  }

  //Create antiaffinities string
  createAntiAffinityString() {
    var order = this.createPlacementBase();
    var str = '';
    var s1 = '';
    var s2 = '';
    var p1 = '';
    var p2 = '';
    var pl1: Place;
    var pl2: Place;
    for (var i=0; i<order.length; i++) {
      var an = this.getAntiaffinitiesFor(order[i]);
      if (an) {
        for (var j in an) {
          s1 = an[j].service1;
          if (s1) {
            if (s1 == order[i]) {
              s2 = an[j].service2;
              if (s2) {
                pl1 = this.getPlaceFor(s1, this.tmpPlacement.placement);
                pl2 = this.getPlaceFor(s2, this.tmpPlacement.placement);
                if (pl1 && pl2) {
                  p1 = pl1.node;
                  p2 = pl2.node;
                  if (str == '') str = p1 + ' \\== ' + p2;
                  else str = str + ', ' + p1 + ' \\== ' + p2;
                }
              }
            }
          }
        }
      }
    }
    return str;
  }

  //Create placement when a partial placement exists already
  createQueryPlacement2() {
    var order = this.createPlacementBase();
    this.tmpPlacement.placement = [];
    var p = this.tmpPlacement.placement;
    if (this.affinities.length == 0 && this.antiAffinities.length == 0 && this.placesRequested.length == 0) {
      if (order) {
        for (var i=0; i<order.length; i++) {
          var s = order[i];
          //Search the place in the placement passed by page
          var n = this.getPlaceNodeFor(s, this.data.placement.placement);
          if (n) {
            p.push({
              service: s,
              node: n,
            });
          }
          else {
            p.push({
              service: s,
              node: 'N' + i,
            });
          }
        }
      }
    }
    else {
      if (order) {
        for (var i=0; i<order.length; i++) {
          var s = order[i];
          //Search the place in the placement passed by page
          var pl = this.getPlaceNodeFor(s, this.data.placement.placement);
          var aff = this.getAffinitiesFor(s);
          var anaff = this.getAntiaffinitiesFor(s);
          //console.log(pl ,aff,anaff);
          if (!pl) {
            //Case not placement specified for this node in the partial placement
            if (aff) {
              //Check if the service is already in temporary placement p, for a precedent affinity constraint
              var n0 = this.getPlaceInPFor(s, p);
              if (!n0) {
                n0 = 'N' + i;
              }
              p.push({
                service: s,
                node: n0
              });
              for (var j in aff) {
                if (aff[j].service1 == s) {
                  //Check if the other service is already placed in the partial placement specified by the user
                  if (!this.getPlaceNodeFor(aff[j].service2, this.data.placement.placement)) {
                    //Check if the other service is already placed in the temporary placement, for an affinity
                    var node2 = this.getPlaceNodeFor(aff[j].service2, this.tmpPlacement.placement);
                    if (!node2) {
                      p.push({
                        service: aff[j].service2,
                        node: n0
                      });
                    }
                    else {
                      //Update the service for this node
                      this.getPlaceFor(s, this.tmpPlacement.placement).node = node2;
                    }
                  }
                  else {
                    console.log('a service has been placed before');
                    return null;
                  }
                }
                else if (aff[j].service2 == s) {
                  //Check if the other service is already placed in the partial placement specified by the user
                  if (!this.getPlaceNodeFor(aff[j].service1, this.data.placement.placement)) {
                    var node1 = this.getPlaceNodeFor(aff[j].service1, this.tmpPlacement.placement);
                    if (node1) {
                      p.push({
                        service: aff[j].service1,
                        node: n0,                  
                      });
                    }
                    else {
                      this.getPlaceFor(s, this.tmpPlacement.placement).node = node1;
                    }
                  }
                  else {
                    console.log('a service has been placed before');
                    return null;                    
                  }
                }
              }
            }
            else {
              p.push({
                service: s,
                node: 'N' + i,
              });
            }
            if (anaff) {
              //Check if it's correct
              for (var j in anaff) {
                for (var z in aff) {
                  if ((aff[z].service1 == anaff[j].service1 && aff[z].service2 == anaff[j].service2) || 
                  (aff[z].service2 == anaff[j].service1 && aff[z].service1 == anaff[j].service2)) {
                    //Case anti-affinity = affinity
                    console.log('a service has been placed before');
                    return null;
                  }
                }
              }
              if (!anaff && !aff) {
                if (!this.getPlaceNodeFor(s, this.data.placement.placement)) { 
                  p.push({
                    service: s,
                    node: 'N' + i
                  });
                }
                else {
                  console.log('a service has been placed before');
                  return null;
                }
              }
            }
          } 
          else {
            if (aff || anaff) {
              console.log('a service has been placed before');
              return null;
            }
            else {
              p.push({
                service: s,
                node: pl,
              });
            }
          }
        }
      }
    }
    //console.log(p);
    this.tmpPlacement.placement = p;
  }

  //Create placement structure
  createQueryPlacement() {
    //Reset the placement
    this.tmpPlacement.placement = [];
    var order = this.createPlacementBase();
    var p = this.tmpPlacement;
    if (this.affinities.length == 0 && this.antiAffinities.length == 0 && this.placesRequested.length == 0) {
      if (order) {
        for (var i=0; i<order.length; i++) {
          var s = order[i];
          this.tmpPlacement.placement.push({
            service: s,
            node: 'N' + i,
          });
        }
      }
    }
    else {
      if (order) {
        for (var i=0; i<order.length; i++) {
          var s = order[i];
          var pl = this.getCustomPlaceRequestedFor(s);
          var aff = this.getAffinitiesFor(s);
          var anaff = this.getAntiaffinitiesFor(s);
          //console.log(pl, aff, anaff);
          if (pl && !aff && !anaff) {
            p.placement.push({
              service: pl.service,
              node: pl.node,
            })
          }
          else if (pl && (aff || anaff)) {
            return null;
          }
          else {
            if (aff) {
              var n0 = this.getPlaceNodeFor(s, this.tmpPlacement.placement);
              if (!n0) {
                n0 = 'N' + i;
              }
              p.placement.push({
                service: s,
                node: n0
              });
              for (var j in aff) {
                if (aff[j].service1 == s) {
                  if (!this.getCustomPlaceRequestedFor(aff[j].service2)) {
                    //If service2 is not already placed, place now
                    if (!this.getPlaceInPFor(aff[j].service2, this.tmpPlacement.placement)) {
                      p.placement.push({
                        service: aff[j].service2,
                        node: n0
                      });
                    }
                    else {
                      //Update the node place for this service
                      var actpl = this.getPlaceFor(s, this.tmpPlacement.placement);
                      actpl.node = this.getPlaceNodeFor(aff[j].service2, this.tmpPlacement.placement);
                    }
                  }
                  else {
                    return null;
                  }
                }
                else {
                  if (!this.getCustomPlaceRequestedFor(aff[j].service1)) {
                    if (!this.getPlaceNodeFor(aff[j].service1, this.tmpPlacement.placement)) {
                      p.placement.push({
                        service: aff[j].service1,
                        node: n0,                  
                      });
                    }
                    else {
                      //Update the node place for this service
                      var actpl = this.getPlaceFor(s, this.tmpPlacement.placement);
                      actpl.node = this.getPlaceNodeFor(aff[j].service1, this.tmpPlacement.placement);
                    }
                  }
                  else {
                    return null;
                  }
                }
              }
            }
            else {
              //Case not affinity specified for this node
              this.tmpPlacement.placement.push({
                service: s,
                node: 'N' + i,
              });
            }
            if (anaff) {
              //Check if it's correct
              for (var j in anaff) {
                for (var z in aff) {
                  if ((aff[z].service1 == anaff[j].service1 && aff[z].service2 == anaff[j].service2) || 
                  (aff[z].service2 == anaff[j].service1 && aff[z].service1 == anaff[j].service2)) {
                    //Case anti-affinity = affinity
                    return null;
                  }
                }
              }
            }
          } 
        }
      }
    }
  }

  //Create query for routes
  createQueryRoutes() {
    return 'Routes';
  }

  //CreateQuery from a specified routes
  createQueryFromRoutes(routes: Routes) {
    return 'Routes'
  }

  //Create the query when the execution is called from chain or infrastructure page
  createQuery(): string {
    var query: string;
    this.createQueryPlacement();
    this.createQueryRoutes();
    var pl = '';
    if (this.placesRequested.length == 0 && this.affinities.length == 0 && this.antiAffinities.length == 0) pl = 'Placement';
    else pl = this.createPlacementStringFromPlacement(this.tmpPlacement);
    var rt = this.createRoutesStringFromRoutes(this.tmpPlacement);
    if (this.antiAffinities.length <= 0) {
      if (this.heuristicMode == false) {
        query = 'query(placement(Chain' + ', ' + pl + ', ' + rt + ')).';
      }
      else {
        query = 'query(placement(Chain' + ', ' + pl + ', ' + rt + ', ' + this.thrhw + ', ' + this.thrqos + ')).';
      }
    }
    else {
      if (this.heuristicMode == false) {
        query = 'query(placement2(Chain,' + pl + ', ' + rt + ')).' + 
          '\nplacement2(Chain, ' + pl + ', ' + rt + ') :- placement(Chain' + 
          ', ' + pl + ', ' + rt + '),' + this.createAntiAffinityString() + '.';
      }
      else {
        query = 'query(placement2(Chain' + ', ' + pl + ', ' + rt + ')).' + 
        '\nplacement2(Chain, ' + pl + ', ' + rt + ') :- placement(Chain' +
        ', ' + pl +', ' + rt + ', ' + this.thrhw + ', ' + this.thrqos + '),' + this.createAntiAffinityString() + '.';
      }
    }
    return query;
  }


  //Create placement string from placement structure
  createPlacementStringFromPlacement(p: Placement) {
    var str = '';
    var order = this.createPlacementBase();

    for (var i=0; i<order.length; i++) {
      var n = this.getPlaceRequestedFor(order[i], p);
      if (n) {
        //Add the placement if it is specified
        if (i==0) str = 'on(' + order[i] + ',' + n + ')';
        else str = str + ', on(' + order[i] + ',' + n + ')';
      }
      else {
        //Add a variable
        if (i==0) str = 'on(' + order[i] + ',' + 'N' + i + ')';
        else str = str + ', on(' + order[i] + ',' + 'N' + i + ')';
      }
    }
    str = '[' + str + ']';
    return str;
  }

  createRoutesStringFromRoutes(p: Placement) {
    var str = '';
    str = 'ServiceRoutes';
    return str;
  }

  //Create query when the execution is called from placement page
  createQueryFromPlacement2(): string {
    var query: string;
    var tmpp: Array<Place> = [];
    //console.log(this.data.placement);
    //Create a placement in tmpPlacement
    this.createQueryPlacement2();
    //Create routes in tmpPlacement
    this.createQueryRoutes();
    var pl = '';
    //Create placement string from tmpPlacement
    pl = this.createPlacementStringFromPlacement(this.tmpPlacement);
    var rt = this.createRoutesStringFromRoutes(this.tmpPlacement);
    if (this.antiAffinities.length == 0) {
      if (this.heuristicMode == false) {
        query = 'query(placement(Chain' + ', ' + pl + ', ' + rt + ')).';
      }
      else {
        query = 'query(placement(Chain' + ', ' + pl + ', ' + rt + ', ' + this.thrhw + ', ' + this.thrqos + ')).';
      }
    }
    else {
      if (this.heuristicMode == false) {
        query = 'query(placement(Chain' + ', ' + pl + ', ' + rt + '),' + this.createAntiAffinityString() + ').';
      }
      else {
        query = 'query(placement(Chain' + ', ' + pl + ', ' + rt + ', ' + this.thrhw + ', ' + this.thrqos + '),' + this.createAntiAffinityString() + ').';
      }
    }
    return query;
  }

  //Create a preview of the query to view it in the dialog
  queryPreview() {
    //this.err = '';
    var query: string;
    if (this.data.type == 0) {
      var query: string;
      this.createQueryPlacement();
      this.createQueryRoutes();
      var pl = '';
      if (this.placesRequested.length == 0 && this.affinities.length == 0 && this.antiAffinities.length == 0) pl = 'Placement';
      else pl = this.createPlacementStringFromPlacement(this.tmpPlacement);
      var rt = this.createRoutesStringFromRoutes(this.tmpPlacement);
      if (this.antiAffinities.length <= 0) {
        if (this.heuristicMode == false) {
          query = 'query(placement(Chain' + ', ' + pl + ', ' + rt + ')).';
        }
        else {
          query = 'query(placement(Chain' + ', ' + pl + ', ' + rt + ', ' + this.thrhw + ', ' + this.thrqos + ')).';
        }
      }
      else {
        if (this.heuristicMode == false) {
          query = 'query(placement(Chain' + ', ' + pl + ', ' + rt + '),' + this.createAntiAffinityString() + ').';
        }
        else {
          query = 'query(placement(Chain' + ', ' + pl + ', ' + rt + ', ' + this.thrhw + ', ' + this.thrqos + '),' + this.createAntiAffinityString() + ').';
        }
      }
    }
    else if (this.data.type == 1) {
      var query: string;
      var tmpp: Array<Place> = [];
      //Create a placement in tmpPlacement
      this.createQueryPlacement2();
      //Create routes in tmpPlacement
      this.createQueryRoutes();
      var pl = '';
      //Create placement string from tmpPlacement
      pl = this.createPlacementStringFromPlacement(this.tmpPlacement);
      var rt = this.createRoutesStringFromRoutes(this.tmpPlacement);
      if (this.antiAffinities.length == 0) {
        if (this.heuristicMode == false) {
          query = 'query(placement(Chain' + ', ' + pl + ', ' + rt + ')).';
        }
        else {
          query = 'query(placement(Chain' + ', ' + pl + ', ' + rt + ', ' + this.thrhw + ', ' + this.thrqos + ')).';
        }
      }
      else {
        if (this.heuristicMode == false) {
          query = 'query(placement(Chain' + ', ' + pl + ', ' + rt + '),' + this.createAntiAffinityString() + ').';
        }
        else {
          query = 'query(placement(Chain' + ', ' + pl + ', ' + rt + ', ' + this.thrhw + ', ' + this.thrqos + '),' + this.createAntiAffinityString() + ').';
        }
      }
    }
    return query;
  }



  //----------------------------------------------------------------------------------------------------------------------------------
  /*--- PARSING RESULT METHODS ---*/

  //Create a placement structure from the result of POST
  createResult(result) {
    var placements = result.split('placement');
    for (var i in placements) {
      var prob: string = <string>placements[i].split(' : ')[1];
      if (prob) {
        prob = prob.trim();
      }
      var placement0 =  placements[i].split(',[')[1];
      if (placement0) {
        placement0 = placement0.split(']')[0];
      }
      var routesTmp =<string>placements[i].split(',[')[2];
      var routes: string;
      if (routesTmp) {
        //TODO: problem if a service contains ':' in the name
        routes = routesTmp.split(':')[0];
      }
      var chainIdtmp = <string>placements[i].split('(')[1];
      var chainId: string;
      if (chainIdtmp) {
        chainId = chainIdtmp.split(',')[0].trim();
      }
      var p: Array<Place> = this.createPlacement(placement0);
      var r: Array<Route> = this.createRoutes(routes);
      if (p != null && r != null) {
        if (Number(prob) > 0) {
          var placement = {
            chainId: chainId,
            placement: p,
            routes: r,
            prob: Number(prob),
            id: this.placementId
          }
          this.placements.push(placement);
          this.placementId++;
        }
        else {
          //Do nothing if prob <= 0
        }
      }
    }
    if (this.placements.length > 0) {
      this.localStorageService.storePlacements(this.placements);
    }
  }

  //Create placement from the placement string
  createPlacement(str: string): Array<Place> {
    var ps = Array<Place>();
    var tmp: Array<string>;
    var tmp2: Array<string>;
    var service: string;
    var node: string;
    var pselem: Place;
    if (str) {
      tmp = str.split('),');
    }
    else return null;
    for (var i in tmp) {
      if (tmp[i]) {
        tmp2 = tmp[i].split('(');
        if (tmp2[1]) {
          service = tmp2[1].split(',')[0];
          node = tmp2[1].split(',')[1];
          if (node.indexOf(')')>=0) {
            node = node.split(')')[0];
          }
          if (node && service) {
            pselem = {
              service: service.trim(),
              node: node.trim()
            };
            ps.push(pselem);
          }
          else return null;
        }
        else return null;
      }
      else return null;
    }
    return ps;
  }

  //Create routes from routes string
  //example: (parkingServices, mannLab, 15, [(cctv_driver, feature_extr)])
  createRoutes(str: string) {
    var rts = Array<Route>();
    var tmp = Array<string>();
    var tmp2 = Array<string>();
    var tmp3 = Array<string>();
    var node1 = '';
    var node2 = '';
    var usedBw = '';
    var from = '';
    var to = '';
    var elem: Route;
    var bw: number;
    var from2 = '';
    var to2 = '';
    var node2 = '';
    var flowstr = Array<string>();
    var flows: Array<{
      from: string,
      to: string,
    }>;
    if (str) {
      tmp = str.split(']),');
    }
    else return null;
    for (var i in tmp) {
      if (tmp[i].indexOf(',') <= 0) {
        //Case empty routes
        return [];
      }
      if (tmp[i]) {
        tmp2 = tmp[i].split(',');
        node1 = tmp2[0];
        node2 = tmp2[1];
        usedBw = tmp2[2];
        flows = [];
        
        if (tmp[i].split('[')[1]) {
          flowstr = tmp[i].split('[')[1].split('(');
        }

        if (usedBw) {
          bw = Number(usedBw.trim());
        }
        if (node2 && node1) {
          node1 = node1.split('(')[1];
          node2 = node2;
        }

        for (var i in flowstr) {
          var s1 = flowstr[i].split(',')[0];
          var s2 = flowstr[i].split(',')[1];
          if (s2) s2 = s2.split(')')[0];
          if (s1 && s2) {
            s1 = s1.trim();
            s2 = s2.trim();
            if (s1 && s2 && s1.indexOf(' ') < 0 && s2.indexOf(' ') < 0) {
              flows.push({
                from: s1,
                to: s2
              })
            }
          }
        }

        if (node1 && node2 && bw && flows && isNaN(bw) == false) {
          elem = {
            fromNode: node1.trim(),
            toNode: node2.trim(),
            usedBw: bw,
            flows: flows,
          };
          rts.push(elem);
        }
        else return null;
      }
      else return null;
    }
    return rts;
  }

  //Get the node where the service is
  getPlaceRequestedFor(s: string, p: Placement) {
    for (var i in p.placement) {
      if (p.placement[i].service == s) {
        return p.placement[i].node;
      }
    }
    return null;
  }

  //-------------------------------------------------------------------------------------------------------------------------------
  /*--- HTTP POSTS ---*/

  //TODO: gestione dell'errore delle richieste http

  //Send infrastructure file to flask
  sendInfrastructure() {
    var infra = this.localStorageService.getInfrastructureFile();
    if (infra) {
      let blob = new Blob([infra.join('\n')], {
        type: 'plain/text'
      });
      const formData: FormData = new FormData();
      formData.append('infra.pl', blob);
      this.http.postFile(this.serverUrl + '/infrastructure/', formData).pipe(catchError(this.handleError).bind(this)).subscribe(async result => {
        console.log(result);
      });
    }
    else {
      this.err = 'Infrastructure is missing'
    }
  }

  //Send chain file to flask
  sendChain() {
    var chain = this.localStorageService.getChainFile();
    if (chain) {
      let blob = new Blob([chain.join('\n')], {
        type: 'plain/text'
      });
      const formData: FormData = new FormData();
      formData.append('chain.pl', blob);
      this.http.postFile(this.serverUrl + '/chain/', formData).pipe(catchError(this.handleError).bind(this)).subscribe(async result => {
        console.log(result);
      });
    }
    else {
      this.err = 'Chain is missing';
    }
  }

  handleError = (error: HttpErrorResponse) => {
    this.spinner.close();
    //TODO: not show the error
    this.err = 'Something bad happened, please try again';
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } 
    else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  };


  async createHeuristicResult(pl: Placement, last: number) {
    var res = await this.submitQueryForEvalHeuristicResult(pl, last);
    var tmp: string = <string>res.split(' : ')[1];
    var prob: number;
    if (tmp) {
      tmp = tmp.trim();
      prob = Number(tmp);
    }
    pl.prob = prob;
    return pl;
  }

  //Send the query
  submitQuery() {
    var ok = 0;
    var h = '';
    /*  
      Case execution called from chain or infrastructure page:
    */
    if (this.data.type == 0) {
      ok = this.checkInformation1();
      if (ok == 1) {
        this.sendInfrastructure();
        this.sendChain();
        var query = this.createQuery();
        if (query) {
          this.openSpinnerDialog();
          if (this.heuristicMode == false) h = 'edgeusher';
          else h = 'hedgeusher';
          if (this.heuristicMode == true) {
            this.http.postQuery(this.serverUrl + '/query/', query, h, 0).pipe(catchError(this.handleError.bind(this))).subscribe(async result => {
              this.createResult(result);
              var last = 0;
              if (this.placements.length > 0) {
                for (var i=0; i < this.placements.length; i++) {
                  //console.log(this.placements[i]);
                  if (i == this.placements.length - 1) last = 1;
                  var tmpl = await this.createHeuristicResult(this.placements[i], last);
                  this.placements[i] = tmpl;
                }
                this.localStorageService.storePlacements(this.placements);
                this.spinner.close();
                this.router.navigate(['/placement']);
                this.dialogRef.close();
              }
              else {
                this.spinner.close();
                console.log('no valid placement');
                this.err = "There aren't valid placements";
              }
            });
          }
          else {
            this.http.postQuery(this.serverUrl + '/query/', query, h, 1).pipe(catchError(this.handleError)).subscribe(result => {
              this.spinner.close();
              this.createResult(result);
              if (this.placements.length > 0) {
                this.router.navigate(['/placement']);
                this.dialogRef.close();
              }
              else {
                console.log('no valid placement');
                this.err = "There aren't valid placements";
              }
            });
          }
        }
      }
    }
    /*
      Case execution called from placement: 
    */
    else if (this.data.type == 1) {
      /*
        Retrieve actual placement and create the query
      */
      ok = this.checkInformation2();
      if (ok == 1) {
        this.sendInfrastructure();
        this.sendChain();
        var query: string;
        query = this.createQueryFromPlacement2();
        if (query) {
          this.openSpinnerDialog();
          if (this.heuristicMode == true) {
            h = 'hedgeusher';
            this.http.postQuery(this.serverUrl + '/query/', query, h, 0).pipe(catchError(this.handleError).bind(this)).subscribe(async result => {
              this.createResult(result);
              if (this.placements.length == 0) {
                this.spinner.close();
                console.log('no valid placement');
                this.err = "There aren't valid placements";
              }
              else {
                var last = 0;
                for (var i=0; i<this.placements.length; i++) {
                  //console.log(this.placements[i]);
                  if (i == this.placements.length - 1) last = 1;
                  var tmpl = await this.createHeuristicResult(this.placements[i], last);
                  this.placements[i] = tmpl;
                }
                this.localStorageService.storePlacements(this.placements);
                this.spinner.close();
                this.reloadPage.emit(1);
                this.dialogRef.close();
              }
            });
          }
          else {
            h = 'edgeusher';
            if (query) {
              this.http.postQuery(this.serverUrl + '/query/', query, h, 1).pipe(catchError(this.handleError).bind(this)).subscribe(result => {
                this.spinner.close();
                //TODO: aggiornare pagina placements cancellando i vecchi per mostrare i nuovi
                //TODO: in caso di restituzione valori da euristica ricalcolare la probabilità dei placement, che è sbagliata
                this.createResult(result);
                if (this.placements.length == 0) {
                  console.log('no valid placement');
                  this.err = "There aren't valid placements";
                }
                else {
                  this.localStorageService.storePlacements(this.placements);
                  this.reloadPage.emit(1);
                  this.dialogRef.close();
                }
              });
            }
          }
        }
      }
    }
  }

  async submitQueryForEvalHeuristicResult(placement: Placement, last: number) {
    var query = '';
    var pl = '';
    var rt = '';
    for (var i=0; i < placement.placement.length; i++) {
      var p = placement.placement[i];
      if (pl == '') {
        pl = 'on(' + p.service + ',' + p.node + ')';
      }
      else pl = pl + ', on(' + p.service + ',' + p.node + ')';
    }
    pl = '[' + pl + ']';
    for (var i=0; i < placement.routes.length; i++) {
      var r = placement.routes[i];
      if (rt == '') {
        rt = '(' + r.fromNode + ', ' + r.toNode + ', ' + r.usedBw;
        var fs = '';
        for (var j in r.flows) {
          if (fs == '') {
            fs = '(' + r.flows[j].from + ', ' + r.flows[j].to + ')'; 
          }
          else {
            fs = fs + ', (' + r.flows[j].from + ', ' + r.flows[j].to + ')'; 
          }
        }
        rt = rt + ', [' + fs + '])';
      }
      else {
        rt = rt + ', (' + r.fromNode + ', ' + r.toNode + ', ' + r.usedBw;
        var fs = '';
        for (var j in r.flows) {
          if (fs == '') {
            fs = '(' + r.flows[j].from + ', ' + r.flows[j].to + ')'; 
          }
          else {
            fs = fs + ', (' + r.flows[j].from + ', ' + r.flows[j].to + ')'; 
          }
        }
        rt = rt + ', [' + fs + '])';
      }
    }
    rt = '[' + rt + ']';
    query = 'query(placement(' + placement.chainId + ', ' + pl + ', ' + rt +')).'
    var h = 'edgeusher';
    //Retry for tree times if fail
    return await this.http.postQuery(this.serverUrl + '/query/', query, h, last).pipe(retry(3)).toPromise();
  }

  openSpinnerDialog() {
    this.spinner = this.dialog.open(ProgressSpinnerDialogComponent, {
      autoFocus: false,
      disableClose: true,
    });
  }
    
}
