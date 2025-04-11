import { Component, OnInit } from '@angular/core';
import { ProductControllerService } from '../services/services/product-controller.service';  // Adjust the path
import { ProductDto } from '../services/models/product-dto';  // Adjust the path
import { WebSocketService } from '../socketservice/WebSocketService';
import {Product} from '../services/models/product';  // Ensure the WebSocket service is imported

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {

  products: ProductDto[] = [];
  lowStockProducts: Product[] = []
  productStats = {
    total: 0,
    lowStock: 0,
    outOfStock: 0,
  }


  constructor(
    private productService: ProductControllerService,
    private webSocketService: WebSocketService // Inject the WebSocketService
  ) {
  }

  ngOnInit(): void {
    this.fetchAllProducts();
    this.loadDashboardData()
  }

  fetchAllProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.checkLowStockForAllProducts();  // Check low stock on initial fetch
      },
      error: (err) => {
        console.error('Error fetching products', err);
      }
    });
  }

  checkLowStockForAllProducts(): void {
    this.products.forEach(product => {
      this.webSocketService.checkLowStock(product);  // Check stock for each product
    });
  }

  updateProductStock(product: ProductDto, newStockQuantity: number): void {
    product.stockQuantity = newStockQuantity;  // Update the stock quantity
    this.webSocketService.checkLowStock(product);  // Check for low stock
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


    // Get product category distribution for chart


    this.productService.getLowStockProducts().subscribe((products) => {
      this.lowStockProducts = products
      this.productStats.lowStock = products.length
    })
  }
}
