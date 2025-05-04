import { Component, OnInit } from '@angular/core';
import { AuthControllerService } from './services/services/auth-controller.service';
import {WebSocketService} from './socketservice/WebSocketService';
import {ProductControllerService} from './services/services/product-controller.service';
import {ToastrService} from 'ngx-toastr';
import {ProductDto} from './services/models/product-dto';
import {Product} from './services/models/product';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  isAdmin = false;
  products: ProductDto[] = [];
  lowStockProducts: Product[] = []
  productStats = {
    total: 0,
    lowStock: 0,
    outOfStock: 0,
  }

  constructor(private authService: AuthControllerService,
              private productService: ProductControllerService,
              private webSocketService: WebSocketService,
              private toast:ToastrService,
              private router: Router

) {
  }

  ngOnInit() {
    if (!this.isLoggedIn) {
      this.router.navigate(['login']);
      return;
    }

    this.webSocketService.connect();

    this.authService.isAdmin$.subscribe(status => {
      this.isAdmin = status;
      this.loadDashboardData();
    });
  }

  loadDashboardData(): void {
    // Get all products
    this.productService.getAllProducts().subscribe((products) => {
      this.products = products
      this.productStats.total = products.length
    })

    // Get low stock products

    // Get out of stock products
    this.productService.getOutOfStockProducts().subscribe((products) => {
      this.productStats.outOfStock = products.length
    })


    this.productService.getLowStockProducts().subscribe((products) => {
      this.lowStockProducts = products;
      this.productStats.lowStock = products.length;

      if (!this.isAdmin) {
        products.forEach(p => {
          this.toast.warning(`Low stock: ${p.name}`);
        });
      }
    });
  }

  get isLoggedIn(): boolean {
    return localStorage.getItem("token") !== null;

  }

  title = 'GestionDuStockUI';
}
