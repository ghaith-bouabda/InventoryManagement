import { Component, OnInit, OnDestroy } from "@angular/core";
import { ProductControllerService } from "../services/services/product-controller.service";
import { SupplierControllerService } from "../services/services/supplier-controller.service";
import { SaleControllerService } from "../services/services/sale-controller.service";
import { AuthControllerService } from "../services/services/auth-controller.service";
import { User } from "../services/models/user";
import { Product } from "../services/models/product";
import { WebSocketService } from '../socketservice/WebSocketService';
import { MessageService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { PurchaseControllerService } from '../services/services/purchase-controller.service';
import { ChartData } from 'chart.js';
import { ProductDto } from '../services/models/product-dto';

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isAdmin = false;
  productStats = {
    total: 0,
    lowStock: 0,
    outOfStock: 0,
  };

  products: ProductDto[] = [];
  stockStatusData: ChartData<'pie'> = {
    labels: ['In Stock', 'Low Stock', 'Out of Stock'],
    datasets: [
      {
        data: [60, 25, 15],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      }
    ]
  };

  suppliersData: any;
  totalSales = 0;
  totalPurchases = 0;
  loading = true;

  constructor(
    private productService: ProductControllerService,
    private supplierService: SupplierControllerService,
    private saleService: SaleControllerService,
    private authService: AuthControllerService,
    private webSocketService: WebSocketService,
    private purchaseService: PurchaseControllerService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.authService.isAdmin()
    this.loadDashboardData();
    this.webSocketService.connect();
    this.fetchTotalPurchases();
    this.fetchTotalSales();
    this.updateStockStatusData();
    this.loadSuppliersData();  // Fetch suppliers data when initializing the dashboard
  }

  ngOnDestroy(): void {
    this.webSocketService.disconnect();
  }

  loadDashboardData(): void {
    this.loading = true;

    // Get all products
    this.productService.getAllProducts().subscribe((products) => {
      this.products = products.filter(s=>s.isDeleted==false);
      this.productStats.total = products.filter(s=>s.isDeleted==false).length;

      // Update the stock status data
      this.updateStockStatusData();

      this.loading = false;
    });

    // Get low stock products
    this.productService.getLowStockProducts().subscribe((products) => {
      this.productStats.lowStock = products.filter(s=>s.isDeleted==false).length;
    });

    // Get out of stock products
    this.productService.getOutOfStockProducts().subscribe((products) => {
      this.productStats.outOfStock = products.filter(s=>s.isDeleted==false).length;
    });
  }

  fetchTotalPurchases(): void {
    this.purchaseService.getTotalPurchases().subscribe({
      next: (data) => {
        this.totalPurchases = data;
      },
      error: (err) => {
        console.error('Error fetching total purchases', err);
      }
    });
  }

  fetchTotalSales(): void {
    this.saleService.getTotalSales().subscribe({
      next: (data) => {
        this.totalSales = data;
      },
      error: (err) => {
        console.error('Error fetching total sales', err);
      }
    });
  }

  updateStockStatusData(): void {
    const inStock = this.products.filter((p) => p.stockQuantity >= p.stockThreshold! && !p.isDeleted).length;
    const lowStock = this.products.filter((p) => p.stockQuantity < p.stockThreshold! && p.stockQuantity > 0&& !p.isDeleted).length;
    const outOfStock = this.products.filter((p) => p.stockQuantity === 0&& !p.isDeleted).length;

    this.stockStatusData = {
      labels: ['In Stock', 'Low Stock', 'Out of Stock'],
      datasets: [
        {
          data: [inStock, lowStock, outOfStock],
          backgroundColor: ['#00bf57', '#e3c501', '#ff003c'],
        },
      ],
    };
  }

  // Fetch suppliers data and create chart for suppliers
  loadSuppliersData(): void {
    this.supplierService.getAllFournisseurs().subscribe((suppliers) => {
      // Filter out suppliers who are deleted (assuming 'isDeleted' property exists)
      const nonDeletedSuppliers = suppliers.filter(supplier => !supplier.isDeleted);

      // Create the data for the chart using only non-deleted suppliers
      const supplierNames = nonDeletedSuppliers.map(supplier => supplier.name);
      const supplierProductCounts = nonDeletedSuppliers.map(supplier =>
        this.products.filter(p => p.supplier?.id === supplier.id && !p.isDeleted).length
      );

      // Set the suppliers data to create the bar chart
      this.suppliersData = {
        labels: supplierNames,
        datasets: [
          {
            label: 'Number of Products',
            data: supplierProductCounts,
            backgroundColor: '#42A5F5',
          },
        ],
      };
    });
  }
}
