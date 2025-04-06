import { Component, OnInit } from '@angular/core';
import { SaleControllerService } from '../services/services/sale-controller.service';
import { ProductControllerService } from '../services/services/product-controller.service';
import { CustomerControllerService } from '../services/services/customer-controller.service';
import { SaleDto } from '../services/models/sale-dto';
import { Product } from '../services/models/product';
import { Customer } from '../services/models/customer';
import {ProductDto} from '../services/models/product-dto';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit {
  sales: SaleDto[] = [];
  products: ProductDto[] = [];
  customers: Customer[] = [];
  selectedCustomerId: string = '';
  saleDate: string = '';
  selectedProductId: string = '';
  newProduct: ProductDto = { id: 0, name: '', price: 0, stockQuantity: 1 };

  newSaleData: SaleDto = {
    invoiceNumber: '',
    customer: undefined,
    saleDate: '',
    amount: 0,
    saleItems: [] // Make sure saleItems is initialized as an empty array
  };

  constructor(
    private saleService: SaleControllerService,
    private productService: ProductControllerService,
    private customerService: CustomerControllerService
  ) {}

  ngOnInit(): void {
    this.getAvailableProducts();
    this.customerService.getAllCustomers().subscribe({
      next: (data: Customer[]) => {
        this.customers = data;
      },
      error: (err) => {
        console.error("Error fetching customers:", err);
      }
    });
  }

  getAvailableProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products: ProductDto[]) => {
        this.products = products;
      },
      error: (err) => {
        console.error("Error fetching products:", err);
      }
    });
  }

  createSale(): void {
    // Check if required fields are present
    if (!this.selectedCustomerId || !this.saleDate || !this.newSaleData.saleItems || this.newSaleData.saleItems.length === 0) {
      console.error("Missing required fields: Customer, Date, or Products");
      return;
    }

    const requestData = {
      customerId: parseInt(this.selectedCustomerId, 10),
      body: {
        saleDate: new Date(this.saleDate).toISOString(),
        amount: this.calculateTotalAmount(),
        invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`,
        saleItems: this.newSaleData.saleItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity, // Keep quantity as the field here
          price: item.price
        })),
        status: "pending"
      }
    };

    console.log("Sending Sale Request:", requestData);

    this.saleService.createSale(requestData).subscribe({
      next: sale => {
        console.log("Sale created successfully:", sale);
        this.resetSaleForm();
      },
      error: error => {
        console.error("Error creating sale:", error);
      }
    });
  }

  onProductSelect(): void {
    if (this.selectedProductId === 'new') {
      this.newProduct = { id: 0, name: '', price: 0, stockQuantity: 1 }; // Default values
    } else {
      let product = this.products.find(p => p.id?.toString() === this.selectedProductId);
      if (product) {
        this.newProduct = { ...product, stockQuantity: 1 }; // Reset to stockQuantity when selected
      }
    }
  }

  addProductToSale(): void {
    // Check if the product has valid details
    if (!this.newProduct.id || !this.newProduct.name || this.newProduct.price <= 0 || this.newProduct.stockQuantity < 1) {
      console.error("Invalid product details");
      return;
    }

    // Ensure saleItems is always initialized
    if (!this.newSaleData.saleItems) {
      this.newSaleData.saleItems = [];
    }

    const existingProduct = this.newSaleData.saleItems.find(item => item.productId === this.newProduct.id);
    if (existingProduct) {
      existingProduct.quantity += this.newProduct.stockQuantity;
    } else {
      this.newSaleData.saleItems.push({
        productId: this.newProduct.id,
        quantity: this.newProduct.stockQuantity, // Keep stockQuantity for the sale
        price: this.newProduct.price
      });
    }

    this.calculateTotalAmount();
    this.newProduct = { id: 0, name: '', price: 0, stockQuantity: 1 }; // Reset newProduct
    this.selectedProductId = ''; // Reset selectedProductId
  }

  removeProductFromSale(productId: number): void {
    // Filter out the product to be removed from saleItems
    this.newSaleData.saleItems = this.newSaleData.saleItems.filter(item => item.productId !== productId);
    this.calculateTotalAmount();
  }

  calculateTotalAmount(): number {
    // Calculate total based on price * quantity of saleItems
    return this.newSaleData.amount = this.newSaleData.saleItems.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );
  }

  private resetSaleForm() {
    this.selectedCustomerId = '';
    this.saleDate = '';
    this.selectedProductId = '';
    this.newSaleData = { invoiceNumber: '', customer: undefined, saleDate: '', amount: 0, saleItems: [] }; // Reset form
  }
}
