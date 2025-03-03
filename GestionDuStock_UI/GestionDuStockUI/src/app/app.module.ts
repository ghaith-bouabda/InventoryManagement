import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {ChartsComponent} from "./charts/charts.component";
import {AppComponent} from "./app.component";
import {SidebarComponent} from "./sidebar/sidebar.component";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {AppRoutingModule} from "./app-routing.module";
import {provideAnimationsAsync} from "@angular/platform-browser/animations/async";
import {MatSidenav, MatSidenavContainer, MatSidenavModule} from "@angular/material/sidenav";
import {MatListItem, MatListModule, MatNavList} from "@angular/material/list";
import { LloginComponent } from './llogin/llogin.component';
import { LoginComponent } from './login/login.component';



@NgModule({
  declarations: [
    AppComponent ,DashboardComponent,
    ChartsComponent,
    SidebarComponent,
    LloginComponent,
    LoginComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatListItem,
    MatSidenavContainer,
    MatNavList,
    MatSidenav,
    MatSidenavModule,
    MatListModule,


  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
