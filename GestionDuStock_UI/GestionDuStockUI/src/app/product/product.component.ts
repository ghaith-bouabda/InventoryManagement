import { Component, OnInit } from '@angular/core';
import { ProductControllerService } from '../services/services/product-controller.service';  // Adjust the path
import { Product } from '../services/models/product';  // Adjust the path
import { ProductCategoryDto } from '../services/models/product-category-dto';  // Adjust the path

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {

  products: Product[] = [];
  productCategories: ProductCategoryDto[] = [];

  constructor(private productService: ProductControllerService) { }

  ngOnInit(): void {
    this.fetchAllProducts();
    this.fetchProductCategories();
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

  fetchProductCategories(): void {
    this.productService.getProductsByCategoryCount().subscribe({
      next: (data) => {
        this.productCategories = data;
      },
      error: (err) => {
        console.error('Error fetching product categories', err);
      }
    });
  }

}
