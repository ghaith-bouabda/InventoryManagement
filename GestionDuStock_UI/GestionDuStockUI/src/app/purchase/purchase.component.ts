import { Component, OnInit } from '@angular/core';
import { PurchaseControllerService } from '../services/services/purchase-controller.service';
import { PurchaseDto } from '../services/models/purchase-dto';
import { Product } from '../services/models/product';
import { SupplierControllerService } from '../services/services/supplier-controller.service';
import { Supplier } from '../services/models/supplier';
import { ProductControllerService } from '../services/services/product-controller.service';
import { ProductDto } from '../services/models/product-dto';
import { ToastrService } from 'ngx-toastr';
import {SupplierDto} from '../services/models/supplier-dto';

@Component({
  selector: 'app-purchase',
  templateUrl: './purchase.component.html',
  styleUrls: ['./purchase.component.scss']
})
export class PurchaseComponent implements OnInit {
  purchases: PurchaseDto[] = [];
  products: ProductDto[] = [];
  suppliers: SupplierDto[] = [];
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
        next: (data: SupplierDto[]) => {
          this.suppliers = data.filter(s => !s.isDeleted);
          const supplierMap = new Map(data.map(s => [s.id, s.name]));

          // Now fetch purchases and attach supplier name
          this.purchaseService.getAllPurchases().subscribe(purchases => {
            this.purchases = purchases.map(p => ({
              ...p,
              supplierName: supplierMap.get(p.supplierId)
            }));
          });
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

    this.purchaseService.createPurchase({ body: requestData }).subscribe({
      next: (purchase) => {
        const supplier = this.suppliers.find(s => s.id === purchase.supplierId);
        const enrichedPurchase = {
          ...purchase,
          supplierName: supplier?.name || 'Unknown'
        };

        // Add the newly created purchase to the list
        this.purchases.unshift(enrichedPurchase);

        // If any new products were involved in the purchase, add them to the product list
        purchase.purchaseItems.forEach((item: any) => {
          const newProduct = this.products.find(p => p.id === item.productId);
          if (!newProduct) {
            const newProductItem = {
              id: item.productId,
              name: item.name,
              price: item.price,
              stockQuantity: item.quantity,
              stockThreshold: item.stockThreshold
            };
            this.products.push(newProductItem); // Add new product to the list
          }
        });

        this.resetPurchaseForm();
        this.showSuccess();
        this.getAllPurchases();
        this.getAvailableProducts();
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

      // Ensure new products are not included in the filteredResults immediately
      console.log("Filtered Results (Product Search):", this.filteredResults);
    }
  }

  getPurchaseBySupplier(slug: string) {
    this.purchaseService.getPurchaseBySupplier({ slug }).subscribe({
      next: (purchases) => {
        console.log('Purchase fetched by supplier:', purchases);

        if (Array.isArray(purchases)) {
          this.filteredResults = purchases.map(p => {
            // Apply the same filter for non-deleted suppliers
            const supplier = this.suppliers.find(s => s.id === p.supplierId && s.isDeleted || !s.isDeleted);
            console.log(`Supplier ID: ${p.supplierId}, Found Supplier ID: ${supplier?.id}`);
            console.log('Available Suppliers:', this.suppliers);

            return {
              ...p,
              supplierName: supplier?.name || 'Unknown'
            };
          });
        } else {
          const supplier = this.suppliers.find(s => s.id === purchases.supplierId && !s.isDeleted);
          console.log(`Supplier ID: ${purchases.supplierId}, Found Supplier ID: ${supplier?.id}`);

          this.filteredResults = [{
            ...purchases,
            supplierName: supplier?.name || 'Unknown'
          }];
        }
      },
      error: (err) => {
        console.error('Error fetching purchase by supplier', err);
      }
    });
  }



  // Fetch purchase by invoice number
  getPurchaseByInvoice(invoiceNumber: string) {
    this.purchaseService.getPurchaseByInvoiceNumber({ invoiceNumber }).subscribe({
      next: (purchases) => {
        console.log('Purchase fetched by invoice number:', purchases);

        if (purchases) {
          const supplier = this.suppliers.find(s => s.id === purchases.supplierId&& s.isDeleted || !s.isDeleted);
          this.filteredResults = [{
            ...purchases,
            supplierName: supplier ? supplier.name : 'Unknown'
          }];
        }
      },
      error: (err) => {
        console.error('Error fetching purchase by invoice number', err);
      }
    });
  }



  deletePurchase(purchaseInvoice: string) {
    this.purchaseService.deletePurchase({ invoice: purchaseInvoice }).subscribe({
      next: () => {
        this.purchases = this.purchases.filter(p => p.invoiceNumber !== purchaseInvoice);
        this.filteredResults = this.filteredResults.filter(p => p.invoiceNumber !== purchaseInvoice);
        console.log('Purchase deleted successfully');
        this.toastr.success('Purchase deleted');
      },
      error: (err) => {
        console.error('Error deleting purchase', err);
        this.toastr.error('Failed to delete purchase');
      }
    });
  }


  editPurchase(result: any) {

  }
}
