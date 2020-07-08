import { Injectable } from '@angular/core';
import { Service } from '../app/svg-chain/service';
import { Flow } from '../app/svg-chain/flow';
import { Subchain } from '../app/svg-chain/subchain';
import { Rule } from '../app/function-dialog/function-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ChainErrorCheckingService {

  services = Array<any>();
  flows = Array<any>();

  constructor() { }

  checkChainFile(chain: Array<string>) {
   
    var cnt = 0;
    this.services = [];
    this.flows = [];
    var serviceId = 0;
    var flowId = 0;
    var subId = 0;
    for (var i=0 ; i<chain.length; i++) {

      var l = chain[i];
      var tmp = l.trim().split('(');

      if (tmp[0].trim() == 'service') {
        //Get the parameters
        var str = tmp[1].trim().split(')')[0].trim();
        //Get array of parameters
        var params = str.split(',');
        //Create new service and assign an id
        var service = new Service(null);
        service.id = serviceId;

        //Get the service name
        var name = params[0].trim();
        if (name != '' && name.indexOf(' ') < 0 && this.checkSpecialCharacters(name) == 1) {
          service.name = name;
        }
        else {
          return -1;
        }
        this.services.push(service);
        serviceId++;
      }
      else if (tmp[0] == 'flow') {
        var str = tmp[1].trim().split(')')[0].trim();
        //Create a new flow and assign an id
        var flow = new Flow(null);
        flow.id = flowId;
        //Get the parameters
        var params = str.split(',');
        //Get the first service name
        var servicename = params[0].trim();
        if (servicename != '' && servicename.indexOf(' ') < 0 && this.checkSpecialCharacters(name) == 1) {
          flow.fromService = servicename.toLowerCase();
        }          
        else {
          //Case service name contains wrong characters
          return -1;
        }
        //Get the second service name
        servicename = params[1].trim();
        if (servicename != '' && servicename.indexOf(' ') && this.checkSpecialCharacters(name) == 1) {
          flow.toService = servicename.toLowerCase();
        }
        else {
          //Case service name contains wrong characters
          return -1;
        }
        this.flows.push(flow);
        flowId++;
      }
      else if (tmp[0] == 'maxLatency') {
        cnt++;
      }

    }

    for (var z in this.flows) {
      var errs = 0;
      var flow2 = this.flows[z];
      //console.log('flow from ' + flow.fromService + ' to ' + flow.toService)
      var fromIndex = this.indexOfServiceByName(flow2.fromService);
      if (fromIndex == -1) {
        return -1;
      }
      var toIndex = this.indexOfServiceByName(flow2.toService);
      if (toIndex == -1) {
        return -1;
      }
      var from = this.services[fromIndex];
      var to = this.services[toIndex];
      //console.log(flow.toService + ' of index ' + this.indexOfServiceByName(flow.toService));
      //console.log('flow from ' + from.name  + ' to ' + to.name);
      from.addConnectedService(to.id);
    }

    //Now we have the information

    //Variable if a cycle is detected
    var isCycle = false;
    //Variable for the root services
    var roots = Array<Service>();
    var root = 1;
    for (var p=0; p<this.services.length; p++) {
      //Check if the node is a root
      var h = 0;
      while (h < this.services.length && root != -1) {
        if (h != p) {
          //If the square p is connected to square h, the square p is not a root (h --> p)
          if (this.services[h].hasConnectedService(this.services[p].id)) {
            root = -1;
          }
        }
        h++;
      }
      //If root is still 1 the node is a root and add it to the roots
      if (root == 1) {
        roots.push(this.services[p]);
      }
      //else if root = -1 root = 1 for the next iteration
      else root = 1;
    }

    //If there aren't roots, there is a cycle for sure
    if (roots.length == 0) {
      console.log('there is not roots');
      isCycle = true;
    }
    else {
      //For every root do DFS to detect cycles
      for (var p=0; p<roots.length; p++) {
        //DFS return true if it detects a cycle in the chain
        isCycle = this.DFS(roots[p].id, roots[p].connectedServices, []);
        //Break the loop if there is a cycle
        if (isCycle == true) break;
      }
    }
    if (isCycle == false) {
      //If there aren't cycles check if the chain is connected correctly 
      var isConnected = this.checkIfConnected(roots);
      if (isConnected == true) {
        if (cnt == 1) return 1;
        //Case not one max latency constraint
        else return -1;
      }
      else {
        //Case chain not properly connected
        return -1;
      }
    }
    else {
      //Case cycle in the chain
      return -1;
    }

  }

  indexOfServiceByName(name: string) {
    for (var i in this.services) {
      if (this.services[i].name == name) return Number(i);
    }
    return -1;
  }

  indexOfServiceById(id: number) {
    for (var i in this.services) {
      if (this.services[i].id == id) return Number(i);
    }
    return -1;
  }

  //DFS to detect cycle in the chain
  DFS(id: number, toVisit: Array<number>, visitedInThePath: Array<number>): boolean {
    //If it ends there is no cycle in this chain
    //If the id is present in the visited ids return false
    var index = this.indexOfServiceById(id);
    for (var i in visitedInThePath) {
      //If a node that are visited in the past is found now there is a cycle
      if (visitedInThePath[i] == id) {
        return true;
      }
    }
    //If there aren't other services to visit return false, because there is not cycle here
    if (this.services[index].connectedServices.length == 0) return false;
    //Add this square to visited
    visitedInThePath.push(id);
    //Check if the id is in the node to visit
    var c: boolean;
    for (var i in this.services[index].connectedServices) {
      //Get the index of the square to visit
      var ind = this.indexOfServiceById(this.services[index].connectedServices[i]);
      c = this.DFS(this.services[ind].id, this.services[ind].connectedServices, visitedInThePath);
      if (c == true) {
        //In this case there is a cycle, then stop now and return true to the upper level
        return true;
      }
      visitedInThePath.splice(visitedInThePath.length-1, 1);
    }
    return false;
  }

  //Check if the services are connected to others services
  checkIfConnected(roots: Array<Service>) {
    var found = false;
    var firstSubtree = Array<number>();
    for (var i=0; i<roots.length; i++) {
      //Create the subtree from the root for every root
      if (i == 0) firstSubtree = this.checkifCon(roots[i].id);
      else var a = this.checkifCon(roots[i].id);
      //If this is not the first root, check if the nodes in the subtree are part of the other root's subtrees
      if (i != 0) {
        var found = false;
        var k = 0;
        while (!found && k < a.length) {
          var z = 0;
          while (!found && z < firstSubtree.length) {
            if (firstSubtree[z] == a[k]) {
              found = true;
              break;
            }
            z++;
          }
          if (k == a.length-1 && found == false) {
            //console.log('in a subtree the nodes are reachable only from a root that is not the first');
            return false;
          }
          else k++;
        }
      }
    }

    return true;
  }

  //Check if a subtree is connected recursively
  checkifCon(root: number): Array<number> {
    var index = this.indexOfServiceById(root);
    var a = Array<number>();
    var b = Array<number>();
    if (this.services[index].connectedServices.length == 0) return [];
    for (var i=0; i<this.services[index].connectedServices.length; i++) {
      b.push(this.services[index].connectedServices[i]);
      a = this.checkifCon(this.services[index].connectedServices[i]);
      for (var j in a) b.push(a[j]);
    }
    return b;
  }

  checkSpecialCharacters(str: string): number {
    if (str.indexOf('::') != -1 ||
     str.indexOf('[') != -1 ||
     str.indexOf(']') != -1 || 
     str.indexOf('(') != -1 || 
     str.indexOf(')') != -1) return -1;
    else return 1;
  }

}
