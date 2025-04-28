import { Component, OnInit } from '@angular/core';
import { AuthControllerService } from './services/services/auth-controller.service';
import {WebSocketService} from './socketservice/WebSocketService';
import {ProductControllerService} from './services/services/product-controller.service';
import {ToastrService} from 'ngx-toastr';
import {ProductDto} from './services/models/product-dto';
import {Product} from './services/models/product';

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
              private toast:ToastrService// Inject the WebSocketService
  ) {
  }

  showwarning(msg: String) {
    this.toast.warning(msg.toString());
  }
  fetchAllProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (err) => {
        console.error('Error fetching products', err);
      }
    });
  }





  ngOnInit() {
    this.webSocketService.connect();

    this.authService.isAdmin$.subscribe(status => {
      this.isAdmin = status;
      if ( this.isLoggedIn) {
        this.loadDashboardData();

      }
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

      // Show initial alerts for non-admin users
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
