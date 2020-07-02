import { Service } from './service';
import { SvgChainComponent } from './svg-chain.component';
import { Flow } from './flow';

export class Subchain {
  services = Array<Service>();
  //flows = Array<Flow>();
  maxLatency = 0;
  id: number;
  svg: SvgChainComponent;
  path = '';
  textpath = '';

  constructor(svg: SvgChainComponent) {
    this.svg = svg;
    this.id = 0;
  }

  createSpaceQ(x1, y1, x2, y2) {
    var path = ' Q ' + x1 + ' ' + y1 + ' ' + x2 + ' ' + y2;
    return path;
  }

  createSpaceL(x1, y1) {
    return (' L ' + x1 + ' ' + y1);
  }

  createSpaceArc(r, x, y) {
    return (' A ' + r + ' ' + r + ' 0 0 0 ' + x + ' ' + y);
  }

  //TODO: controllare anche la x nel textpath perchè a volte si sovrappone
  
  createPathUp() {
    var x1: number;
    var y1: number;
    var x2: number;
    var y2: number;
    var diffx: number;
    var diffy: number;
    //Distance for the text path
    var d = 5;
    var path = 'M ' + this.services[0].x + ' ' + (this.services[0].y - this.services[0].r - 20);
    var textpath = 'M ' + this.services[0].x + ' ' + (this.services[0].y - this.services[0].r - 20 - 2*d);
    for (var i=0; i < this.services.length-1; i++) {
      var curr = this.services[i];
      var next = this.services[i+1];
      diffx = Math.abs(next.x - curr.x);
      diffy = Math.abs(next.y - curr.y);
      console.log(curr.name + ' : ');
      if (next.x < curr.x + curr.r && next.x > curr.x - curr.r) {
        console.log('next x overlap');
        if (next.y < curr.y + curr.r && next.y > curr.y - curr.r) {
          console.log('next y overlap');

          //Impossible case

        }
        else if (next.y < curr.y) {
          console.log('next up');

          if (diffy < 130) {
            x1 = next.x - next.r - 20;
            y1 = next.y + next.r + 20;
            x2 = next.x - next.r - 20;
            y2 = next.y;
            path = path + this.createSpaceQ(x1, y1, x2, y2);
            textpath = textpath + this.createSpaceQ(x1, (y1 - d), x2, (y2 -d));
            x1 = next.x - next.r - 20;
            y1 = next.y - next.r - 20;
            x2 = next.x;
            y2 = next.y - next.r - 20;
            path = path + this.createSpaceQ(x1, y1, x2, y2);
            textpath = textpath + this.createSpaceQ(x1, (y1 - d), x2, (y2 -d));
          }
          else {
            x2 = next.x - next.r - 20;
            y2 = next.y;
            path = path + this.createSpaceL(x2, y2);
            textpath = textpath + this.createSpaceL(x2, (y2 - d));
            x1 = next.x - next.r - 20;
            y1 = next.y - next.r - 20;
            x2 = next.x;
            y2 = next.y - next.r - 20;
            path = path + this.createSpaceQ(x1, y1, x2, y2);
            textpath = textpath + this.createSpaceQ(x1, (y1 - d), x2, (y2 -d));
          }

        }
        else {
          console.log('next bottom');

          if (diffy < 130) {
            x1 = curr.x + curr.r + 20;
            y1 = curr.y - curr.r - 20;
            x2 = curr.x + curr.r + 20;
            y2 = curr.y;
            path = path + this.createSpaceQ(x1, y1, x2, y2);
            textpath = textpath + this.createSpaceQ(x1, (y1 - d), x2, (y2 -d));
            x1 = curr.x + curr.r + 20;
            y1 = curr.y + curr.r + 20;
            x2 = next.x;
            y2 = next.y - next.r - 20;
            path = path + this.createSpaceQ(x1, y1, x2, y2);
            textpath = textpath + this.createSpaceQ(x1, (y1 - d), x2, (y2 -d));
          }
          else {
            x1 = curr.x + curr.r + 20;
            y1 = curr.y - curr.r - 20;
            x2 = curr.x + curr.r + 20;
            y2 = curr.y;
            path = path + this.createSpaceQ(x1, y1, x2, y2);
            textpath = textpath + this.createSpaceQ(x1, (y1 - d), x2, (y2 -d));
            x1 = curr.x + curr.r + 20;
            y1 = curr.y + curr.r + 20;
            x2 = curr.x;
            y2 = curr.y + curr.r + 20;
            path = path + this.createSpaceQ(x1, y1, x2, y2);
            textpath = textpath + this.createSpaceQ(x1, (y1 - d), x2, (y2 -d));
            x2 = next.x;
            y2 = next.y - next.r - 20;
            path = path + this.createSpaceL(x2, y2);
            textpath = textpath + this.createSpaceL(x2, (y2 - d));
          }
        }
      }
      else if (next.x > curr.x) {
        console.log('next at right');
        
        if (diffy < diffx) {

          console.log('next at right closer');
          x2 = next.x;
          y2 = next.y - next.r - 20;
          path = path + this.createSpaceL(x2, y2);
          textpath = textpath + this.createSpaceL(x2, (y2 -d));

        }
        else {
          if (next.y < curr.y) {
            console.log('next up');
  
            x2 = next.x - next.r - 20;
            y2 = next.y;
            path = path + this.createSpaceL(x2, y2);
            textpath = textpath + this.createSpaceL(x2, (y2 -d));
            x1 = next.x - next.r - 20;
            y1 = next.y - next.r - 20;
            x2 = next.x;
            y2 = next.y - next.r - 20;
            path = path + this.createSpaceQ(x1, y1, x2, y2);
            textpath = textpath + this.createSpaceQ(x1, (y1 - d), x2, (y2 -d));

          }
          else {
            console.log('next bottom');

            x1 = curr.x + curr.r + 20;
            y1 = curr.y - curr.r - 20;
            x2 = curr.x + curr.r + 20;
            y2 = curr.y;
            path = path + this.createSpaceQ(x1, y1, x2, y2);
            textpath = textpath + this.createSpaceQ(x1, (y1 - d), x2, (y2 -d));
            x2 = next.x;
            y2 = next.y - next.r - 20;
            path = path + this.createSpaceL(x2, y2);
            textpath = textpath + this.createSpaceL(x2, (y2 -d));

          }
        }
      }
      else {
        console.log('next at left');
        if (next.y < curr.y + curr.r && next.y > curr.y - curr.r) {
          console.log('next y overlap');

          x1 = curr.x + curr.r + 20;
          y1 = curr.y - curr.r - 20;
          x2 = curr.x + curr.r + 20;
          y2 = curr.y;
          path = path + this.createSpaceQ(x1, y1, x2, y2);
          textpath = textpath + this.createSpaceQ(x1, (y1 - d), x2, (y2 -d));
          x1 = curr.x + curr.r + 20;
          y1 = curr.y + curr.r + 20;
          x2 = curr.x;
          y2 = curr.y + curr.r + 20;
          path = path + this.createSpaceQ(x1, y1, x2, y2);
          textpath = textpath + this.createSpaceQ(x1, (y1 - d), x2, (y2 -d));
          x2 = next.x;
          y2 = next.y - next.r - 20;
          path = path + this.createSpaceL(x2, y2);
          textpath = textpath + this.createSpaceL(x2, (y2 -d));

        }
        else if (next.y < curr.y) {
          console.log('next up');

          
          x2 = next.x;
          y2 = next.y + next.r + 20;
          path = path + this.createSpaceL(x2, y2);
          textpath = textpath + this.createSpaceL(x2, (y2 -d));
          x1 = next.x - next.r - 20;
          y1 = next.y + next.r + 20;
          x2 = next.x - next.r - 20;
          y2 = next.y;
          path = path + this.createSpaceQ(x1, y1, x2, y2);
          textpath = textpath + this.createSpaceQ(x1, (y1 - d), x2, (y2 -d));
          x1 = next.x - next.r - 20;
          y1 = next.y - next.r - 20;
          x2 = next.x;
          y2 = next.y - next.r - 20;
          path = path + this.createSpaceQ(x1, y1, x2, y2);
          textpath = textpath + this.createSpaceQ(x1, (y1 - d), x2, (y2 -d));

        }
        else {
          console.log('next bottom');

          x1 = curr.x + curr.r + 20;
          y1 = curr.y - curr.r - 20;
          x2 = curr.x + curr.r + 20;
          y2 = curr.y;
          path = path + this.createSpaceQ(x1, y1, x2, y2);
          textpath = textpath + this.createSpaceQ(x1, (y1 - d), x2, (y2 -d));
          x1 = curr.x + curr.r + 20;
          y1 = curr.y + curr.r + 20;
          x2 = curr.x;
          y2 = curr.y + curr.r + 20;
          path = path + this.createSpaceQ(x1, y1, x2, y2);
          textpath = textpath + this.createSpaceQ(x1, (y1 - d), x2, (y2 -d));
          x2 = next.x;
          y2 = next.y - next.r - 20;
          path = path + this.createSpaceL(x2, y2);
          textpath = textpath + this.createSpaceL(x2, (y2 -d));

        }
      }
    }
    this.textpath = textpath;
    return path;
  }

