import { Injectable, Promise } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from '../app/settings.service';
import { Settings } from './settings';

@Injectable({
  providedIn: 'root'
})
export class SettingsHttpService {

  constructor(private http: HttpClient, private settingsService: SettingsService) { }

  initializeApp(): Promise<any> {
    return new Promise(
      (resolve) => {
        this.http.get('assets/config.json').toPromise().then(response => {
          this.settingsService.settings = <Settings>response;
          resolve();
        })
      }
    );
  }
}
