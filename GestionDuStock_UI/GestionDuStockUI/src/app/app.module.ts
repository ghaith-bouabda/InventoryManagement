import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {ChartsComponent} from "./charts/charts.component";
import {AppComponent} from "./app.component";
import {SidebarComponent} from "./sidebar/sidebar.component";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {AppRoutingModule} from "./app-routing.module";
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';

import {provideAnimationsAsync} from "@angular/platform-browser/animations/async";
import {MatSidenav, MatSidenavContainer, MatSidenavModule} from "@angular/material/sidenav";
import {MatListItem, MatListModule, MatNavList} from "@angular/material/list";
import { ChartModule } from "primeng/chart"
import { TableModule } from "primeng/table"
import { ButtonModule } from "primeng/button"
import { DialogModule } from "primeng/dialog"
import { InputTextModule } from "primeng/inputtext"
import { DropdownModule } from "primeng/dropdown"
import { ToastModule } from "primeng/toast"
import { ConfirmDialogModule } from "primeng/confirmdialog"
import { ConfirmationService, MessageService } from "primeng/api"
import { CardModule } from "primeng/card"
import { ProgressBarModule } from "primeng/progressbar"
import { PanelModule } from "primeng/panel"

import { LoginComponent } from './login/login.component';
import {FormsModule} from '@angular/forms';
import {Menu} from 'primeng/menu';
import {AuthInterceptor} from './auth-interceptor.service';
import { LandingComponent } from './landing/landing.component';
import { AlertComponent } from './alert/alert.component';
import { SupplierComponent } from './supplier/supplier.component';
import { ProductComponent } from './product/product.component';
import { PurchaseComponent } from './purchase/purchase.component';
import { SalesComponent } from './sales/sales.component';
import { CustomersComponent } from './customers/customers.component';




@NgModule({
  declarations: [
    AppComponent ,
    DashboardComponent,
    ChartsComponent,
    SidebarComponent,
    LoginComponent,
    LandingComponent,
    AlertComponent,
    SupplierComponent,
    ProductComponent,
    PurchaseComponent,
    SalesComponent,
    CustomersComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,

    AppRoutingModule,
    MatListItem,
    MatSidenavContainer,
    MatNavList,
    MatSidenav,
    MatSidenavModule,
    MatListModule,
    FormsModule,
    ChartModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    ToastModule,
    ConfirmDialogModule,
    CardModule,
    ProgressBarModule,
    PanelModule,
    Menu,

  ],
  providers: [
    provideAnimationsAsync(),
    MessageService,
    ConfirmationService, {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
