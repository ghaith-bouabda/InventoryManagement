import { Component, OnInit } from '@angular/core';
import { PurchaseControllerService } from '../services/services/purchase-controller.service';
import { PurchaseDto } from '../services/models/purchase-dto';
import { Product } from '../services/models/product';
import { SupplierControllerService } from '../services/services/supplier-controller.service';
import { Supplier } from '../services/models/supplier';
import { ProductControllerService } from '../services/services/product-controller.service';
import { ProductDto } from '../services/models/product-dto';
import { ToastrService } from 'ngx-toastr';
import { SupplierDto } from '../services/models/supplier-dto';
import {PurchaseItemDto} from '../services/models/purchase-item-dto';

@Component({
  selector: 'app-purchase',
  templateUrl: './purchase.component.html',
  styleUrls: ['./purchase.component.scss']
})
export class PurchaseComponent implements OnInit {
  purchases: PurchaseDto[] = [];
  products: ProductDto[] = [];
  suppliers: SupplierDto[] = [];
  activeSuppliers: SupplierDto[] = [];

  selectedSupplierId: string = '';
  purchaseDate: string = '';
  selectedProductId: string = '';
  newProduct: Product = {name: '', price: 0, stockQuantity: 1, stockThreshold: 1};

  searchType: string = 'invoice';
  searchText: string = '';
  filteredResults: any[] = [];

  newPurchaseData: any = {
    purchase: {
      purchaseDate: '',
      totalAmount: 0,
      products: []
    }
  };

  editingPurchase: any = null;

  constructor(
    private purchaseService: PurchaseControllerService,
    private supplierService: SupplierControllerService,
    private productService: ProductControllerService,
    private toastr: ToastrService
  ) {
  }

