import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Service } from '../svg-chain/service';
import { Flow } from '../svg-chain/flow';
import { Subchain } from '../svg-chain/subchain';
import { Link } from '../svg-infrastructure/link';
import { Node } from '../svg-infrastructure/node';
import { LocalStorageService } from '../local-storage-service';
import * as SvgPanZoom from 'svg-pan-zoom';

@Component({
  selector: 'app-split-screen',
  templateUrl: './split-screen.component.html',
  styleUrls: ['./split-screen.component.css']
})
export class SplitScreenComponent implements OnInit {

  @ViewChild('svgchainelemsplit', { static: true }) svgChain: ElementRef<SVGSVGElement>;
  @ViewChild('svginfraelemsplit', { static: true }) svgInfra: ElementRef<SVGSVGElement>;

  services = Array<Service>();
  nodes = Array<Node>();
  flows = Array<Flow>();
  links = Array<Link>();
  subchains = Array<Subchain>();
  svgPanZoomChain: SvgPanZoom.Instance;
  svgPanZoomInfra: SvgPanZoom.Instance;

  constructor(private localStorageService: LocalStorageService) { }

  ngOnInit(): void {
    this.retrieveInformation();
  }

  ngAfterViewInit(): void {
    //Initialization of svg-pan-zoom
    this.svgPanZoomChain = SvgPanZoom('#svgchainelemsplit',  {
      zoomEnabled: false,
      panEnabled: true,
      controlIconsEnabled: false,
      fit: false,
      center: false,
      mouseWheelZoomEnabled: false,
      dblClickZoomEnabled: false,
    });
    this.svgPanZoomInfra = SvgPanZoom('#svginfraelemsplit',  {
      zoomEnabled: false,
      panEnabled: true,
      controlIconsEnabled: false,
      fit: false,
      center: false,
      mouseWheelZoomEnabled: false,
      dblClickZoomEnabled: false,
    });
    this.svgPanZoomChain.zoom(0.5);
    this.svgPanZoomInfra.zoom(0.5);
  }

  resetPan() {
    //Initialization of svg-pan-zoom
    this.svgPanZoomChain = SvgPanZoom('#svgchainelemsplit',  {
      zoomEnabled: false,
      panEnabled: true,
      controlIconsEnabled: false,
      fit: false,
      center: false,
      mouseWheelZoomEnabled: false,
      dblClickZoomEnabled: false,
    });
    this.svgPanZoomInfra = SvgPanZoom('#svginfraelemsplit',  {
      zoomEnabled: false,
      panEnabled: true,
      controlIconsEnabled: false,
      fit: false,
      center: false,
      mouseWheelZoomEnabled: false,
      dblClickZoomEnabled: false,
    });
    this.resetZoom();
  }

  resetZoom() {
    this.svgPanZoomChain.zoom(0.5);
    this.svgPanZoomInfra.zoom(0.5);
  }

  retrieveInformation() {
    var ss = this.localStorageService.getServices() as Array<Service>;
    //Get services, flows and subchains information
    for (var i in ss) {
      var s = new Service(null);
      s.x = ss[i].x;
      s.y = ss[i].y;
      s.r = ss[i].r;
      s.id = ss[i].id;
      s.iotReqs = ss[i].iotReqs;
      s.name = ss[i].name;
      s.securityRequirements = ss[i].securityRequirements;
      s.serviceTime = ss[i].serviceTime;
      s.hwReqs = ss[i].hwReqs;
      s.connectedServices = ss[i].connectedServices;
      s.cond = ss[i].cond;
      this.services.push(s);
    }
    var fs = this.localStorageService.getFlows();
    for (var i in fs) {
      var f = new Flow(null);
      f.fromService = fs[i].fromService;
      f.toService = fs[i].toService;
      f.coord1 = fs[i].coord1;
      f.coord2 = fs[i].coord2;
      f.coordBox = fs[i].coordBox;
      f.bandwidth = fs[i].bandwidth;
      f.id = fs[i].id;
      this.flows.push(f);
    }
    var subs = this.localStorageService.getSubchains();
    for (var i in subs) {
      var sub = new Subchain(null);
      sub.maxLatency = subs[i].maxLatency;
      sub.id = subs[i].id;
      sub.services = subs[i].services;
      sub.path = subs[i].path;
      sub.textpath = subs[i].textpath;
      this.subchains.push(sub);
    }
    var nn = this.localStorageService.getNodes() as Array<Node>;
    for (var i in nn) {
      var node = new Node(null);
      node.x = nn[i].x;
      node.y = nn[i].y;
      node.width = nn[i].width;
      node.height = nn[i].height;
      node.id = nn[i].id;
      node.name = nn[i].name;
      node.singleValue = nn[i].singleValue;
      node.probs = nn[i].probs;
      node.connectedNodes = nn[i].connectedNodes;
      node.imageUrl = nn[i].imageUrl;
      node.strHwCaps = nn[i].strHwCaps;
      node.strIotCaps = nn[i].strIotCaps;
      node.strHwCaps = nn[i].strHwCaps;
      node.probabilistic = nn[i].probabilistic;
      this.nodes.push(node)
    }
    var ls = this.localStorageService.getLinks();
    for (var i in ls) {
      var link = new Link(null);
      link.fromNode = ls[i].fromNode;
      link.toNode = ls[i].toNode;
      link.bandwidth = ls[i].bandwidth;
      link.latency = ls[i].latency;
      link.probs = ls[i].probs;
      link.x1 = ls[i].x1;
      link.y1 = ls[i].y1;
      link.x2 = ls[i].x2;
      link.y2 = ls[i].y2;
      link.type = ls[i].type;
      link.id = ls[i].id;
      link.coordBox = ls[i].coordBox;
      link.vdirection = ls[i].vdirection;
      link.hdirection = ls[i].hdirection;
      link.path = ls[i].path;
      link.textpath = ls[i].textpath;
      link.middlePoint = ls[i].middlePoint;
      link.probabilistic = ls[i].probabilistic;
      link.title = ls[i].title;
      this.links.push(link);
    }
  }

}
