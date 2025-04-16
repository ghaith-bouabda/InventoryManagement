import { Component, OnInit } from '@angular/core';
import { ProductControllerService } from '../services/services/product-controller.service';  // Adjust the path
import { ProductDto } from '../services/models/product-dto';  // Adjust the path
import { WebSocketService } from '../socketservice/WebSocketService';
import {Product} from '../services/models/product';
import {ToastrService} from 'ngx-toastr';  // Ensure the WebSocket service is imported

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {

  products: ProductDto[] = [];



  constructor(
    private productService: ProductControllerService,
    private webSocketService: WebSocketService,
  ) {
  }

  ngOnInit(): void {
    this.fetchAllProducts();
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







}
