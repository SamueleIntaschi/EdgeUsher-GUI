import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'edgeusher';
  getTitle(): string {
    return this.title;
  }
  onStartClick() {
    //document.getElementById("canvas").style.display = "block";
    //document.getElementById("start-button").style.display = "none";
    //document.getElementById("logo").style.display = "none";
    //document.getElementById("sidenav").style.display = "block";
    //document.getElementById("start-page").style.display = "none";
    //document.getElementById("workpage").style.display = "block";
  }
  ngOnInit(): void {
  }
  /*--- STRUTTURA DEL PROGRAMMA ---*/
  //TODO: creare una struttura con angular routes, ad ogni route è assegnata una pagina, creazione catena, creazione infrastruttura, output, page not found
  //TODO: una volta creata la catena salvarla nel webstorage, parte isolata del browser, e procedere alla creazione dell'infrastruttura
  //TODO: nel frattempo è possibile creare nuove catene
  //TODO: una volta pronte le catene e l'infrastruttura da usare far partire il programma tramite un server, scritto magari in python
}
