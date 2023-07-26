import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgShuttleReorderComponent } from './components/ng-shuttle-reorder/ng-shuttle-reorder.component';

@NgModule({
  declarations: [
    AppComponent,
    NgShuttleReorderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
