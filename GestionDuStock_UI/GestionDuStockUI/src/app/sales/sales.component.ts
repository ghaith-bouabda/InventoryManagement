import { Component, OnInit } from '@angular/core';
import { SaleControllerService } from '../services/services/sale-controller.service';
import { ProductControllerService } from '../services/services/product-controller.service';
import { CustomerControllerService } from '../services/services/customer-controller.service';
import { SaleDto } from '../services/models/sale-dto';
import { Customer } from '../services/models/customer';
import { ProductDto } from '../services/models/product-dto';
import { ToastrService } from 'ngx-toastr';
import {CustomerDto} from '../services/models/customer-dto';
import {SaleitemDto} from '../services/models/saleitem-dto';


@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit {
  sales: SaleDto[] = [];
  filteredResults: SaleDto[] = [];

  products: ProductDto[] = [];
  customers: Customer[] = [];

  selectedCustomerId: string = '';
  saleDate: string = '';
  selectedProductId: string = '';
  newProduct: ProductDto = { id: 0, name: '', price: 0, stockQuantity: 1 };
  newSaleData: SaleDto = { invoiceNumber: '', customer: undefined, saleDate: '', amount: 0, saleItems: [] };

  searchType: string = 'customer';
  searchText: string = '';
  isEditMode: boolean = false;
  editSaleId: number | null = null;
  constructor(
    private saleService: SaleControllerService,
    private productService: ProductControllerService,
    private customerService: CustomerControllerService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.getAvailableProducts();
    this.loadCustomers();
    this.getAllSales();
  }

  showSuccess() {
    this.toastr.success('Sale Created Successfully!');
  }

  showError(msg: string) {
    this.toastr.error(msg);
  }

  getAvailableProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => (this.products = products),
      error: (err) => console.error("Error fetching products:", err)
    });
  }

  loadCustomers(): void {
    this.customerService.getAllCustomers().subscribe({
      next: (data) => (this.customers = data),
      error: (err) => console.error("Error fetching customers:", err)
    });
  }

  getAllSales(): void {
    this.saleService.getAllSales().subscribe({
      next: (sales) => {
        this.sales = sales;
      },
      error: (err) => console.error("Error fetching sales:", err)
    });
  }

  enrichSalesWithCustomerNames(sales: SaleDto[]): SaleDto[] {
    return sales.map(sale => this.enrichSaleWithCustomerName(sale));
  }

  enrichSaleWithCustomerName(sale: SaleDto): any {
    const customer = this.customers.find(c => c.id === sale.customer?.id);
    return {
      ...sale,
      customerName: customer?.customerName || 'Unknown'
    };
  }

  search(): void {
    const searchTerm = this.searchText.toLowerCase().trim();
    if (!searchTerm) {
      this.filteredResults = this.enrichSalesWithCustomerNames(this.sales);
      return;
    }

    let filtered: SaleDto[] = [];

    if (this.searchType === 'invoice') {
      filtered = this.sales.filter(sale => sale.invoiceNumber?.toLowerCase().includes(searchTerm));
    } else if (this.searchType === 'customer') {
      filtered = this.sales.filter(sale => {
        const customer = this.customers.find(c => c.id === sale.customer?.id);
        return customer?.customerName?.toLowerCase().includes(searchTerm);
      });
    } else if (this.searchType === 'product') {
      filtered = this.sales.filter(sale =>
        sale.saleItems?.some(item =>
          this.products.find(p => p.id === item.productId && p.name?.toLowerCase().includes(searchTerm))
        )
      );
    }

    this.filteredResults = this.enrichSalesWithCustomerNames(filtered);
    if (this.filteredResults.length === 0) {
      this.showError("No sales found matching your criteria");
    }
  }

  onProductSelect(): void {
    if (this.selectedProductId === 'new') {
      this.newProduct = { id: 0, name: '', price: 0, stockQuantity: 1 };
    } else {
      const product = this.products.find(p => p.id?.toString() === this.selectedProductId);
      if (product) {
        this.newProduct = { ...product, stockQuantity: 1 };
      }
    }
  }
  addProductToSale(): void {
    if (!this.newProduct.name || this.newProduct.price <= 0 || this.newProduct.stockQuantity < 1) {
      this.showError("Invalid product details");
      return;
    }

    const existingItem = this.newSaleData.saleItems.find(item => item.productId === this.newProduct.id);

    if (existingItem) {
      existingItem.quantity += this.newProduct.stockQuantity;
    } else {
      this.newSaleData.saleItems.push({
        productId: this.newProduct.id!,
        quantity: this.newProduct.stockQuantity,
        price: this.newProduct.price
      });
    }

    // Force immediate amount recalculation
    this.newSaleData.amount = this.calculateTotalAmount();
    console.log('Updated amount after adding product:', this.newSaleData.amount);

    this.resetProductFields();
  }

  removeProductFromSale(productId: number): void {
    this.newSaleData.saleItems = this.newSaleData.saleItems.filter(item => item.productId !== productId);
    this.calculateTotalAmount();
  }
  calculateTotalAmount(): number {
    return this.newSaleData.saleItems.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );
  }

  deleteSale(invoiceNumber: string): void {

  }
  createSale(): void {
    if (!this.selectedCustomerId || !this.saleDate || this.newSaleData.saleItems.length === 0) {
      this.showError("Missing required fields: Customer, Date, or Products");
      return;
    }

    const requestData = {
      customerId: parseInt(this.selectedCustomerId, 10),
      body: {
        saleDate: new Date(this.saleDate).toISOString(),
        amount: this.calculateTotalAmount(),
        invoiceNumber: "", // Let the backend generate it
        saleItems: this.newSaleData.saleItems,
        status: "pending"
      }
    };

    if (this.isEditMode && this.editSaleId !== null) {
      // For editing, pass the saleId and body of the sale
      const updateParams = {
        saleId: this.editSaleId,  // The ID of the sale being updated
        body: {                   // The body that contains the updated sale data
          saleDate: new Date(this.saleDate).toISOString(),
          amount: this.calculateTotalAmount(),
          invoiceNumber: this.newSaleData.invoiceNumber, // Keep the current invoice number
          saleItems: this.newSaleData.saleItems,
        }

      };

      this.saleService.updateSale(updateParams).subscribe({
        next: () => {
          this.showSuccess();
          this.resetSaleForm();
          this.getAllSales();
          this.isEditMode = false;
          this.editSaleId = null;

          },
        error: () => this.showError("Error updating sale")
      });
    } else {
      // For creating new sale
      this.saleService.createSale(requestData).subscribe({

        next: () => {
          this.showSuccess();
          this.resetSaleForm();
          this.getAllSales();
        },
        error: () => this.showError("Error creating sale")
      });
    }
  }

  editsale(sale: SaleDto): void {
    this.isEditMode = true;
    this.editSaleId = sale.id || null;  // Ensure editSaleId is correctly set
    this.selectedCustomerId = sale.customer?.id?.toString() || '';
    this.saleDate = sale.saleDate;

    // Update saleItems with the latest prices from the products list
    this.newSaleData = {
      ...sale,
      saleItems: sale.saleItems.map(item => {
        const product = this.products.find(p => p.id === item.productId);
        return {
          ...item,
          price: product?.price || item.price // Update price if product price is available
        };
      })
    };

    this.calculateTotalAmount();
  }
  // In your updateSale method (modified version)
  updateSale(): void {
    // Debug: Show state before calculation
    console.log('--- BEFORE CALCULATION ---');
    console.log('Sale Items:', JSON.parse(JSON.stringify(this.newSaleData.saleItems)));
    console.log('Current Amount:', this.newSaleData.amount);

    // Recalculate amount
    this.newSaleData.amount = this.calculateTotalAmount();

    // Debug: Show state after calculation
    console.log('--- AFTER CALCULATION ---');
    console.log('Calculated Amount:', this.newSaleData.amount);
    console.log('Sale Items:', JSON.parse(JSON.stringify(this.newSaleData.saleItems)));

    if (!this.editSaleId || !this.selectedCustomerId || !this.saleDate || this.newSaleData.saleItems.length === 0) {
      this.showError("Missing required fields");
      return;
    }

    const requestData = {
      saleId: this.editSaleId,
      body: {
        ...this.newSaleData,
        saleDate: new Date(this.saleDate).toISOString(),
        saleItems: this.newSaleData.saleItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        }))
      }
    };

    // Debug: Show final payload
    console.log('--- FINAL PAYLOAD ---');
    console.log('Request Data:', JSON.parse(JSON.stringify(requestData)));

    this.saleService.updateSale(requestData).subscribe({
      next: () => {
        this.toastr.success('Sale updated successfully!');
        this.resetSaleForm();
        this.getAllSales();
        this.isEditMode = false;
        this.editSaleId = null;
      },
      error: (err) => {
        console.error('Update error:', err);
        this.showError("Error updating sale");
      }
    });
  }


  resetSaleForm(): void {
    this.selectedCustomerId = '';
    this.saleDate = '';
    this.selectedProductId = '';
    if (!this.isEditMode) {
      this.newSaleData = { invoiceNumber: '', customer: undefined, saleDate: '', amount: 0, saleItems: [] };
    }
  }

  resetProductFields(): void {
    this.newProduct = { id: 0, name: '', price: 0, stockQuantity: 1 };
    this.selectedProductId = '';
  }

  getProductName(productId: number): string {
    return this.products.find(p => p.id === productId)?.name || 'Unknown';
  }

  filteredProducts(): ProductDto[] {
    return this.products;
  }
}
