import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
//import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterModule, Routes } from '@angular/router';
import { StorageServiceModule } from 'ngx-webstorage-service';
import { HttpClientModule } from '@angular/common/http';
import { CodemirrorModule } from 'ng2-codemirror';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AppComponent } from './app.component';
import { ServiceDialogComponent} from './function-dialog/function-dialog.component';
import { FlowDialogComponent } from './flow-dialog/flow-dialog.component';
import { StartPageComponent } from './start-page/start-page.component';
import { WorkingPageComponent } from './working-page/working-page.component';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { ChainDialogComponent } from './chain-dialog/chain-dialog.component';
import { AppRoutingModule } from './app-routing.module';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { LocalStorageService } from 'src/app/local-storage-service';
import { WorkingPageInfrastructureComponent } from './working-page-infrastructure/working-page-infrastructure.component';
import { NodeDialogComponent } from './node-dialog/node-dialog.component';
import { LinkDialogComponent } from './link-dialog/link-dialog.component';
import { HeaderChainComponent } from './header-chain/header-chain.component';
import { FunctionMenuComponent } from './function-menu/function-menu.component';
import { FlowMenuComponent } from './flow-menu/flow-menu.component';
import { ChainCodeComponent } from './chain-code/chain-code.component';
import { SvgInfrastructureComponent } from './svg-infrastructure/svg-infrastructure.component';
import { HeaderInfrastructureComponent } from './header-infrastructure/header-infrastructure.component';
import { ConfirmationRequestComponent } from './confirmation-request/confirmation-request.component';
import { NodeMenuComponent } from './node-menu/node-menu.component';
import { LinkMenuComponent } from './link-menu/link-menu.component';
import { SvgChainComponent } from './svg-chain/svg-chain.component';
import { SubchainMenuComponent } from './subchain-menu/subchain-menu.component';
import { QueryBuilderComponent } from './query-builder/query-builder.component';
import { ExecutionDialogComponent } from './execution-dialog/execution-dialog.component';
import { WorkingPageOutputComponent } from './working-page-output/working-page-output.component';
import { HeaderOutputComponent } from './header-output/header-output.component';
import { SvgOutputComponent } from './svg-output/svg-output.component';
import { TutorialDialogComponent } from './tutorial-dialog/tutorial-dialog.component';
import { DotNavigationComponent } from './dot-navigation/dot-navigation.component';
import { ProgressSpinnerDialogComponent } from './progress-spinner-dialog-component/progress-spinner-dialog-component.component';
import { SplitScreenComponent } from './split-screen/split-screen.component';
import { SettingsHttpService } from './settings-http.service';

export function app_Init(settingsHttpService: SettingsHttpService) {
  return () => settingsHttpService.initializeApp();
}

@NgModule({
  declarations: [
    AppComponent,
    ServiceDialogComponent,
    FlowDialogComponent,
    StartPageComponent,
    WorkingPageComponent,
    ErrorDialogComponent,
    ChainDialogComponent,
    PageNotFoundComponent,
    WorkingPageInfrastructureComponent,
    NodeDialogComponent,
    LinkDialogComponent,
    HeaderChainComponent,
    FunctionMenuComponent,
    FlowMenuComponent,
    ChainCodeComponent,
    SvgInfrastructureComponent,
    HeaderInfrastructureComponent,
    ConfirmationRequestComponent,
    NodeMenuComponent,
    LinkMenuComponent,
    SvgChainComponent,
    SubchainMenuComponent,
    QueryBuilderComponent,
    ExecutionDialogComponent,
    WorkingPageOutputComponent,
    HeaderOutputComponent,
    SvgOutputComponent,
    TutorialDialogComponent,
    DotNavigationComponent,
    ProgressSpinnerDialogComponent,
    SplitScreenComponent,
  ],
  imports: [
    BrowserModule,
    //NoopAnimationsModule,
    BrowserAnimationsModule,
    FormsModule,
    MatCheckboxModule,
    MatButtonModule,
    MatInputModule,
    MatDialogModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatExpansionModule,
    RouterModule,
    AppRoutingModule,
    StorageServiceModule,  
    HttpClientModule,
    CodemirrorModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule
  ],
  bootstrap: [AppComponent],
  providers: [
    LocalStorageService,
    {
      provide: APP_INITIALIZER,
      useFactory: app_Init,
      deps: [SettingsHttpService],
      multi: true
    }
  ],
  entryComponents: [
    SvgInfrastructureComponent,
    ProgressSpinnerDialogComponent
  ],
})
export class AppModule {}
