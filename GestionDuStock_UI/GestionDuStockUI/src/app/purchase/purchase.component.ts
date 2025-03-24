import { Component, OnInit } from '@angular/core';
import { PurchaseControllerService } from '../services/services/purchase-controller.service';
import { Purchase } from '../services/models/purchase';
import { Product } from '../services/models/product';
import { SupplierControllerService } from '../services/services/supplier-controller.service';
import { Supplier } from '../services/models/supplier';
import { ProductControllerService } from '../services/services/product-controller.service';

@Component({
  selector: 'app-purchase',
  templateUrl: './purchase.component.html',
  styleUrls: ['./purchase.component.scss']
})
export class PurchaseComponent implements OnInit {
  purchases: Purchase[] = [];
  products: Product[] = [];
  suppliers: Supplier[] = [];
  selectedSupplierId: string = ''; // Supplier ID selected by the user
  purchaseDate: string = ''; // The date of the purchase
  selectedProductId: string = ''; // Selected product ID
  newProduct: any = { name: '', price: 0, quantity: 1 }; // New product details
  newPurchaseData: any = { // Structure the purchase data
    purchase: {
      purchaseDate: '',  // Date of purchase
      totalAmount: 0,  // Total amount for the purchase
      products: []  // Products to be added to the purchase
    }
  };

  constructor(
    private purchaseService: PurchaseControllerService,
    private supplierService: SupplierControllerService,
    private productService: ProductControllerService
  ) {}

  ngOnInit(): void {
    this.getAllPurchases();
    this.getAvailableProducts();
    this.supplierService.getAllFournisseurs().subscribe({
      next: (data: Supplier[]) => {
        this.suppliers = data;
      }
    });
  }

  getAllPurchases(): void {
    this.purchaseService.getAllPurchases().subscribe(purchases => {
      this.purchases = purchases;
    });
  }

  getAvailableProducts(): void {
    this.productService.getAllProducts().subscribe(products => {
      this.products = products;
    });
  }
  createPurchase(): void {
    if (!this.selectedSupplierId || !this.purchaseDate || this.newPurchaseData.purchase.products.length === 0) {
      console.error("Missing required fields: Supplier, Date, or Products");
      return;
    }

    let quantity = 0;
    this.newPurchaseData.purchase.products.forEach((item: { quantity: number }) => {
      if (item.quantity) {
        quantity += item.quantity;
      }
    });

    // Corrected requestData format
    const requestData = {
      supplierId: parseInt(this.selectedSupplierId, 10),
      purchaseDate: new Date(this.purchaseDate).toISOString(),
      status: "pending",
      purchaseItems: this.newPurchaseData.purchase.products.map(
        (item: { product: { id: number; price: number }; quantity: number }) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        })
      )
    };

    console.log("Sending Purchase Request:", { purchase: requestData });

    // Wrap requestData inside { purchase: requestData }
    this.purchaseService.createPurchase({ purchase: requestData }).subscribe({
      next: (purchase) => {
        console.log("Purchase created successfully:", purchase);
        this.getAllPurchases();
        this.resetPurchaseForm();
      },
      error: (error) => {
        console.error("Error creating purchase:", error);
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

  // Add selected product to purchase list
  addProductToPurchase(): void {
    if (!this.newProduct.name || this.newProduct.price <= 0 || this.newProduct.quantity < 1) return;

    this.newPurchaseData.purchase.products.push({ product: { ...this.newProduct }, quantity: this.newProduct.quantity });
    this.calculateTotalAmount();
    this.newProduct = { name: '', price: 0, quantity: 1 };
    this.selectedProductId = ''; // Reset selection
  }

  // Remove product from purchase list
  removeProductFromPurchase(product: Product): void {
    const index = this.newPurchaseData.purchase.products.findIndex(
      (item: { product: Product }) => item.product.id === product.id
    );
    if (index !== -1) {
      this.newPurchaseData.purchase.products.splice(index, 1);
      this.calculateTotalAmount();
    }
  }

  // Calculate total amount for the purchase
  calculateTotalAmount(): number {
    let total = 0;
    this.newPurchaseData.purchase.products.forEach((item: { product: Product; quantity: number }) => {
      const quantity = item.quantity || 0; // Fallback to 0 if quantity is undefined
      const price = item.product.price || 0; // Fallback to 0 if price is undefined
      total += price * quantity;
    });
    this.newPurchaseData.purchase.totalAmount = total;
    return total;
  }

  // Reset purchase form after successful creation
  private resetPurchaseForm() {
    this.selectedProductId = '';
    this.purchaseDate = '';
    this.selectedSupplierId = '';
    this.newPurchaseData = { purchase: { purchaseDate: '', totalAmount: 0, products: [] } };
  }
}
