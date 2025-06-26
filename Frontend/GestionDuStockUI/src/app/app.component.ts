import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthControllerService } from './services/services/auth-controller.service';
import { WebSocketService } from './socketservice/WebSocketService';
import { ProductControllerService } from './services/services/product-controller.service';
import { ToastrService } from 'ngx-toastr';
import { ProductDto } from './services/models/product-dto';
import { Product } from './services/models/product';
import { NavigationEnd, Router } from '@angular/router';
import { TokenService } from './token/token.service';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
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
  private destroy$ = new Subject<void>();

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
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => {
      this.isLoginRoute = event.urlAfterRedirects === '/login';
    });
  }

  ngOnInit(): void {
    window.addEventListener('beforeunload', () => {
      this.webSocketService.disconnect();
    });

    this.isLoggedIn$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(isLoggedIn => {
      if (!isLoggedIn) {
        this.webSocketService.disconnect();
        this.router.navigate(['/login']);
        return;
      }

      // This will ensure only one connection exists
      this.webSocketService.connect();

      this.authService.isAdmin$.pipe(
        takeUntil(this.destroy$)
      ).subscribe(status => {
        this.isAdmin = status;
        if (!this.isAdmin) {
          this.loadDashboardData();
        }
      });
    });
  }

  loadDashboardData(): void {
    this.productService.getLowStockProducts().subscribe((products) => {
      this.lowStockProducts = products;
      this.productStats.lowStock = products.length;

      if (products.length > 0) {
        const productNames = products.map(p => p.name).join(', ');
        this.toast.warning(`Low stock alert: ${products.length} product(s) need attention: ${productNames}`);
      }
    });

    this.productService.getOutOfStockProducts().subscribe((products) => {
      this.productStats.outOfStock = products.length;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.webSocketService.disconnect();
    window.removeEventListener('beforeunload', () => {
      this.webSocketService.disconnect();
    });
  }

  title = 'GestionDuStockUI';
}
