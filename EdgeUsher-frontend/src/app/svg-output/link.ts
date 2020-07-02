import { SvgOutputComponent } from '../svg-output/svg-output.component';
import { NodeP } from './node';

export class LinkP {

  x1: number;
  y1: number;    
  x2: number;
  y2: number;
  id: number;
  type: string;
  usedBw: number;
  path: string;
  textpath: string;
  hdirection = '';
  vdirection = '';
  fromNode: string;
  toNode: string;
  svg: SvgOutputComponent;
  middlePoint: SVGPoint;

  constructor(s: SvgOutputComponent) {
    this.svg = s;
  }

  createTextPath() {
    var path = '';
    var d1 = 6;
    var d2 = 18;
    //path = 'M ' + this.x1 + ' ' + this.y1 
    if (Math.abs(this.x2 - this.x1) < 80) {
      if (this.vdirection == 'up') {
        path = 'M ' + (this.x1 - d1) + ' ' + (this.y1);
        path = path
        + ' Q ' + ((this.x1 + this.x2 - 2*d1) / 2 - 10) + ' ' 
        + ((this.y1 + this.y2) / 2) + ' ' + (this.x2 - d1) + ' ' + (this.y2);
      }
      else if (this.vdirection == 'down') {
        path = 'M ' + (this.x2 + d2) + ' ' + (this.y2);
        path = path
        + ' Q ' + ((this.x1 + this.x2 + 2*d2) / 2 + 10) + ' ' 
        + ((this.y1 + this.y2) / 2) + ' ' + (this.x1 + d2) + ' ' + (this.y1);
      }
    }
    else if (this.hdirection == 'right') {
      path = 'M ' + this.x1 + ' ' + (this.y1 - d1);
      path = path
      + ' Q ' + ((this.x1 + this.x2) / 2) + ' ' 
      + ((this.y1 + this.y2 - 2*d1) / 2 - 20) + ' ' + (this.x2) + ' ' + (this.y2 -d1);
    }
    else if (this.hdirection == 'left') {
      path = 'M ' + this.x2 + ' ' + (this.y2 + d2);
      path = path
      + ' Q ' + ((this.x1 + this.x2) / 2) + ' ' 
      + ((this.y1 + this.y2 + 2*d2) / 2 + 20) + ' ' + (this.x1) + ' ' + (this.y1 + d2);
    }
    return path;
    
  }

  createPath() {
    var path = '';
    path = 'M ' + this.x1 + ' ' + this.y1 
    if (Math.abs(this.x2 - this.x1) < 20) {
      if (this.vdirection == 'up') {
        path = path
        + ' Q ' + ((this.x1 + this.x2) / 2 - 10) + ' ' 
        + ((this.y1 + this.y2) / 2) + ' ' + (this.x2) + ' ' + (this.y2);
      }
      else if (this.vdirection == 'down') {
        path = path
        + ' Q ' + ((this.x1 + this.x2) / 2 + 10) + ' ' 
        + ((this.y1 + this.y2) / 2) + ' ' + (this.x2) + ' ' + (this.y2);
      }
    }
    else if (this.hdirection == 'right') {
      path = path
      + ' Q ' + ((this.x1 + this.x2) / 2) + ' ' 
      + ((this.y1 + this.y2) / 2 - 20) + ' ' + (this.x2) + ' ' + (this.y2);
    }
    else if (this.hdirection == 'left') {
      path = path
      + ' Q ' + ((this.x1 + this.x2) / 2) + ' ' 
      + ((this.y1 + this.y2) / 2 + 20) + ' ' + (this.x2) + ' ' + (this.y2);
    }
    this.path = path;
    this.textpath = this.createTextPath();
    
  }

  setMiddlePoint() {
    var l: SVGPathElement;
    l = <SVGPathElement><any>document.getElementById('link' + this.id);
    console.log(l);
    // Get the length of the path
    var pathLen = l.getTotalLength();
    // How far along the path to we want the position?
    var pathDistance = pathLen * 0.5;
    var middle = l.getPointAtLength(pathDistance);
    this.middlePoint = middle;
  }

  

