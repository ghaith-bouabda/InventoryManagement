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
import { Papa } from 'ngx-papaparse'; // <-- Import PapaParse

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
    private toastr: ToastrService,
    private papa: Papa
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
      this.products = products.filter(s => s.isDeleted == false);
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
        product.name!.trim().toLowerCase() === newName && !product.isDeleted
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
    this.newPurchaseData = {purchase: {purchaseDate: '', totalAmount: 0, products: []}};
    this.newProduct = {name: '', price: 0, stockQuantity: 1, stockThreshold: 1};
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
              return product && product.name?.toLowerCase() === (search);
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

    this.purchaseService.getPurchaseByInvoiceNumber({invoiceNumber: purchase.invoiceNumber!}).subscribe({
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

  onFileChange(event: any): void {
    const file = event.target.files[0];  // Get the file from the input
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const csvData = e.target.result;  // CSV content
        this.parseCSV(csvData);  // Parse CSV
      };
      reader.readAsText(file);
    }
  }

  // Parse CSV using PapaParse
  parseCSV(csvData: string): void {
    this.papa.parse(csvData, {
      header: true,  // Set header to true to use the first row as column headers
      skipEmptyLines: true,  // Skip empty lines
      complete: (result) => {
        console.log('CSV Parsed Result:', result);  // This will give you the parsed data
        this.handleParsedCSV(result.data);  // Handle parsed CSV data
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        this.toastr.error('Error parsing CSV file.');
      }
    });
  }
  handleParsedCSV(data: any[]): void {
    data.forEach((row) => {
      // Find or create supplier
      let supplier = this.suppliers.find((s) => s.name === row.supplierName);

      if (!supplier) {
        // Create new supplier if not found
        const newSupplier: SupplierDto = {
          name: row.supplierName,
          email: row.supplierEmail || '',
          isDeleted: false
        };

        this.supplierService.createFournisseur({body: newSupplier}).subscribe({
          next: (createdSupplier) => {
            supplier = createdSupplier;
            this.suppliers.push(createdSupplier);
            this.processProductAndPurchase(row, supplier!);
          },
          error: (err) => {
            console.error('Error creating supplier:', err);
            this.toastr.error(`Error creating supplier ${row.supplierName}`);
          }
        });
        return; // Exit this iteration, will continue after supplier is created
      }

      this.processProductAndPurchase(row, supplier);
    });
  }

  private processProductAndPurchase(row: any, supplier: SupplierDto): void {
    // Find product by name
    const existingProduct = this.products.find(p => p.name?.toLowerCase() === row.productName.toLowerCase());

    if (existingProduct) {

      this.createPurchaseFromCSV(row, supplier, existingProduct);
    } else {
      // Product doesn't exist, create new product
      const newProduct: ProductDto = {
        name: row.productName,
        price: parseFloat(row.productPrice) || 0,
        stockQuantity: parseInt(row.quantity, 10) || 1,
        stockThreshold: parseInt(row.stockThreshold, 10) || 1,
        isDeleted: false,
        supplier:supplier
      };

      this.productService.createProduct({body: newProduct}).subscribe({
        next: (createdProduct) => {
          this.products.push(createdProduct);
          this.createPurchaseFromCSV(row, supplier, createdProduct);
        },
        error: (err) => {
          console.error('Error creating product:', err);
          this.toastr.error(`Error creating product ${row.productName}`);
        }
      });
    }
  }

  private createPurchaseFromCSV(row: any, supplier: SupplierDto, product: ProductDto): void {
    const purchaseData = {
      purchaseDate: new Date(row.purchaseDate).toISOString(),
      totalAmount: parseFloat(row.totalAmount) || (parseFloat(row.productPrice) * parseInt(row.quantity, 10)),
      supplierId: supplier.id!,
      purchaseItems: [{
        productId: product.id!,
        quantity: parseInt(row.quantity, 10) || 1,
        price: parseFloat(row.productPrice) || 0,
        stockThreshold: product.stockThreshold || 1,
        name: product.name
      }]
    };

    this.purchaseService.createPurchase({ body: purchaseData }).subscribe({
      next: (purchase) => {
        const enrichedPurchase = {
          ...purchase,
          supplierName: supplier.name
        };
        this.purchases.unshift(enrichedPurchase);
        this.toastr.success(`Purchase for ${product.name} imported successfully!`);
      },
      error: (err) => {
        console.error('Error importing purchase:', err);
      }
    });
  }

}

