import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { WorkingPageComponent } from 'src/app/working-page/working-page.component';
import { StartPageComponent } from './start-page/start-page.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { WorkingPageInfrastructureComponent } from './working-page-infrastructure/working-page-infrastructure.component';
import { WorkingPageOutputComponent } from './working-page-output/working-page-output.component';

const routes: Routes = [
  { path: '', component: StartPageComponent },
  { path: 'chain', component: WorkingPageComponent },
  { path: 'catena', redirectTo: '/chain'},
  { path: 'vnf-chain', redirectTo: '/chain'},
  { path: 'infrastructure', component: WorkingPageInfrastructureComponent},
  { path: 'placement', component: WorkingPageOutputComponent},
  { path: '**', component: PageNotFoundComponent }
];

const routerModuleWithProviders: ModuleWithProviders<RouterModule> =
  RouterModule.forRoot(
    routes,
    { enableTracing: true } // <-- debugging purposes only
  );

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    routerModuleWithProviders
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
