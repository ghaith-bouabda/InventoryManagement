import {Component, OnInit, OnDestroy, NgIterable} from "@angular/core";
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
import {SaleDto} from '../services/models/sale-dto';
import {PurchaseDto} from '../services/models/purchase-dto';

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
    this.loadSuppliersData();
    this.fetchTopSellingProducts(); // Add this
    this.fetchRecentActivity();     // Add this
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
  chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Important for fixed height
    plugins: {
      legend: {
        position: 'top'
      }
    }
  };



  topProductsData: any;
  salesPurchasesTrendData: any;


  topSellingProducts: any[] = [];
  recentSales: SaleDto[] = [];
  recentPurchases: PurchaseDto[] = [];
  activityLogs: any[] | undefined;

  fetchRecentActivity(): void {
    // Clear existing logs while loading
    this.activityLogs = undefined;

    // Get recent sales
    this.saleService.getAllSales().subscribe({
      next: (sales) => {
        this.recentSales = sales
          .sort((a, b) => new Date(b.saleDate!).getTime() - new Date(a.saleDate!).getTime())
          .slice(0, 5);

        // Get recent purchases
        this.purchaseService.getAllPurchases().subscribe({
          next: (purchases) => {
            this.recentPurchases = purchases
              .sort((a, b) => new Date(b.purchaseDate!).getTime() - new Date(a.purchaseDate!).getTime())
              .slice(0, 5);

            // Combine and sort activities
            this.activityLogs = [
              ...this.recentSales.map(sale => ({
                type: 'sale',
                date: sale.saleDate,
                message: `Sale #${sale.invoiceNumber} for ${sale.amount}€`,
                amount: sale.amount
              })),
              ...this.recentPurchases.map(purchase => ({
                type: 'purchase',
                date: purchase.purchaseDate,
                message: `Purchase #${purchase.invoiceNumber} for ${purchase.totalAmount}€`,
                amount: purchase.totalAmount
              }))
            ].sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())
              .slice(0, 10); // Show last 10 activities
          },
          error: (err) => {
            console.error('Error fetching recent purchases', err);
            this.toastr.error('Failed to load purchase data');
          }
        });
      },
      error: (err) => {
        console.error('Error fetching recent sales', err);
        this.toastr.error('Failed to load sales data');
      }
    });
  }

  fetchTopSellingProducts(): void {
    // First get all products to map IDs to product objects
    this.productService.getAllProducts().subscribe({
      next: (allProducts) => {
        // Create a map of product IDs to product objects
        const productsMap = new Map<number, ProductDto>();
        allProducts.forEach(product => {
          if (product.id) {
            productsMap.set(product.id, product);
          }
        });

        // Now get all sales to calculate top selling products
        this.saleService.getAllSales().subscribe({
          next: (sales) => {
            const productSalesMap = new Map<number, { product: ProductDto | undefined, totalSold: number }>();

            sales.forEach(sale => {
              sale.saleItems?.forEach(item => {
                if (item.productId) {
                  const productId = item.productId;
                  const current = productSalesMap.get(productId) || {
                    product: productsMap.get(productId),
                    totalSold: 0
                  };
                  current.totalSold += item.quantity;
                  productSalesMap.set(productId, current);
                }
              });
            });

            // Convert to array, filter out undefined products, and sort by total sold
            this.topSellingProducts = Array.from(productSalesMap.values())
              .filter(item => item.product !== undefined)
              .sort((a, b) => b.totalSold - a.totalSold)
              .slice(0, 5); // Get top 5

            // Update the chart data
            this.topProductsData = {
              labels: this.topSellingProducts.map(p => p.product?.name || 'Unknown Product'),
              datasets: [{
                label: 'Units Sold',
                data: this.topSellingProducts.map(p => p.totalSold),
                backgroundColor: 'rgba(14,17,202,0.59)',
              }]
            };
          },
          error: (err) => {
            console.error('Error fetching sales data', err);
            this.toastr.error('Failed to load sales data');
          }
        });
      },
      error: (err) => {
        console.error('Error fetching products for mapping', err);
        this.toastr.error('Failed to load product data');
      }
    });
  }
}
