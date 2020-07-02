import { Component, OnInit, Input } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

//TODO: salvare i vari file (chain, infr) al cambio di pagina perchè siano recuperati dal placement builder,
//      altrimenti ricostruire i file dal placement usano le informazioni in local storage

@Component({
  selector: 'app-dot-navigation',
  templateUrl: './dot-navigation.component.html',
  styleUrls: ['./dot-navigation.component.css']
})


export class DotNavigationComponent implements OnInit {

  @Input() current: string;
  infrastructure = false;
  chain = false;
  placement = false;

  constructor(private router: Router) { 
    router.events.pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event:NavigationEnd) => {
      if (event.url == '/chain') {
        this.setChain();
      }
      else if (event.url == '/infrastructure') {
        this.setInfrastructure();
      }
      else if (event.url == '/placement') {
        this.setPlacement();
      }
    });
  }

  ngOnInit(): void {
    if (this.current == 'chain') this.chain = true;
    else if (this.current == 'infrastructure') this.infrastructure = true;
    else if (this.current == 'placement') this.placement = true;
  }

  setChain() {
    this.chain = true;
    this.infrastructure = false;
    this.placement = false;
  }

  setInfrastructure() {
    this.chain = false;
    this.infrastructure = true;
    this.placement = false;
  }

  setPlacement() {
    this.chain = false;
    this.infrastructure = false;
    this.placement = true;
  }

  onClick(type: string) {
    if (this.current == type) {
      //Do nothing
    }
    else if (type == 'chain') {
      
      this.router.navigate(['/chain']);
    }
    else if (type == 'infrastructure') {
      this.router.navigate(['/infrastructure']);
    }
    else if (type == 'placement') {
      this.router.navigate(['/placement']);
    }
  }

}
