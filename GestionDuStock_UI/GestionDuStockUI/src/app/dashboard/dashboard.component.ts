import { Component,  OnInit } from "@angular/core"
import { ProductControllerService } from "../services/services/product-controller.service";
import  { SupplierControllerService } from "../services/services/supplier-controller.service"
import  { SaleControllerService } from "../services/services/sale-controller.service"
import  { AuthControllerService } from "../services/services/auth-controller.service"
import  { User } from "../services/models/user"
import  { Product } from "../services/models/product"
import {WebSocketService} from '../socketservice/WebSocketService';
import {MessageService} from 'primeng/api';
import {ToastrService} from 'ngx-toastr';
import {PurchaseControllerService} from '../services/services/purchase-controller.service';

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null
  isAdmin = false
  productStats = {
    total: 0,
    lowStock: 0,
    outOfStock: 0,
  }

  products: Product[] = []
  lowStockProducts: Product[] = []

  // Chart data
  productCategoryData: any
  stockStatusData: any

  loading = true
 totalSales: number | undefined;
   totalPurchases: number | undefined;
  constructor(
    private productService: ProductControllerService,
    private supplierService: SupplierControllerService,
    private saleService: SaleControllerService,
    private authService: AuthControllerService,
    private webSocketService: WebSocketService,
private purchaseService: PurchaseControllerService,
private toastr: ToastrService) {}




  ngOnInit(): void {
    this.loadDashboardData()
    this.webSocketService.connect();
    this.fetchTotalPurchases();
    this.fetchTotalSales();
  }
  ngOnDestroy(): void {
    this.webSocketService.disconnect();
  }

  loadDashboardData(): void {
    this.loading = true

    // Get all products
    this.productService.getAllProducts().subscribe((products) => {
      this.products = products
      this.productStats.total = products.length
      this.loading = false
    })

    // Get low stock products
    this.productService.getLowStockProducts().subscribe((products) => {
      this.lowStockProducts = products
      this.productStats.lowStock = products.length
    })
    // Get out of stock products
    this.productService.getOutOfStockProducts().subscribe((products) => {
      this.productStats.outOfStock = products.length
    })


    // Get product category distribution for chart


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
}
