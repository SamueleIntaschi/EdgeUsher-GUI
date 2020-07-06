import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChainErrorCheckingService {

  constructor() { }

  checkChainFile(chain: Array<string>) {
    var services = Array<any>();
    var flows = Array<any>();
    var subchains = Array<any>();
    for (var i in chain) {

      //TODO: procedura di parsing del file e controllo dei relativi errori

    }
  }
}