  modifyLinkto(node2: NodeP) {
    var index1 = this.svg.indexOfNodeByName(this.fromNode);
    var node1 = this.svg.nodes[index1];

    //Distance on x and y
    var dx: number;
    var dy: number;
    dx = node2.x - node1.x;
    dy = node2.y - node1.y;
    //Distance between centers using pitagora
    var l = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    //Ratio for the radius
    var r1l = (node1.width/2) / l;
    var r2l = (node2.width/2) / l;
    //Coordinates for the line
    this.x1 = node1.x + (dx * r1l);
    this.x2 = node2.x - (dx * r2l);
    this.y1 = node1.y + (dy * r1l);
    this.y2 = node2.y - (dy * r2l);

    var x1 = node1.x;
    var x2 = node2.x;
    var y1 = node1.y;
    var y2 = node2.y;
    //Case node2 up
    if (y2 < y1 && Math.abs(x2 - x1) < node1.width) {
      x1 = x1 + 10;
      y1 = y1 - node1.height / 2;
      x2 = x2 + 10;
      y2 = y2 + node2.height / 2;
      this.vdirection = 'up';
      this.x1 -= 5;
      this.x2 -= 5;
    }
    //Case node2 down
    else if (y2 > y1 && Math.abs(x2 - x1) < node1.width) {
      x1 = x1 - 10;
      y1 = y1 + node1.height / 2;
      x2 = x2 - 10;
      y2 = y2 - node2.height / 2;
      this.vdirection = 'down';
      this.x1 += 5;
      this.x2 += 5;
    }
    //Case node2 right
    else if (x2 > x1) {
      x1 = x1 + node1.width / 2;
      y1 = y1 + 10;
      x2 = x2 - node2.width / 2;
      y2 = y2 + 10;
      this.hdirection = 'right';
      this.y1 -= 5;
      this.y2 -= 5;
    }
    //Case node2 left
    else if (x2 < x1) {
      x1 = x1 - node1.width / 2;
      y1 = y1 - 10;
      x2 = x2 + node2.width / 2;
      y2 = y2 - 10;
      this.hdirection = 'left';
      this.y1 += 5;
      this.y2 += 5;
    }
    this.createPath();
  }

  modifyLinkFrom(node1 : NodeP) {

    var index2 = this.svg.indexOfNodeByName(this.toNode);
    var node2 = this.svg.nodes[index2];

    //Distance on x and y
    var dx: number;
    var dy: number;
    dx = node2.x - node1.x;
    dy = node2.y - node1.y;
    //Distance between centers using pitagora
    var l = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    //Ratio for the radius
    var r1l = (node1.width/2) / l;
    var r2l = (node2.width/2) / l;
    //Coordinates for the line
    this.x1 = node1.x + (dx * r1l);
    this.x2 = node2.x - (dx * r2l);
    this.y1 = node1.y + (dy * r1l);
    this.y2 = node2.y - (dy * r2l);

    
    var x1 = node1.x;
    var x2 = node2.x;
    var y1 = node1.y;
    var y2 = node2.y;
    //Case node2 up
    if (y2 < y1 && Math.abs(x2 - x1) < node1.width) {
      x1 = x1 + 10;
      y1 = y1 - node1.height / 2;
      x2 = x2 + 10;
      y2 = y2 + node2.height / 2;
      this.vdirection = 'up';
      this.x1 -= 5;
      this.x2 -= 5;
    }
    //Case node2 down
    else if (y2 > y1 && Math.abs(x2 - x1) < node1.width) {
      x1 = x1 - 10;
      y1 = y1 + node1.height / 2;
      x2 = x2 - 10;
      y2 = y2 - node2.height / 2;
      this.vdirection = 'down';
      this.x1 += 5;
      this.x2 += 5;
    }
    //Case node2 right
    else if (x2 > x1) {
      x1 = x1 + node1.width / 2;
      y1 = y1 + 10;
      x2 = x2 - node2.width / 2;
      y2 = y2 + 10;
      this.hdirection = 'right';
      this.y1 -= 5;
      this.y2 -= 5;
    }
    //Case node2 left
    else if (x2 < x1) {
      x1 = x1 - node1.width / 2;
      y1 = y1 - 10;
      x2 = x2 + node2.width / 2;
      y2 = y2 - 10;
      this.hdirection = 'left';
      this.y1 += 5;
      this.y2 += 5;
    }
    this.createPath();
  }

  onMouseUp(event) {

  }
}