  createPathDown() {
    var x1: number;
    var y1: number;
    var x2: number;
    var y2: number;
    var diffx: number;
    var diffy: number;
    //Distance for the text path
    var d = 18;
    var path = 'M ' + this.services[0].x + ' ' + (this.services[0].y + this.services[0].r + 20);
    var textpath = 'M ' + this.services[0].x + ' ' + (this.services[0].y + this.services[0].r + 20 + 2*d);
    for (var i=0; i < this.services.length-1; i++) {
      var curr = this.services[i];
      var next = this.services[i+1];
      diffx = Math.abs(next.x - curr.x);
      diffy = Math.abs(next.y - curr.y);
      console.log(curr.name + ' : ');
      if (next.x < curr.x + curr.r && next.x > curr.x - curr.r) {
        console.log('next x overlap');
        if (next.y < curr.y + curr.r && next.y > curr.y - curr.r) {
          console.log('next y overlap');

          //Impossible case

        }
        else if (next.y < curr.y) {
          console.log('next up');

          if (diffy < 130) {
            x1 = curr.x + curr.r + 20;
            y1 = curr.y + curr.r + 20;
            x2 = curr.x + curr.r + 20;
            y2 = curr.y;
            path = path + this.createSpaceQ(x1, y1, x2, y2);
            textpath = textpath + this.createSpaceQ(x1, (y1 + d), x2, (y2 + d));
            x1 = curr.x + curr.r + 20;
            y1 = curr.y - curr.r - 20;
            x2 = next.x;
            y2 = next.y + next.r + 20;
            path = path + this.createSpaceQ(x1, y1, x2, y2);
            textpath = textpath + this.createSpaceQ(x1, (y1 + d), x2, (y2 + d));
          }
          else {
            x1 = curr.x + curr.r + 20;
            y1 = curr.y + curr.r + 20;
            x2 = curr.x + curr.r + 20;
            y2 = curr.y;
            path = path + this.createSpaceQ(x1, y1, x2, y2);
            textpath = textpath + this.createSpaceQ(x1, (y1 + d), x2, (y2 + d));
            x2 = next.x;
            y2 = next.y + next.r + 20;
            path = path + this.createSpaceL(x2, y2);
            textpath = textpath + this.createSpaceL(x2, (y2 + d));
          }

        }
        else {
          console.log('next bottom');

          if (diffy < 130) {
            x1 = next.x - next.r - 20;
            y1 = next.y - next.r - 20;
            x2 = next.x - next.r - 20;
            y2 = next.y;
            path = path + this.createSpaceQ(x1, y1, x2, y2);
            textpath = textpath + this.createSpaceQ(x1, (y1 + d), x2, (y2 + d));
            x1 = next.x - next.r - 20;
            y1 = next.y + next.r + 20;
            x2 = next.x;
            y2 = next.y + next.r + 20;
            path = path + this.createSpaceQ(x1, y1, x2, y2);
            textpath = textpath + this.createSpaceQ(x1, (y1 + d), x2, (y2 + d));
          }
          else {
            x2 = next.x - next.r - 20;
            y2 = next.y;
            path = path + this.createSpaceL(x2, y2);
            textpath = textpath + this.createSpaceL(x2, (y2 + d));
            x1 = next.x - next.r - 20;
            y1 = next.y + next.r + 20;
            x2 = next.x;
            y2 = next.y + next.r + 20;
            path = path + this.createSpaceQ(x1, y1, x2, y2);
            textpath = textpath + this.createSpaceQ(x1, (y1 + d), x2, (y2 + d));
          }
        }
      }
      else if (next.x > curr.x) {
        console.log('next at right');
        
        if (diffy < diffx) {

          console.log('next at right closer');
          x2 = next.x;
          y2 = next.y + next.r + 20;
          path = path + this.createSpaceL(x2, y2);
          textpath = textpath + this.createSpaceL(x2, (y2 + d));

        }
        else {
          if (next.y < curr.y) {
            console.log('next up');
  
            x1 = curr.x + curr.r + 20;
            y1 = curr.y + curr.r + 20;
            x2 = curr.x + curr.r + 20;
            y2 = curr.y;
            path = path + this.createSpaceQ(x1, y1, x2, y2);
            textpath = textpath + this.createSpaceQ(x1, (y1 + d), x2, (y2 + d));
            x2 = next.x;
            y2 = next.y + next.r + 20;
            path = path + this.createSpaceL(x2, y2);
            textpath = textpath + this.createSpaceL(x2, (y2 + d));

          }
          else {
            console.log('next bottom');

            
            x2 = next.x - next.r - 20;
            y2 = next.y;
            path = path + this.createSpaceL(x2, y2);
            textpath = textpath + this.createSpaceL(x2, (y2 + d));
            x1 = next.x - next.r - 20;
            y1 = next.y + next.r + 20;
            x2 = next.x;
            y2 = next.y + next.r + 20;
            path = path + this.createSpaceQ(x1, y1, x2, y2);
            textpath = textpath + this.createSpaceQ(x1, (y1 + d), x2, (y2 + d));

          }
        }
      }
      else {
        console.log('next at left');
        if (next.y < curr.y + curr.r && next.y > curr.y - curr.r) {
          console.log('next y overlap');

          x2 = next.x;
          y2 = next.y - next.r - 20;
          path = path + this.createSpaceL(x2, y2);
          textpath = textpath + this.createSpaceL(x2, (y2 + d));
          x1 = next.x - next.r - 20;
          y1 = next.y - next.r - 20;
          x2 = next.x - next.r - 20;
          y2 = next.y;
          path = path + this.createSpaceQ(x1, y1, x2, y2);
          textpath = textpath + this.createSpaceQ(x1, (y1 + d), x2, (y2 + d));
          x1 = next.x - next.r - 20;
          y1 = next.y + next.r + 20;
          x2 = next.x;
          y2 = next.y + next.r + 20;
          path = path + this.createSpaceQ(x1, y1, x2, y2);
          textpath = textpath + this.createSpaceQ(x1, (y1 + d), x2, (y2 + d));

        }
        else if (next.y < curr.y) {
          console.log('next up');

          x1 = curr.x + curr.r + 20;
          y1 = curr.y + curr.r + 20;
          x2 = curr.x + curr.r + 20;
          y2 = curr.y;
          path = path + this.createSpaceQ(x1, y1, x2, y2);
          textpath = textpath + this.createSpaceQ(x1, (y1 + d), x2, (y2 + d));
          x1 = curr.x + curr.r + 20;
          y1 = curr.y - curr.r - 20;
          x2 = curr.x;
          y2 = curr.y - curr.r - 20;
          path = path + this.createSpaceQ(x1, y1, x2, y2);
          textpath = textpath + this.createSpaceQ(x1, (y1 + d), x2, (y2 + d));
          x2 = next.x;
          y2 = next.y + next.r + 20;
          path = path + this.createSpaceL(x2, y2);
          textpath = textpath + this.createSpaceL(x2, (y2 + d));

        }
        else {
          console.log('next bottom');

          x2 = next.x;
          y2 = next.y - next.r - 20;
          path = path + this.createSpaceL(x2, y2);
          textpath = textpath + this.createSpaceL(x2, (y2 + d));
          x1 = next.x - next.r - 20;
          y1 = next.y - next.r - 20;
          x2 = next.x - next.r - 20;
          y2 = next.y;
          path = path + this.createSpaceQ(x1, y1, x2, y2);
          textpath = textpath + this.createSpaceQ(x1, (y1 + d), x2, (y2 + d));
          x1 = next.x - next.r - 20;
          y1 = next.y + next.r + 20;
          x2 = next.x;
          y2 = next.y + next.r + 20;
          path = path + this.createSpaceQ(x1, y1, x2, y2);
          textpath = textpath + this.createSpaceQ(x1, (y1 + d), x2, (y2 + d));

        }
      }
    }
    this.textpath = textpath;
    return path;
  }

