import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {DashboardComponent} from './dashboard/dashboard.component';
import {LoginComponent} from './login/login.component';
import {AuthguardService} from './authguard/authguard.service';
import {LandingComponent} from './landing/landing.component';
import {SupplierComponent} from './supplier/supplier.component';

const routes: Routes = [
  {
    path: "login",
    component: LoginComponent
  },
  {
    path: "",
    component: DashboardComponent,
    canActivate: [AuthguardService]
  },
  {
    path:"landing",
    component: LandingComponent
  }
  ,
  {
    path:"supplier",
    component: SupplierComponent,
    canActivate: [AuthguardService]
  }
]


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
