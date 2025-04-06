import { Component, OnInit } from '@angular/core';
import { PurchaseControllerService } from '../services/services/purchase-controller.service';
import { PurchaseDto } from '../services/models/purchase-dto';
import { Product } from '../services/models/product';
import { SupplierControllerService } from '../services/services/supplier-controller.service';
import { Supplier } from '../services/models/supplier';
import { ProductControllerService } from '../services/services/product-controller.service';
import { ProductDto } from '../services/models/product-dto';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-purchase',
  templateUrl: './purchase.component.html',
  styleUrls: ['./purchase.component.scss']
})
export class PurchaseComponent implements OnInit {
  purchases: PurchaseDto[] = [];
  products: ProductDto[] = [];
  suppliers: Supplier[] = [];
  selectedSupplierId: string = '';
  purchaseDate: string = '';
  selectedProductId: string = '';
  newProduct: Product = { name: '', price: 0, stockQuantity: 1, stockThreshold: 1 };

  // Fields for Search
  searchType: string = 'invoice'; // Default search type
  searchText: string = '';
  filteredResults: any[] = []; // This will hold the filtered search results

  newPurchaseData: any = {
    purchase: {
      purchaseDate: '',
      totalAmount: 0,
      products: []
    }
  };

  constructor(
    private purchaseService: PurchaseControllerService,
    private supplierService: SupplierControllerService,
    private productService: ProductControllerService,
    private toastr: ToastrService
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

    const requestData = {
      supplierId: parseInt(this.selectedSupplierId, 10),
      purchaseDate: new Date(this.purchaseDate).toISOString(),
      status: "pending",
      purchaseItems: this.newPurchaseData.purchase.products.map(
        (item: { product: { id: number; name: string; price: number; stockThreshold: number }; quantity: number }) => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          stockThreshold: item.product.stockThreshold,
          price: item.product.price
        })
      )
    };

    console.log("Sending Purchase Request:", { purchase: requestData });

    this.purchaseService.createPurchase({ body: requestData }).subscribe({
      next: (purchase) => {
        console.log("Purchase created successfully:", purchase);
        this.resetPurchaseForm();
        this.showSuccess();
      },
      error: (error) => {
        console.error("Error creating purchase:", error);
        this.showError();
      }
    });
  }

  // Handle product selection
  onProductSelect(): void {
    if (this.selectedProductId === 'new') {
      this.newProduct = { name: '', price: 0, stockQuantity: 1, stockThreshold: 1 };
    } else {
      const selectedProduct = this.products.find(product => product.id === parseInt(this.selectedProductId, 10));
      if (selectedProduct) {
        this.newProduct = {
          id: selectedProduct.id,
          name: selectedProduct.name,
          price: selectedProduct.price,
          stockQuantity: 1,
          stockThreshold: selectedProduct.stockThreshold
        };
      }
    }
  }

  // Add selected product to purchase list
  addProductToPurchase(): void {
    if (!this.newProduct || this.newProduct.stockQuantity <= 0) return;

    const existingProduct = this.newPurchaseData.purchase.products.find(
      (item: { product: Product }) => item.product.id === this.newProduct.id
    );

    if (existingProduct) {
      existingProduct.quantity += this.newProduct.stockQuantity;
    } else {
      this.newPurchaseData.purchase.products.push({
        product: { ...this.newProduct },
        quantity: this.newProduct.stockQuantity
      });
    }

    console.log("Updated Purchase Products:", this.newPurchaseData.purchase.products);

    this.calculateTotalAmount();

    // Reset input fields
    this.newProduct = { name: '', price: 0, stockQuantity: 1, stockThreshold: 1 };
    this.selectedProductId = '';
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
      const quantity = item.quantity || 0;
      const price = item.product.price || 0;
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

  showSuccess() {
    this.toastr.success('Purchase Created Successfully!');
  }

  showError() {
    this.toastr.error('Error creating purchase!');
  }

  // Search functionality (filter results)
  search(): void {
    if (this.searchType === 'invoice') {
      this.getPurchaseByInvoice(this.searchText);
    } else if (this.searchType === 'supplier') {
      this.getPurchaseBySupplier(this.searchText);
    } else if (this.searchType === 'product') {
      this.filteredResults = this.purchases.filter(purchase =>
        purchase.purchaseItems.some(item => item.productId)
      );
    }
  }

  getPurchaseBySupplier(slug: string) {
    this.purchaseService.getPurchaseBySupplier({ slug }).subscribe({
      next: (purchase) => {
        console.log('Purchase fetched by supplier:', purchase);
      },
      error: (err) => {
        console.error('Error fetching purchase by supplier', err);
      }
    });
  }

  // Fetch purchase by invoice number
  getPurchaseByInvoice(invoiceNumber: string) {
    this.purchaseService.getPurchaseByInvoiceNumber({ invoiceNumber }).subscribe({
      next: (purchase) => {
        console.log('Purchase fetched by invoice number:', purchase);
        this.filteredResults.push(JSON.stringify(purchase))
      },
      error: (err) => {
        console.error('Error fetching purchase by invoice number', err);
      }
    });
  }

  deletePurchase(id: number) {
    this.purchaseService.deletePurchase({ id }).subscribe({
      next: () => {
        this.purchases = this.purchases.filter(purchase => purchase.id !== id);
        console.log('Purchase deleted successfully');
      },
      error: (err) => {
        console.error('Error deleting purchase', err);
      }
    });
  }

  editPurchase(result: any) {

  }
}