  createPath() {
    var path = '';
    var pos = 'down';
    //Search the maxY
    var maxY = 0;
    for (var k in this.svg.services) {
      var s = this.svg.services[k];
      if (this.containsById(s) == true && s.y > maxY) {
        maxY = s.y;
      }
    }
    for (var k in this.svg.services) {
      var s = this.svg.services[k];
      if (this.containsById(s) == false && s.y > maxY) {
        pos = "up";
      }
    }
    if (pos == 'down') {
      this.path = this.createPathDown();
    }
    else if (pos == 'up') {
      this.path = this.createPathUp();
    }
    this.svg.localStorageService.modifySubchain(this);
    this.svg.localStorageService.storeChainFile(this.svg.createChainFile());
  }

  containsById(s: Service) {
    for (var i in this.services) {
      if (this.services[i].id == s.id) {
        return true;    
      }
    }
    return false;
  }

  containsByName(s: Service) {
    for (var i in this.services) {
      if (this.services[i].name == s.name) {
        return true;    
      }
    }
    return false;
  }

  removeService(s: Service) {
    var index = this.indexOfService(s);
    if (index >= 0) {
      document.getElementById('service'+this.services[index].id).style.stroke = 'black';
      this.services.splice(index, 1);
    }
  }

  insertService(s: Service) {
    //if (this.containsById(s) == false) {
      this.services.push(s);
      var index = this.indexOfService(s);
      document.getElementById('service'+this.services[index].id).style.stroke = 'red';
      /*
      if (this.services.length > 1) {
        var found = false;
        for (var i in this.svg.flows) {
          var f = this.svg.flows[i];
          if (f.toService == s.name) {
            if (f.fromService == this.services[index - 1].name) {
              this.insertFlow(f);
              found = true;
            }
          }
        }
        if (found == true) {
          document.getElementById('service'+this.services[index].id).style.stroke = 'red';
        }
        else {
          this.svg.isChainMode = -1;
          this.svg.tmpSubchain = null;
          //document.getElementById('subchain-button').style.backgroundColor = 'lightskyblue';
          for (var i in this.services) {
            document.getElementById('service'+this.services[i].id).style.stroke = 'black';
          }
          this.svg.openErrorDialog('This service is not connected with the others');
        }
      }
      else {
        document.getElementById('service'+s.id).style.stroke = 'red';
      }*/
    //}
    /*else {
      this.svg.isChainMode = -1;
      this.svg.tmpSubchain = null;
      //document.getElementById('subchain-button').style.backgroundColor = 'lightskyblue';
      for (var i in this.services) {
        document.getElementById('service'+this.services[i].id).style.stroke = 'black';
      }
      this.svg.openErrorDialog('The subchain contains already this service');
    }*/
    
  }

