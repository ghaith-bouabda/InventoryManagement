import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {DashboardComponent} from './dashboard/dashboard.component';
import {LoginComponent} from './login/login.component';
import {AuthguardService} from './authguard/authguard.service';
import {SupplierComponent} from './supplier/supplier.component';
import {ProductComponent} from './product/product.component';
import {PurchaseComponent} from './purchase/purchase.component';
import {SalesComponent} from './sales/sales.component';
import {CustomersComponent} from './customers/customers.component';
import {UsermanagementComponent} from './usermanagement/usermanagement.component';

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
    path:"supplier",
    component: SupplierComponent,
    canActivate: [AuthguardService]
  }
  ,
  {
    path:"product",
    component: ProductComponent,
    canActivate: [AuthguardService]

  }
  ,
  {
    path:"purchase",
    component: PurchaseComponent,
    canActivate: [AuthguardService]

  }
  ,
  {
    path :"sales",
    component : SalesComponent,
    canActivate: [AuthguardService]
  }
  ,
  {
   path:"customers",
   component: CustomersComponent,
   canActivate: [AuthguardService]
  }
  ,
  {
    path:"usermanagement",
    component: UsermanagementComponent,
    canActivate: [AuthguardService]
  }
]


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
