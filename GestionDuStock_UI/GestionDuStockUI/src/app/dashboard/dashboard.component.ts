import { Component,  OnInit } from "@angular/core"
import { ProductControllerService } from "../services/services/product-controller.service";  // Remove 'type'
import  { SupplierControllerService } from "../services/services/supplier-controller.service"
import  { SaleControllerService } from "../services/services/sale-controller.service"
import  { AuthControllerService } from "../services/services/auth-controller.service"
import  { User } from "../services/models/user"
import  { Product } from "../services/models/product"

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

  constructor(
    private productService: ProductControllerService,
    private supplierService: SupplierControllerService,
    private saleService: SaleControllerService,
    private authService: AuthControllerService,
  ) {

  }

  ngOnInit(): void {
    this.loadDashboardData()
  }

  loadDashboardData(): void {
    this.loading = true

    // Get all products
    this.productService.getAllProducts().subscribe((products) => {
      this.products = products
      this.productStats.total = products.length
      this.prepareChartData()
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
    this.productService.getProductsByCategoryCount().subscribe((data) => {
      this.prepareProductCategoryChart(data)
    })
  }

  prepareChartData(): void {
    // Prepare stock status chart data
    this.stockStatusData = {
      labels: ["Normal", "Low Stock", "Out of Stock"],
      datasets: [
        {
          data: [
            this.productStats.total - this.productStats.lowStock - this.productStats.outOfStock,
            this.productStats.lowStock,
            this.productStats.outOfStock,
          ],
          backgroundColor: ["#4caf50", "#ff9800", "#f44336"],
          hoverBackgroundColor: ["#81c784", "#ffb74d", "#e57373"],
        },
      ],
    }
  }

  prepareProductCategoryChart(data: any[]): void {
    const labels = data.map((item) => item.category)
    const values = data.map((item) => item.count)

    this.productCategoryData = {
      labels: labels,
      datasets: [
        {
          label: "Products by Category",
          data: values,
          backgroundColor: [
            "#3f51b5",
            "#2196f3",
            "#03a9f4",
            "#00bcd4",
            "#009688",
            "#4caf50",
            "#8bc34a",
            "#cddc39",
            "#ffeb3b",
            "#ffc107",
            "#ff9800",
            "#ff5722",
          ],
        },
      ],
    }
  }
}

