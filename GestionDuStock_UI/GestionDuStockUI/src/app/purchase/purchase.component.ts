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
      this.toastr.warning("Please fill all required fields: Supplier, Date, and Products");
      return;
    }

    // Validate all products have required fields
    const invalidProducts = this.newPurchaseData.purchase.products.filter(
      (item: { product: Product; quantity: number }) =>
        !item.product.id || !item.quantity || item.quantity <= 0
    );

    if (invalidProducts.length > 0) {
      this.toastr.warning("Some products are missing required information");
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
        // ... rest of the success handling
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
      console.error('Invalid product details');
      return;
    }

    if (!this.selectedSupplierId) {
      this.toastr.warning('Please select a supplier first');
      return;
    }

    const newName = this.newProduct.name.trim().toLowerCase();
    const supplierId = parseInt(this.selectedSupplierId, 10);

    this.productService.getAllProducts().subscribe(products => {
      this.products = products;

      // Look for an active product first
      let existing = products.find(p =>
        p.name && p.name.trim().toLowerCase() === newName &&
        p.supplier?.id === supplierId &&
        !p.isDeleted
      );

      if (existing) {
        this.addProductToPurchaseList(existing);
        return;
      }

      // Check for deleted product
      let deleted = products.find(p =>
        p.name && p.name.trim().toLowerCase() === newName &&
        p.supplier?.id === supplierId &&
        p.isDeleted
      );

      if (deleted) {
        const updateDto: ProductDto = {
          ...deleted,
          price: this.newProduct.price,
          stockQuantity: this.newProduct.stockQuantity,
          stockThreshold: this.newProduct.stockThreshold,
          isDeleted: false,
          supplier: { id: supplierId }
        };

        this.productService.updateProduct(updateDto.id!, { product: updateDto }).subscribe({
          next: (prod) => {
            this.products = this.products.map(p => p.id === prod.id ? prod : p);
            this.addProductToPurchaseList(prod);
          },
          error: (err) => {
            console.error('Error reactivating product:', err);
            this.toastr.error(`Failed to reactivate ${deleted?.name}`);
          }
        });
        return;
      }

      // Create new product
      const newProductDto: ProductDto = {
        name: this.newProduct.name,
        price: this.newProduct.price,
        stockQuantity: this.newProduct.stockQuantity,
        stockThreshold: this.newProduct.stockThreshold,
        isDeleted: false,
        supplier: { id: supplierId }
      };

      this.productService.createProduct({ body: newProductDto }).subscribe({
        next: (createdProduct) => {
          this.products.push(createdProduct);
          this.addProductToPurchaseList(createdProduct);
        },
        error: (err) => {
          console.error('Error creating new product:', err);
          this.toastr.error('Error creating new product');
        }
      });
    });
  }



  private addProductToPurchaseList(product: Product): void {
    // Ensure product has all required fields
    if (!product.id || !product.name || !product.stockQuantity) {
      console.error('Product is missing required fields');
      this.toastr.warning('Product information is incomplete');
      return;
    }

    this.newPurchaseData.purchase.products.push({
      product: {
        id: product.id,
        name: product.name,
        price: product.price || 0,
        stockQuantity: product.stockQuantity,
        stockThreshold: product.stockThreshold || 1
      },
      quantity: product.stockQuantity
    });

    this.calculateTotalAmount();
    this.resetProductForm();
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
      const price = item.product.price || 0;
      const quantity = item.quantity || 0;
      total += price * quantity;
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
    // First try to find existing product (including deleted)
    const existingProduct = this.products.find(p =>
      p.name?.toLowerCase() === row.productName.toLowerCase() &&
      p.supplier?.id === supplier.id
    );

    if (existingProduct) {
      // Ensure quantity is properly parsed from CSV
      const quantity = parseInt(row.quantity, 10) || 1;

      // Update existing product (reactivate if deleted)
      const updateData: ProductDto = {
        id: existingProduct.id,
        name: row.productName,
        price: parseFloat(row.productPrice) || 0,
        stockQuantity: quantity, // Use the parsed quantity
        stockThreshold: parseInt(row.stockThreshold, 10) || 1,
        isDeleted: false,
        supplier: supplier
      };

      this.productService.updateProduct(existingProduct.id!, {product: updateData}).subscribe({
        next: (updatedProduct) => {
          const purchaseData = {
            purchaseDate: new Date(row.purchaseDate).toISOString(),
            totalAmount: parseFloat(row.totalAmount) || (parseFloat(row.productPrice) * quantity),
            supplierId: supplier.id!,
            purchaseItems: [{
              productId: updatedProduct.id!,
              quantity: quantity, // Use the same quantity here
              price: parseFloat(row.productPrice) || 0,
              stockThreshold: updatedProduct.stockThreshold || 1,
              name: updatedProduct.name
            }]
          };

          this.createPurchaseFromCSV(purchaseData, supplier, updatedProduct);
          // Update local products list
          this.products = this.products.map(p =>
            p.id === updatedProduct.id ? updatedProduct : p
          );
        },
        error: (err) => {
          console.error('Error updating product:', err);
          this.toastr.error(`Error updating product ${row.productName}`);
        }
      });
    } else {
      // Create new product
      const quantity = parseInt(row.quantity, 10) || 1;
      const newProduct: ProductDto = {
        name: row.productName,
        price: parseFloat(row.productPrice) || 0,
        stockQuantity: quantity,
        stockThreshold: parseInt(row.stockThreshold, 10) || 1,
        isDeleted: false,
        supplier: supplier
      };

      this.productService.createProduct({ body: newProduct }).subscribe({
        next: (createdProduct) => {
          const purchaseData = {
            purchaseDate: new Date(row.purchaseDate).toISOString(),
            totalAmount: parseFloat(row.totalAmount) || (createdProduct.price * quantity),
            supplierId: supplier.id!,
            purchaseItems: [{
              productId: createdProduct.id!,
              quantity: quantity,
              price: createdProduct.price,
              stockThreshold: createdProduct.stockThreshold || 1,
              name: createdProduct.name
            }]
          };

          this.createPurchaseFromCSV(purchaseData, supplier, createdProduct);
          this.products.push(createdProduct); // Add to local product list
        },
        error: (err) => {
          console.error('Error creating product:', err);
          this.toastr.error(`Error creating product ${row.productName}`);
        }
      });
    }
  }

  private createPurchaseFromCSV(purchaseData: any, supplier: SupplierDto, product: ProductDto): void {
    this.purchaseService.createPurchase({ body: purchaseData }).subscribe({
      next: (createdPurchase) => {
        const enrichedPurchase = {
          ...createdPurchase,
          supplierName: supplier.name
        };

        this.purchases.push(enrichedPurchase);
        this.toastr.success(`Purchase for ${product.name} from ${supplier.name} created successfully!`);
      },
      error: (err) => {
        console.error('Error creating purchase from CSV:', err);
        this.toastr.error(`Failed to create purchase for ${product.name}`);
      }
    });
  }

}