  ngOnInit(): void {
    this.getAllPurchases();
    this.getAvailableProducts();

    this.supplierService.getAllFournisseurs().subscribe({
      next: (data: SupplierDto[]) => {
        this.suppliers = data;
        const supplierMap = new Map(data.map(s => [s.id, s.name]));
        this.activeSuppliers = data.filter(s => !s.isDeleted);
        this.purchaseService.getAllPurchases().subscribe(purchases => {
          this.purchases = purchases.map(p => ({
            ...p,
            supplierName: supplierMap.get(p.supplierId) || 'Unknown'
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

    const requestData = {
      supplierId: parseInt(this.selectedSupplierId, 10),
      purchaseDate: new Date(this.purchaseDate).toISOString(),
      status: "pending",
      purchaseItems: this.newPurchaseData.purchase.products.map(
        (item: { product: Product; quantity: number }) => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          stockThreshold: item.product.stockThreshold,
          price: item.product.price
        })
      )
    };

    this.purchaseService.createPurchase({body: requestData}).subscribe({
      next: (purchase) => {
        const supplier = this.suppliers.find(s => s.id === purchase.supplierId);
        const enrichedPurchase = {
          ...purchase,
          supplierName: supplier?.name || 'Unknown'
        };

        this.purchases.unshift(enrichedPurchase);

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
            this.products.push(newProductItem);
          }
        });

        this.resetPurchaseForm();
        this.showSuccess();
        this.getAllPurchases();
        this.getAvailableProducts();
      },
      error: (error) => {
        console.error("Error creating purchase:", error);
        this.showError("Error creating purchase!");
      }
    });
  }

  onProductSelect(): void {
    if (this.selectedProductId === 'new') {
      this.newProduct = {name: '', price: 0, stockQuantity: 1, stockThreshold: 1};
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

  addProductToPurchase(): void {
    if (!this.newProduct || !this.newProduct.name || this.newProduct.stockQuantity <= 0) {
      return;
    }

    const newName = this.newProduct.name.trim().toLowerCase();

    this.productService.getAllProducts().subscribe(products => {
      this.products = products;

      const isDuplicate = products.some(product =>
        product.name!.trim().toLowerCase() === newName
      );

      if (isDuplicate && this.selectedProductId === 'new') {
        this.toastr.warning('This product already exists in the system!');
        return;
      }
      // Add the product if it's not a duplicate
      this.newPurchaseData.purchase.products.push({
        product: {...this.newProduct},
        quantity: this.newProduct.stockQuantity
      });

      this.calculateTotalAmount();
      this.resetProductForm();
    });
  }


  private resetProductForm(): void {
    this.newProduct = {name: '', price: 0, stockQuantity: 1, stockThreshold: 1};
    setTimeout(() => {
      this.selectedProductId = '';
    }, 0);
  }

  removeProductFromPurchase(product: Product): void {
    const index = this.newPurchaseData.purchase.products.findIndex(
      (item: { product: Product }) => item.product.id === product.id
    );
    if (index !== -1) {
      this.newPurchaseData.purchase.products.splice(index, 1);
      this.calculateTotalAmount();
    }
  }

  calculateTotalAmount(): number {
    let total = 0;
    this.newPurchaseData.purchase.products.forEach((item: { product: Product; quantity: number }) => {
      total += (item.product.price || 0) * (item.quantity || 0);
    });
    this.newPurchaseData.purchase.totalAmount = total;
    return total;
  }

  resetPurchaseForm() {
    this.editingPurchase = null;
    this.selectedProductId = '';
    this.purchaseDate = '';
    this.selectedSupplierId = '';
    this.newPurchaseData = { purchase: { purchaseDate: '', totalAmount: 0, products: [] } };
    this.newProduct = { name: '', price: 0, stockQuantity: 1, stockThreshold: 1 };
  }
  showSuccess() {
    this.toastr.success('Purchase Created Successfully!');
  }

  showError(msg: string) {
    this.toastr.error(msg);
  }

  search(): void {
    if (this.searchType === 'invoice') {
      this.getPurchaseByInvoice(this.searchText);
    } else if (this.searchType === 'supplier') {
      this.getPurchaseBySupplier(this.searchText);
    } else if (this.searchType === 'product') {
      const search = this.searchText.toLowerCase().trim();

      this.purchaseService.getAllPurchases().subscribe({
        next: (purchases) => {
          this.filteredResults = purchases.filter(purchase =>
            purchase.purchaseItems.some(item => {
              const product = this.products.find(p => p.id === item.productId);
              return product && product.name?.toLowerCase().includes(search);
            })
          ).map(purchase => {
            const supplier = this.suppliers.find(s => s.id === purchase.supplierId);
            return {
              ...purchase,
              supplierName: supplier?.name || 'Unknown'
            };
          });

          if (this.filteredResults.length === 0) {
            this.showError("No purchase was found!");
            this.filteredResults = [];
          }
        },
        error: (err) => {
          console.error('Error fetching all purchases:', err);
          this.filteredResults = [];
        }
      });
    }
  }

  getPurchaseBySupplier(slug: string) {
    this.purchaseService.getPurchaseBySupplier({slug}).subscribe({
      next: (purchases) => {
        if (Array.isArray(purchases)) {
          this.filteredResults = purchases.map(p => {
            const supplier = this.suppliers.find(s => s.id === p.supplierId);
            return {
              ...p,
              supplierName: supplier?.name || 'Unknown'
            };
          });
        } else {
          const supplier = this.suppliers.find(s => s.id === purchases.supplierId);
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

  getPurchaseByInvoice(invoiceNumber: string) {
    this.purchaseService.getPurchaseByInvoiceNumber({invoiceNumber}).subscribe({
      next: (purchases) => {
        const supplier = this.suppliers.find(s => s.id === purchases.supplierId);
        this.filteredResults = [{
          ...purchases,
          supplierName: supplier?.name || 'Unknown'
        }];
      },
      error: (err) => {
        console.error('Error fetching purchase by invoice number', err);
      }
    });
  }

  deletePurchase(purchaseInvoice: string) {
    this.purchaseService.deletePurchase({invoice: purchaseInvoice}).subscribe({
      next: () => {
        this.purchases = this.purchases.filter(p => p.invoiceNumber !== purchaseInvoice);
        this.filteredResults = this.filteredResults.filter(p => p.invoiceNumber !== purchaseInvoice);
        this.toastr.success('Purchase deleted');
      },
      error: (err) => {
        console.error('Error deleting purchase', err);
        this.toastr.error('Failed to delete purchase');
      }
    });
  }
  editPurchase(purchase: PurchaseDto): void {
    console.log('Editing purchase:', purchase);
    this.editingPurchase = {};  // Initialize as an object, not an array

    this.purchaseService.getPurchaseByInvoiceNumber({ invoiceNumber: purchase.invoiceNumber! }).subscribe({
      next: (purchaseData) => {
        this.editingPurchase = purchaseData;
        console.log('Editing purchase:', this.editingPurchase);

        // Ensure purchaseItems exists
        if (!this.editingPurchase.purchaseItems) {
          console.error("No purchase items available for this purchase");
          return;
        }

        // Initialize the purchase data
        this.selectedSupplierId = purchase.supplierId?.toString() || '';
        this.purchaseDate = purchase.purchaseDate?.split('T')[0] || '';

        // Clear existing products in new purchase data
        this.newPurchaseData.purchase.products = [];

        // Add each purchase item to the form
        this.editingPurchase.purchaseItems.forEach((item: PurchaseItemDto) => {
          const product = this.products.find(p => p.id === item.productId);
            console.log(item)
          if (product) {
            const productQuantity = item.quantity || product.stockQuantity;  // Use existing product stock if quantity is not provided

            this.newPurchaseData.purchase.products.push({
              product: {
                id: product.id,
                name: product.name,
                price: item.price, // Use item price if available
                stockQuantity: productQuantity, // Ensure quantity is coming from item, or default to product stock
                stockThreshold: item.stockThreshold // Use product's actual threshold
              },
              quantity: productQuantity  // Use the same quantity logic here
            });
          }
        });


        this.calculateTotalAmount();
        console.log('Form data after edit:', this.newPurchaseData); // Debug log
      },
      error: (error) => {
        console.error('Error fetching purchase details:', error);
      }
    });
  }
  updatePurchase(): void {
    if (!this.editingPurchase.invoiceNumber) {
      this.showError("No purchase selected for update");
      return;
    }

    if (!this.selectedSupplierId || !this.purchaseDate || this.newPurchaseData.purchase.products.length === 0) {
      this.showError("Missing required fields: Supplier, Date, or Products");
      return;
    }

    const requestData = {
      supplierId: parseInt(this.selectedSupplierId, 10),
      purchaseDate: new Date(this.purchaseDate).toISOString(),
      status: "pending",
      purchaseItems: this.newPurchaseData.purchase.products.map(
        (item: { product: Product; quantity: number }) => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          stockThreshold: item.product.stockThreshold,
          price: item.product.price
        })
      )
    };

    // Call the service to update the purchase
    this.purchaseService.updatePurchase({
      invoiceNumber: this.editingPurchase.invoiceNumber,
      body: requestData
    }).subscribe({
      next: (updatedPurchase) => {
        const supplier = this.suppliers.find(s => s.id === updatedPurchase.supplierId);
        const enrichedPurchase = {
          ...updatedPurchase,
          supplierName: supplier?.name || 'Unknown'
        };

        // Only update the purchase being edited
        this.purchases = this.purchases.map(p =>
          p.invoiceNumber === updatedPurchase.invoiceNumber ? enrichedPurchase : p
        );

        // Update filtered results if needed
        if (this.filteredResults.length > 0) {
          this.filteredResults = this.filteredResults.map(p =>
            p.invoiceNumber === updatedPurchase.invoiceNumber ? enrichedPurchase : p
          );
        }

        // Reset the form after successful update
        this.resetPurchaseForm();
        this.showSuccess();
        this.editingPurchase = null; // Close the editing form
      },
      error: (error) => {
        console.log("Error updating purchase:", error);
        this.showError("Error updating purchase!");
      }
    });
  }

}