  /*
  insertFlow(f: Flow) {
    this.flows.push(f);
  }

  modifyFlow(f: Flow) {
    for (var i in this.flows) {
      if (this.flows[i].id == f.id) {
        this.flows[i] = f;
      }
    }
  }

  containsFlow(f: Flow) {
    for (var i in this.flows) {
      if (this.flows[i].id == f.id) return true;
    }
    return false;
  }*/

  indexOfService(s: Service) {
    for (var i in this.services) {
      if (this.services[i].id == s.id) return Number(i);
    }
    return -1;
  }

  modifyService(s: Service) {
    for (var i in this.services) {
      if (this.services[i].id == s.id) {
        this.services[i] = s;
      }
    }
  }



  onMouseUp(event) {
    if (event.button == 0) {
      if (this.svg.isOpenSubchain(this.id) == false) {
        this.svg.openSubchainMenu(this);
      }
    }
  }

  
  //checkSubchain() {
    /*
    for (var i=0; i<this.services.length; i++) {
      var s = this.services[i];
      for (var j=0; j<this.services.length; j++) {
        var s2 = this.services[j];
        //Check if this services appear in other services connection through the flows
        for (var k=0; k<this.flows.length; k++) {
          var f = this.flows[k];
          if (f.fromService == s2.name) {
            if (f.toService == s.name) return false;
          }
        }
      }
      return true;
    }*/
    /*
    var isCycle = false;
    var roots = Array<Service>();
    var root = 1;
    for (var p=0; p<this.services.length; p++) {
      //Check if the node is a root
      var h = 0;
      while (h<this.services.length && root != -1) {
        if (h != p) {
          //If the square p is connected to square h, the square p is not a root
          if (this.services[h].hasConnectedService(this.services[p].id)) {
            root = -1;
          }
        }
        h++;
      }
      if (root == 1) {
        roots.push(this.services[p]);
      }
      else root = 1;
    }
    //If there aren't roots, there is a cycle for sure
    if (roots.length == 0) {
      console.log('there is not roots');
      isCycle = true;
    }
    else if (roots.length > 1) {
      console.log('too much roots');
      isCycle = true;
    }
    else {
      isCycle = this.svg.DFS(roots[0].id, roots[0].connectedServices, []);
    }
    if (isCycle == false) {

    }*/
  //}
  

}