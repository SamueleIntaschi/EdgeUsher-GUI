import { Inject, Injectable } from '@angular/core'
import { SESSION_STORAGE, LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { Node } from 'src/app/svg-infrastructure/node';
import { Link } from 'src/app/svg-infrastructure/link';
import { Service } from './svg-chain/service';
import { Flow } from './svg-chain/flow';
import { Subchain } from './svg-chain/subchain';
import { Placement } from './execution-dialog/execution-dialog.component';

@Injectable()
export class LocalStorageService {

  constructor(@Inject(SESSION_STORAGE) private storage: StorageService) { }

  public storeActualPlacement(placement: Placement) {
    this.storage.set('actual-placement', placement);
  }

  public getActualPlacement(): Placement {
    return this.storage.get('actual-placement') || null;;
  }

  public storePlacements(placements: Array<Placement>) {
    this.storage.set('placements', placements);
  }

  public getPlacements() {
    return this.storage.get('placements') || [];
  }

  public setProbabilisticMode(type: string) {
    this.storage.set('probabilities', type);
  }

  public getProbabilisticMode() {
    return this.storage.get('probabilities') || null;
  }

  public setChainTitle(str: string) {
    this.storage.set('chain-title', str);
  }

  public setInfrastructureTitle(str: string) {
    this.storage.set('infrastructure-title', str);
  }

  public getChainTitle() {
    return this.storage.get('chain-title') || null;
  }

  public getInfrastructureTitle() {
    return this.storage.get('infrastructure-title') || null;
  }

  public storeInfrastructureFile(file: Array<string>) {
    var infra = this.storage.get('infrastructure') || [];
    var fj = JSON.stringify(file);
    this.storage.set('infrastructure', fj);
  }

  //TODO: capire quando il file è vuoto (cioè non è ancora stato caricato nello storage) ed evitare di fare il parsing, che causa errore
  public getInfrastructureFile() {
    var tmp = Array<string>();
    var fs = this.storage.get('infrastructure');
    if (fs.length > 0) tmp = JSON.parse(fs) as Array<string>;
    else return null;
    return tmp;
  }

  public cleanInfrastructureFile() {
    this.storage.set('infrastructure', []);
  }

  public storeChainFile(file: Array<string>) {
    var infra = this.storage.get('chain') || [];
    var fj = JSON.stringify(file);
    this.storage.set('chain', fj);
  }

  public getChainFile() {
    var tmp = Array<string>();
    var fs = this.storage.get('chain');
    if (fs.length > 0) tmp = JSON.parse(fs) as Array<string>;
    else return null;
    return tmp;
  }

  public cleanChainFile() {
    this.storage.set('chain', []);
  }

  public storeService(s: Service): void {
    var squares = this.storage.get('services') || [];
    var sj = JSON.stringify(s, function replacer(key, value) {
      if (this && key === "svg")
        return undefined;
      return value;
    });
    squares.push(sj);
    this.storage.set('services', squares);
  }

  public storeFlow(l: Flow): void {
    var lines = this.storage.get('flows') || [];
    var lj = JSON.stringify(l, function replacer(key, value) {
      if (this && key === "svg")
        return undefined;
      return value;
    });
    lines.push(lj);
    this.storage.set('flows', lines);
  }

  public getServices(): Array<Service> {
    var tmp = Array<Service>();
    var ss = this.storage.get('services');
    for (var i in ss) {
      tmp.push(JSON.parse(ss[i]) as Service);
    }
    return tmp;
  }

  public modifyService(square: Service) {
    var squares = this.storage.get('services');
    var s: Service;
    for (var i in squares) {
      s = JSON.parse(squares[i]);
      if (s.id == square.id) {
        squares[i] = JSON.stringify(square, function replacer(key, value) {
          if (this && key === "svg")
            return undefined;
          return value;
        });
      }
    }
    this.storage.set('services', squares);
  }

  public deleteService(square: Service) {
    var squares = this.storage.get('services');
    var s: Service;
    for (var i in squares) {
      s = JSON.parse(squares[i]);
      if (s.id == square.id) {
        squares.splice(i, 1);
        break;
      }
    }
    this.storage.set('services', squares);
  }

  public getFlows(): Array<Flow> {
    var tmp = Array<Flow>();
    var ls = this.storage.get('flows');
    for (var i in ls) {
      tmp.push(JSON.parse(ls[i]));
    }
    return tmp;
  }

  public modifyFlow(line: Flow) {
    var lines = this.storage.get('flows');
    var l: Flow;
    for (var i in lines) {
      l = JSON.parse(lines[i]);
      //if (l.fromService == line.fromService && l.toService == line.toService) {
      if (l.id == line.id) {  
        lines[i] = JSON.stringify(line, function replacer(key, value) {
          if (this && key === "svg")
            return undefined;
          return value;
        });
      }
    }
    this.storage.set('flows', lines);
  }

  public modifySubchain(s: Subchain) {
    var subs = this.storage.get('subchains');
    var sub: Subchain;
    for (var i in subs) {
      sub = JSON.parse(subs[i]);
      if (sub.id == s.id) {
        subs[i] = JSON.stringify(s, function replacer(key, value) {
          if (this && key === "svg")
            return undefined;
          return value;
        });
      }
    }
    this.storage.set('subchains', subs);
  }

  public deleteSubchain(s: Subchain) {
    var subs = this.storage.get('subchains');
    var sub: Subchain;
    for (var i=0; i<subs.length; i++) {
      sub = JSON.parse(subs[i]);
      if (sub.id == s.id) {
        subs.splice(i, 1);
        i--;
        break;
      }
    }
    this.storage.set('subchains', subs);
  }

  /*
  public modifyLineLinkFrom(line: Line, prevName: string) {
    var lines = this.storage.get('lines');
    var l: Line;
    for (var i in lines) {
      l = JSON.parse(lines[i]);
      if (l.fromService == prevName && l.toService == line.toService) {
        console.log(line.fromService+line.toService);
        lines[i] = JSON.stringify(line);
      }
    }
    this.storage.set('lines', lines);
  }

  public modifyLineLinkTo(line: Line, prevName: string) {
    var lines = this.storage.get('lines');
    var l: Line;
    for (var i in lines) {
      l = JSON.parse(lines[i]);
      if (l.fromService == line.fromService && l.toService == prevName) {
        console.log(line.fromService+line.toService);
        lines[i] = JSON.stringify(line);
      }
    }
    this.storage.set('lines', lines);
  }*/

  public deleteFlow(line: Flow) {
    var lines = this.storage.get('flows');
    var l: Flow;
    for (var i=0; i<lines.length; i++) {
      l = JSON.parse(lines[i]);
      //if (l.fromService == line.fromService && l.toService == line.toService) {
      if (l.id == line.id) {  
        lines.splice(i,1);
        i--;
        break;
      }
    }
    this.storage.set('flows', lines);
  }

  /*
  public getSubchains(): Array<SubChain> {
    var tmp = Array<SubChain>();
    var sc = this.storage.get('subchains');
    for (var i in sc) {
      tmp.push(JSON.parse(sc[i]));
    }
    return tmp;
  }

  public modifySubChain(s: SubChain) {
    var subchains = this.storage.get('subchains');
    var sc: SubChain;
    for (var i in subchains) {
      sc = JSON.parse(subchains[i]);
      if (sc.id == s.id) {
        subchains[i] = JSON.stringify(s);
      }
    }
    this.storage.set('subchains', subchains);
  }

  public deleteSubchain(s: SubChain) {
    var subchains = this.storage.get('subchains');
    var sc: SubChain;
    for (var i in subchains) {
      sc = JSON.parse(subchains[i]);
      if (s.id == sc.id) {
        subchains.splice(i, 1);
        break;
      }
    }
    this.storage.set('subchains', subchains);
  }*/

  public storeSubchain(s: Subchain) {
    var subs = this.storage.get('subchains') || [];
    var sj = JSON.stringify(s, function replacer(key, value) {
      if (this && key === "svg")
        return undefined;
      return value;
    });
    subs.push(sj);
    this.storage.set('subchains', subs);
  }

  public storeNode(n: Node) {
    var nodes = this.storage.get('nodes') || [];
    var nj = JSON.stringify(n, function replacer(key, value) {
      if (this && key === "svg")
        return undefined;
      return value;
    });
    nodes.push(nj);
    this.storage.set('nodes', nodes);
  }

  public storeLink(l: Link) {
    var links = this.storage.get('links') || [];
    var lj = JSON.stringify(l, function replacer(key, value) {
      if (this && key === "svg")
        return undefined;
      return value;
    });
    links.push(lj);
    this.storage.set('links', links);
  }

  public getNodes() {
    var tmp = Array<Node>();
    var sc = this.storage.get('nodes');
    for (var i in sc) {
      tmp.push(JSON.parse(sc[i]));
    }
    return tmp;
  }

  public getLinks() {
    var tmp = Array<Link>();
    var sc = this.storage.get('links');
    for (var i in sc) {
      tmp.push(JSON.parse(sc[i]));
    }
    return tmp;
  }

  public getSubchains() {
    var tmp = Array<Subchain>();
    var s = this.storage.get('subchains');
    for (var i in s) {
      tmp.push(JSON.parse(s[i]));
    }
    return tmp;
  }

  public deleteNode(square: Node) {
    var squares = this.storage.get('nodes');
    var s: Node;
    for (var i in squares) {
      s = JSON.parse(squares[i]);
      if (s.id == square.id) {
        squares.splice(i, 1);
        break;
      }
    }
    this.storage.set('nodes', squares);
  }

  public deleteLink(line: Link) {
    var lines = this.storage.get('links');
    var l: Link;
    for (var i=0; i<lines.length; i++) {
      l = JSON.parse(lines[i]);
      //if (l.fromNode == line.fromNode && l.toNode == line.toNode) {*/
      if (l.id == line.id) {
        lines.splice(i,1);
        i--;
        break;
      }
    }
    this.storage.set('links', lines);
  }

  /*
  public modifyLinkFrom(line: Link, prevName: string) {
    var lines = this.storage.get('links');
    var l: Line;
    for (var i in lines) {
      l = JSON.parse(lines[i]);
      if (l.fromService == prevName && l.toService == line.toNode) {
        console.log(line.fromNode+line.toNode);
        lines[i] = JSON.stringify(line, function replacer(key, value) {
          if (this && key === "svg")
            return undefined;
          return value;
        });
      }
    }
    this.storage.set('links', lines);
  }

  public modifyLinkTo(line: Link, prevName: string) {
    var lines = this.storage.get('links');
    var l: Line;
    for (var i in lines) {
      l = JSON.parse(lines[i]);
      if (l.fromService == line.fromNode && l.toService == prevName) {
        console.log(line.fromNode+line.toNode);
        lines[i] = JSON.stringify(line, function replacer(key, value) {
          if (this && key === "svg")
            return undefined;
          return value;
        });
      }
    }
    this.storage.set('links', lines);
  }*/

  public modifyNode(square: Node) {
    var squares = this.storage.get('nodes');
    var s: Node;
    for (var i in squares) {
      s = JSON.parse(squares[i]);
      if (s.id == square.id) {
        squares[i] = JSON.stringify(square, function replacer(key, value) {
          if (this && key === "svg")
            return undefined;
          return value;
        });
      }
    }
    this.storage.set('nodes', squares);
  }

  public modifyLink(line: Link) {
    var lines = this.storage.get('links');
    var l: Link;
    for (var i in lines) {
      l = JSON.parse(lines[i]);
      //if (l.fromNode == line.fromNode && l.toNode == line.toNode) {
      if (l.id == line.id) {
        lines[i] = JSON.stringify(line, function replacer(key, value) {
          if (this && key === "svg")
            return undefined;
          return value;
        });
      }
    }
    this.storage.set('links', lines);
  }

  

}