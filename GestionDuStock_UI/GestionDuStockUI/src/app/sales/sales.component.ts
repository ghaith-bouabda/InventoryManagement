import { Component, OnInit } from '@angular/core';
import { SaleControllerService } from '../services/services/sale-controller.service';
import { Sale } from '../services/models/sale';
import { ProductControllerService } from '../services/services/product-controller.service';
import { Product } from '../services/models/product';
import { CustomerControllerService } from '../services/services/customer-controller.service';
import { Customer } from '../services/models/customer';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit {
  sales: Sale[] = [];
  products: Product[] = [];
  customers: Customer[] = [];
  selectedCustomerId: string = ''; // Customer ID selected by the user
  saleDate: string = ''; // The date of the sale
  selectedProductId: string = ''; // Selected product ID
  newProduct: any = { name: '', price: 0, quantity: 1 }; // New product details
  newSaleData: any = { // Structure the sale data
    sale: {
      saleDate: '',  // Date of sale
      totalAmount: 0,  // Total amount for the sale
      products: []  // Products to be added to the sale
    }
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
      }
    });
  }


  getAvailableProducts(): void {
    this.productService.getAllProducts().subscribe(products => {
      this.products = products;
    });
  }

  createSale(): void {
    if (!this.selectedCustomerId || !this.saleDate || this.newSaleData.sale.products.length === 0) {
      console.error("Missing required fields: Customer, Date, or Products");
      return;
    }

    const requestData = {
      customerId: parseInt(this.selectedCustomerId, 10),  // Customer ID
      body: {
        saleDate: new Date(this.saleDate).toISOString(),
        amount: this.calculateTotalAmount(),
        saleItems: this.newSaleData.sale.products.map(
          (item: { product: { id: number; price: number }; quantity: number }) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price
          })
        ),
        status: "pending"  // Sale status
      }
    };

    console.log("Sending Sale Request:", requestData);

    this.saleService.createSale(requestData).subscribe({
      next: (sale) => {
        console.log("Sale created successfully:", sale);
        this.resetSaleForm();
      },
      error: (error) => {
        console.error("Error creating sale:", error);
      }
    });
  }


  // Handle product selection
  onProductSelect(): void {
    if (this.selectedProductId === 'new') {
      this.newProduct = { name: '', price: 0, quantity: 1 };
    } else {
      let product = this.products.find(p => p.id?.toString() === this.selectedProductId);
      if (product) {
        this.newProduct = { ...product, quantity: 1 };
      }
    }
  }

  // Add selected product to sale list
  addProductToSale(): void {
    if (!this.newProduct.name || this.newProduct.price <= 0 || this.newProduct.quantity < 1) return;

    this.newSaleData.sale.products.push({ product: { ...this.newProduct }, quantity: this.newProduct.quantity });
    this.calculateTotalAmount();
    this.newProduct = { name: '', price: 0, quantity: 1 };
    this.selectedProductId = ''; // Reset selection
  }

  // Remove product from sale list
  removeProductFromSale(product: Product): void {
    const index = this.newSaleData.sale.products.findIndex(
      (item: { product: Product }) => item.product.id === product.id
    );
    if (index !== -1) {
      this.newSaleData.sale.products.splice(index, 1);
      this.calculateTotalAmount();
    }
  }

  // Calculate total amount for the sale
  calculateTotalAmount(): number {
    let total = 0;
    this.newSaleData.sale.products.forEach((item: { product: Product; quantity: number }) => {
      const quantity = item.quantity || 0; // Fallback to 0 if quantity is undefined
      const price = item.product.price || 0; // Fallback to 0 if price is undefined
      total += price * quantity;
    });
    this.newSaleData.sale.totalAmount = total;
    return total;
  }

  // Reset sale form after successful creation
  private resetSaleForm() {
    this.selectedProductId = '';
    this.saleDate = '';
    this.selectedCustomerId = '';
    this.newSaleData = { sale: { saleDate: '', totalAmount: 0, products: [] } };
  }
}
