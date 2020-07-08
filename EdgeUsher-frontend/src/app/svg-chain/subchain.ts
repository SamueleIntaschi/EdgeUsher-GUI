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
    
  }

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
  

}