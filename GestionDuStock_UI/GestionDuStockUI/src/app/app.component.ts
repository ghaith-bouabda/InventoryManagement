import { Component, OnInit } from '@angular/core';
import { AuthControllerService } from './services/services/auth-controller.service';
import { WebSocketService } from './socketservice/WebSocketService';
import { ProductControllerService } from './services/services/product-controller.service';
import { ToastrService } from 'ngx-toastr';
import { ProductDto } from './services/models/product-dto';
import { Product } from './services/models/product';
import {NavigationEnd, Router} from '@angular/router';
import { TokenService } from './token/token.service';
import { Observable } from 'rxjs';
import {filter} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isAdmin = false;
  products: ProductDto[] = [];
  lowStockProducts: Product[] = [];
  isLoggedIn$: Observable<boolean>;
  productStats = {
    total: 0,
    lowStock: 0,
    outOfStock: 0,
  };
  isLoginRoute = false;
  constructor(
    private authService: AuthControllerService,
    private productService: ProductControllerService,
    private webSocketService: WebSocketService,
    private toast: ToastrService,
    private router: Router,
    private tokenService: TokenService
  ) {
    this.isLoggedIn$ = this.tokenService.isLoggedIn$;
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isLoginRoute = event.urlAfterRedirects === '/login';
    });
  }


  ngOnInit(): void {
    this.webSocketService.connect();

    // Clean up on destroy
    window.addEventListener('beforeunload', () => {
      this.webSocketService.disconnect();
    });

    this.isLoggedIn$.subscribe(isLoggedIn => {
      if (!isLoggedIn) {
        this.router.navigate(['/login']);
        this.webSocketService.disconnect();
        return;
      }

      // Only connect once when authenticated
      this.webSocketService.connect();

      this.authService.isAdmin$.subscribe(status => {
        this.isAdmin = status;
        if (!this.isAdmin) {
          this.loadDashboardData();
        }
      });
    });
  }

  loadDashboardData(): void {
    // Only load low stock products if not admin
    this.productService.getLowStockProducts().subscribe((products) => {
      this.lowStockProducts = products;
      this.productStats.lowStock = products.length;

      // For users, show consolidated notification instead of per-product
      if (!this.isAdmin && products.length > 0) {
        const productNames = products.map(p => p.name).join(', ');
        this.toast.warning(`Low stock alert: ${products.length} product(s) need attention: ${productNames}`);
      }
    });


    this.productService.getOutOfStockProducts().subscribe((products) => {
      this.productStats.outOfStock = products.length;
    });

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

  title = 'GestionDuStockUI';
}
