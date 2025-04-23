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
import { Papa } from 'ngx-papaparse';
import {AuthControllerService} from '../services/services/auth-controller.service'; // <-- Import PapaParse

@Component({
  selector: 'app-purchase',
  templateUrl: './purchase.component.html',
  styleUrls: ['./purchase.component.scss']
})
export class PurchaseComponent implements OnInit {
  purchases: PurchaseDto[] = [];
  products: ProductDto[] = [];
  productsforedit: ProductDto[] = [];

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
  isAdmin: any;
  editingPurchase: any = null;

  constructor(
    private purchaseService: PurchaseControllerService,
    private supplierService: SupplierControllerService,
    private productService: ProductControllerService,
    private toastr: ToastrService,
    private papa: Papa,
    private authService : AuthControllerService
  ) {
  }

  ngOnInit(): void {
    this.getAllPurchases();
    this.getAvailableProducts();
    this.getAllProducts()

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
    //
    this.authService.isAdmin$.subscribe(status => {
      this.isAdmin = status;
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
  getAllProducts(): void {
    this.productService.getAllProducts().subscribe(products => {
      this.productsforedit = products;
    });
  }

  createPurchase(): void {
    if (!this.selectedSupplierId || !this.purchaseDate || this.newPurchaseData.purchase.products.length === 0) {
      console.error("Missing required fields: Supplier, Date, or Products");
      this.toastr.warning("Please fill all required fields: Supplier, Date, and Products");
      return;
    }

    const invalidProducts = this.newPurchaseData.purchase.products.filter(
      (item: { product: Product; quantity: number }) =>
        !item.quantity || item.quantity <= 0
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
        this.showSuccess('Purchase Created Successfully!');

        this.resetPurchaseForm();

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
    if (!this.newProduct || !this.newProduct.name) {
      this.toastr.error('Invalid product details');
      return;
    }

    if (!this.selectedSupplierId) {
      this.toastr.warning('Please select a supplier first');
      return;
    }

    if (this.newProduct.stockQuantity <= 0) {
      this.toastr.error('Quantity must be greater than 0');
      return;
    }

    const productToAdd = { ...this.newProduct };

    // Check if the product already exists in the purchase list
    const existingItem = this.newPurchaseData.purchase.products.find(
      (item: { product: Product }) => item.product.id === productToAdd.id
    );

    if (existingItem) {
      // Merge quantities if product already exists
      existingItem.quantity += productToAdd.stockQuantity;
    } else {
      // Add product if it's not already in the list
      this.newPurchaseData.purchase.products.push({
        product: {
          id: productToAdd.id,
          name: productToAdd.name,
          price: productToAdd.price || 0,
          stockQuantity: productToAdd.stockQuantity,
          stockThreshold: productToAdd.stockThreshold || 1
        },
        quantity: productToAdd.stockQuantity
      });
    }

    this.calculateTotalAmount();
    this.resetProductForm();
  }



  private resetProductForm(): void {
    this.newProduct = {
      name: '',
      price: 0,
      stockQuantity: 1,

      stockThreshold: 1,
      id: undefined
    };
    this.newProduct.stockQuantity = 1;
    this.selectedProductId = '';
    setTimeout(() => {
      const productSelect = document.getElementById('productSelect') as HTMLSelectElement;
      if (productSelect) {
        productSelect.value = '';
      }
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

  showSuccess(msg:string) {
    this.toastr.success(msg);
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
      this.getAllPurchases();
      this.getAvailableProducts();
      this.getAllProducts()
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
              supplierName: supplier?.name || 'Unknown',
              purchaseItems: p.purchaseItems || [] // Ensure purchaseItems exists
            };
          });
        } else {
          const supplier = this.suppliers.find(s => s.id === purchases.supplierId);
          this.filteredResults = [{
            ...purchases,
            supplierName: supplier?.name || 'Unknown',
            purchaseItems: purchases.purchaseItems
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
    this.editingPurchase = { ...purchase };  // Create a copy of the purchase

    // Initialize the purchase data
    this.selectedSupplierId = this.editingPurchase.supplierId?.toString() || '';
    this.purchaseDate = this.editingPurchase.purchaseDate?.split('T')[0] || '';

    // Clear existing products in new purchase data
    this.newPurchaseData.purchase.products = [];

    // Add each purchase item to the form
    this.editingPurchase.purchaseItems.forEach((item: PurchaseItemDto) => {
      // Find the product in your local list
      const product = this.productsforedit.find(p => p.id === item.productId);

      // Use item data first, fall back to product data if available
      const productName = product?.name || 'Unknown Product';
      const productPrice = item.price || product?.price || 0;
      const productThreshold = item.stockThreshold || product?.stockThreshold || 1;

      this.newPurchaseData.purchase.products.push({
        product: {
          id: item.productId,
          name: productName,
          price: productPrice,
          stockThreshold: productThreshold
        },
        quantity: item.quantity || 1
      });
    });

    this.calculateTotalAmount();
    console.log('Form data after edit:', this.newPurchaseData);
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
        this.showSuccess("Updated Successfully!");
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
    const supplierMap: { [key: string]: SupplierDto } = {};
    const rowsBySupplier: { [key: string]: any[] } = {};

    // 1. Group rows by supplier name
    data.forEach((row) => {
      if (!rowsBySupplier[row.supplierName]) {
        rowsBySupplier[row.supplierName] = [];
      }
      rowsBySupplier[row.supplierName].push(row);
    });

    // 2. For each unique supplier, find or create it
    const supplierNames = Object.keys(rowsBySupplier);
    let processedSuppliers = 0;

    supplierNames.forEach((supplierName) => {
      let supplier = this.suppliers.find((s) => s.name === supplierName && !s.isDeleted);

      const onSupplierReady = (resolvedSupplier: SupplierDto) => {
        supplierMap[supplierName] = resolvedSupplier;
        this.suppliers.push(resolvedSupplier); // Optional: only if you want to cache locally

        // Process all rows for this supplier
        rowsBySupplier[supplierName].forEach((row) => {
          this.processProductAndPurchase(row, resolvedSupplier);
        });

        processedSuppliers++;
      };

      if (supplier) {
        onSupplierReady(supplier);
      } else {
        const newSupplier: SupplierDto = {
          name: supplierName,
          email: rowsBySupplier[supplierName][0].supplierEmail || '',
          isDeleted: false
        };

        this.supplierService.createFournisseur({ body: newSupplier }).subscribe({
          next: (createdSupplier) => {
            onSupplierReady(createdSupplier);
          },
          error: (err) => {
            console.error('Error creating supplier:', err);
            this.toastr.error(`Error creating supplier ${supplierName}`);
          }
        });
      }
    });
  }
  private processProductAndPurchase(row: any, supplier: SupplierDto): void {
    // First try to find existing product (including deleted)
    const existingProduct = this.products.find(p =>
      p.name?.toLowerCase() === row.productName.toLowerCase() &&
      p.supplier?.id === supplier.id
    );

    // Parse quantity from CSV (only once)
    const quantity = parseInt(row.quantity, 10) || 1;
    const price = parseFloat(row.productPrice) || 0;

    if (existingProduct) {
      // Update existing product (reactivate if deleted)
      const updateData: ProductDto = {
        id: existingProduct.id,
        name: row.productName,
        price: price,
        stockQuantity: existingProduct.stockQuantity, // Keep existing stock
        stockThreshold: parseInt(row.stockThreshold, 10) || 1,
        isDeleted: false,
        supplier: supplier
      };

      this.productService.updateProduct(existingProduct.id!, {product: updateData}).subscribe({
        next: (updatedProduct) => {
          const purchaseData = {
            purchaseDate: new Date(row.purchaseDate).toISOString(),
            totalAmount: parseFloat(row.totalAmount) || (price * quantity),
            supplierId: supplier.id!,
            purchaseItems: [{
              productId: updatedProduct.id!,
              quantity: quantity,
              price: price,
              stockThreshold: updatedProduct.stockThreshold || 1,
              name: updatedProduct.name
            }]
          };

          this.createPurchaseFromCSV(purchaseData, supplier, updatedProduct);
        },
        error: (err) => {
          console.error('Error updating product:', err);
          this.toastr.error(`Error updating product ${row.productName}`);
        }
      });
    } else {
      // Create new product with initial stock of 0 (it will be increased by the purchase)
      const newProduct: ProductDto = {
        name: row.productName,
        price: price,
        stockQuantity: 0, // Initialize with 0, purchase will add to it
        stockThreshold: parseInt(row.stockThreshold, 10) || 1,
        isDeleted: false,
        supplier: supplier
      };

      this.productService.createProduct({ body: newProduct }).subscribe({
        next: (createdProduct) => {
          const purchaseData = {
            purchaseDate: new Date(row.purchaseDate).toISOString(),
            totalAmount: parseFloat(row.totalAmount) || (price * quantity),
            supplierId: supplier.id!,
            purchaseItems: [{
              productId: createdProduct.id!,
              quantity: quantity,
              price: price,
              stockThreshold: createdProduct.stockThreshold || 1,
              name: createdProduct.name
            }]
          };

          this.createPurchaseFromCSV(purchaseData, supplier, createdProduct);
          this.products.push(createdProduct);
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
  }exportToCSV(): void {
    if (this.filteredResults.length === 0) {
      this.toastr.warning('No purchases available to export');
      return;
    }

    const headers = [
      "Product",
      "Supplier",
      "Quantity",
      "Cost Price",
      "Total",
      "Date",
    ];

    const csvRows = [
      headers.join(","),  // Add header row
      ...this.filteredResults.flatMap((purchase) => {
        return purchase.purchaseItems.map((item: { name: string; price: number; quantity: number }) => {

          // Log the product directly from purchaseItem
          const productName = item.name || 'Unknown Product';
          const productPrice = item.price || 0;
          const total = productPrice * item.quantity;

          // Log for debugging purposes
          console.log('Product Name:', productName); // Debugging log
          console.log('Product Price:', productPrice); // Debugging log

          const supplierName = purchase.supplierName || 'Unknown Supplier';
          const quantity = item.quantity || 0;
          const date = new Date(purchase.purchaseDate).toLocaleDateString();

          // Format the price and total values to two decimal places
          const formattedProductPrice = productPrice.toFixed(2);
          const formattedTotal = total.toFixed(2);

          // Return a row for the CSV
          return [
            productName,
            supplierName,
            quantity,
            formattedProductPrice,
            formattedTotal,
            date,
          ].join(",");
        });
      }),
    ];

    // Generate CSV content and trigger download
    const blob = new Blob([csvRows.join("\n")], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'purchases.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }


}

