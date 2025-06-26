import { Component, OnInit } from '@angular/core';
import { SaleControllerService } from '../services/services/sale-controller.service';
import { ProductControllerService } from '../services/services/product-controller.service';
import { CustomerControllerService } from '../services/services/customer-controller.service';
import { SaleDto } from '../services/models/sale-dto';
import { Customer } from '../services/models/customer';
import { ProductDto } from '../services/models/product-dto';
import { ToastrService } from 'ngx-toastr';
import { CustomerDto } from '../services/models/customer-dto';
import { SaleitemDto } from '../services/models/saleitem-dto';
import { Papa } from 'ngx-papaparse';
import {GetProductById$Params} from '../services/fn/product-controller/get-product-by-id';

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
  salesLoaded: boolean = false;

  constructor(
    private saleService: SaleControllerService,
    private productService: ProductControllerService,
    private customerService: CustomerControllerService,
    private toastr: ToastrService,
    private papa: Papa
  ) {}

  ngOnInit(): void {
    this.getAvailableProducts();
    this.loadCustomers();
    this.getAllSales();

  }

  showSuccess(message: string = 'Operation successful!') {
    this.toastr.success(message);
  }

  showError(message: string) {
    this.toastr.error(message);
  }

  getAvailableProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => (this.products = products.filter(p => !p.isDeleted)),
      error: (err) => console.error("Error fetching products:", err)
    });
  }

  loadCustomers(): void {
    this.customerService.getAllCustomers().subscribe({
      next: (customers) => (this.customers = customers),
      error: (err) => console.error("Error fetching customers:", err)
    });
  }

  getAllSales(): void {
    this.saleService.getAllSales().subscribe({
      next: (sales) => {
        this.sales = sales;
        this.salesLoaded = true;
        this.filteredResults = [];
      },
      error: (err) => console.error("Error fetching sales:", err)
    });
  }


  enrichSalesWithCustomerNames(sales: SaleDto[]): SaleDto[] {
    return sales.map(sale => this.enrichSaleWithCustomerName(sale));
  }

  enrichSaleWithCustomerName(sale: SaleDto): any {
    const customer = this.customers.find(c => c.id === sale.customer?.id);
    const calculatedAmount = sale.saleItems?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0;

    return {
      ...sale,
      customerName: customer?.customerName || 'Unknown',
      amount: Math.round(calculatedAmount * 100) / 100
    };
  }



  search(): void {
    if (!this.salesLoaded) {
      this.getAllSales();
      return;
    }

    const searchTerm = this.searchText.toLowerCase().trim();
    if (!searchTerm) {
      this.filteredResults = [];
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

    // Get the current product price from the products array to ensure consistency
    const currentProduct = this.products.find(p => p.id === this.newProduct.id);
    const productPrice = currentProduct ? currentProduct.price : this.newProduct.price;

    const existingItem = this.newSaleData.saleItems.find(item => item.productId === this.newProduct.id);
    if (existingItem) {
      existingItem.quantity += this.newProduct.stockQuantity;
      existingItem.price = productPrice; // Update price to current price
    } else {
      this.newSaleData.saleItems.push({
        productId: this.newProduct.id!,
        quantity: this.newProduct.stockQuantity,
        price: productPrice // Use current price
      });
    }

    this.newSaleData.amount = this.calculateTotalAmount();
    this.resetProductFields();
  }

  removeProductFromSale(productId: number): void {
    this.newSaleData.saleItems = this.newSaleData.saleItems.filter(item => item.productId !== productId);
    this.newSaleData.amount = this.calculateTotalAmount();
  }

  calculateTotalAmount(): number {
    const total = this.newSaleData.saleItems.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );
    // Round to 2 decimal places to avoid floating point issues
    return Math.round(total * 100) / 100;
  }

  createSale(): void {
    if (!this.selectedCustomerId || !this.saleDate || this.newSaleData.saleItems.length === 0) {
      this.showError("Missing required fields: Customer, Date, or Products");
      return;
    }
    console.log('Creating sale with items:', this.newSaleData.saleItems);
    console.log('Calculated amount before submission:', this.newSaleData.amount);
    // Recalculate amount right before submission
    this.newSaleData.amount = this.calculateTotalAmount();

    if (this.isEditMode && this.editSaleId) {
      this.updateSale();
    } else {
      const requestData = {
        customerId: parseInt(this.selectedCustomerId, 10),
        body: {
          saleDate: new Date(this.saleDate).toISOString(),
          amount: this.newSaleData.amount, // Use the recalculated amount
          invoiceNumber: "",
          saleItems: this.newSaleData.saleItems,
          status: "pending"
        }
      };

      this.saleService.createSale(requestData).subscribe({
        next: () => {
          this.showSuccess('Sale created successfully!');
          this.resetSaleForm();
          this.getAllSales();
        },
        error: () => this.showError("Error creating sale")
      });
    }
  }

  editsale(sale: SaleDto): void {
    this.isEditMode = true;
    this.editSaleId = sale.id || null;
    this.selectedCustomerId = sale.customer?.id?.toString() || '';
    this.saleDate = sale.saleDate;
    this.newSaleData = {
      ...sale,
      saleItems: sale.saleItems.map(item => ({
        ...item,
        price: this.products.find(p => p.id === item.productId)?.price || item.price
      }))
    };
    this.newSaleData.amount = this.calculateTotalAmount();
  }

  updateSale(): void {
    // Recalculate amount right before submission
    this.newSaleData.amount = this.calculateTotalAmount();

    const requestData = {
      saleId: this.editSaleId!,
      body: {
        ...this.newSaleData,
        saleDate: new Date(this.saleDate).toISOString(),
        amount: this.newSaleData.amount, // Use the recalculated amount
        saleItems: this.newSaleData.saleItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        }))
      }
    };

    this.saleService.updateSale(requestData).subscribe({
      next: () => {
        this.showSuccess('Sale updated successfully!');
        this.resetSaleForm();
      },
      error: (err) => {
        console.error('Update error:', err);
        this.showError("Error updating sale");
      }
    });
  }
  deleteSale(invoiceNumber: string): void {
    if (!confirm('Are you sure you want to delete this sale?')) return;

    this.saleService.deleteSale(invoiceNumber).subscribe({
      next: () => {
        this.showSuccess('Sale deleted successfully!');
        this.getAllSales();
      },
      error: (err) => {
        console.error('Error deleting sale:', err);
        this.showError("Error deleting sale");
      }
    });
  }

  resetSaleForm(): void {
    this.selectedCustomerId = '';
    this.saleDate = '';
    this.selectedProductId = '';
    this.newSaleData = { invoiceNumber: '', customer: undefined, saleDate: '', amount: 0, saleItems: [] };
    this.isEditMode = false;
    this.editSaleId = null;
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

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const csvData = e.target.result;
        this.parseCSV(csvData);
      };
      reader.readAsText(file);
    }
  }

  parseCSV(csvData: string): void {
    this.papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        this.handleParsedCSV(result.data);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        this.toastr.error('Error parsing CSV file.');
      }
    });
  }

  async handleParsedCSV(data: any[]): Promise<void> {
    try {
      // First validate all products and quantities
      const validationErrors = this.validateCSVData(data);
      if (validationErrors.length > 0) {
        validationErrors.forEach(error => this.toastr.error(error));
        return;
      }

      // Group by customer
      const rowsByCustomer: { [key: string]: any[] } = {};
      data.forEach(row => {
        if (!rowsByCustomer[row.customerName]) {
          rowsByCustomer[row.customerName] = [];
        }
        rowsByCustomer[row.customerName].push(row);
      });

      for (const customerName of Object.keys(rowsByCustomer)) {
        await this.processCustomerSales(customerName, rowsByCustomer[customerName]);
      }
      this.getAvailableProducts();
    } catch (error) {
      console.error('Error processing CSV:', error);
      this.toastr.error('Error processing CSV file');
    }
  }

  private validateCSVData(data: any[]): string[] {
    const errors: string[] = [];
    const productQuantities: {[productId: number]: number} = {};

    data.forEach(row => {
      const product = this.products.find(p =>
        p.name?.toLowerCase() === row.productName.toLowerCase()
      );

      if (!product) {
        errors.push(`Product not found: ${row.productName}`);
        return;
      }

      const quantity = parseFloat(row.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        errors.push(`Invalid quantity for ${row.productName}: ${row.quantity}`);
        return;
      }

      // Track total requested quantities per product
      productQuantities[product.id!] = (productQuantities[product.id!] || 0) + quantity;
    });

    // Check stock availability
    Object.keys(productQuantities).forEach(productId => {
      const pid = Number(productId);
      const product = this.products.find(p => p.id === pid);
      if (product && product.stockQuantity < productQuantities[pid]) {
        errors.push(`Insufficient stock for ${product.name}. Requested: ${productQuantities[pid]}, Available: ${product.stockQuantity}`);
      }
    });

    return errors;
  }

  private async processCustomerSales(customerName: string, rows: any[]): Promise<void> {
    try {
      // Find or create customer
      let customer = await this.findOrCreateCustomer(customerName, rows[0]);

      // Process each sale for this customer
      for (const row of rows) {
        await this.processSaleRow(row, customer);
      }

      this.toastr.success(`Successfully processed ${rows.length} sales for ${customerName}`);
    } catch (error) {
      console.error(`Error processing sales for ${customerName}:`, error);
      this.toastr.error(`Error processing sales for ${customerName}`);
    }
  }

  private async findOrCreateCustomer(customerName: string, sampleRow: any): Promise<Customer> {
    let customer = this.customers.find(c => c.customerName === customerName);

    if (!customer) {
      const newCustomer: CustomerDto = {
        customerName: customerName,
        email: sampleRow.customerEmail || '',
        phone: sampleRow.customerPhone || ''
      };

      customer = await this.customerService.saveCustomer({ body: newCustomer }).toPromise();
      this.customers.push(customer!);
    }

    return customer!;
  }

  private async processSaleRow(row: any, customer: Customer): Promise<void> {
    const product = this.products.find(p =>
      p.name?.toLowerCase() === row.productName.toLowerCase()
    );

    if (!product) {
      throw new Error(`Product not found: ${row.productName}`);
    }

    const quantity = parseFloat(row.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      throw new Error(`Invalid quantity: ${row.quantity}`);
    }

    // Create the sale
    const saleData = {
      saleDate: new Date(row.saleDate).toISOString(),
      amount: product.price * quantity,
      saleItems: [{
        productId: product.id!,
        quantity: quantity,
        price: product.price
      }]
    };

    const createdSale = await this.saleService.createSale({
      customerId: customer.id!,
      body: saleData
    }).toPromise();

    console.log('[SALE CREATED]', createdSale);

    // Update local product stock immediately
    const params: GetProductById$Params = { id: product.id! }; // Create proper params object
    const updatedProduct = await this.productService.getProductById(params).toPromise();

    if (updatedProduct) {
      // Update the product in our local array
      const index = this.products.findIndex(p => p.id === product.id);
      if (index !== -1) {
        this.products[index] = updatedProduct;
      }
    }
  }
  private processProductAndSale(row: any, customer: CustomerDto | Customer): void {
    const quantity = parseFloat(row.quantity);

    if (isNaN(quantity) || quantity <= 0) {
      this.toastr.error(`Invalid quantity (${row.quantity}) for product ${row.productName}`);
      return;
    }

    const existingProduct = this.products.find(p =>
      p.name?.toLowerCase() === row.productName.toLowerCase()
    );

    if (existingProduct) {
      this.createSaleFromCSV(row, customer, existingProduct);
    } else {
      this.toastr.error(`Error finding product ${row.productName}`);
    }
  }

  private createSaleFromCSV(row: any, customer: CustomerDto | Customer, product: ProductDto): void {
    const quantity = Math.round(parseFloat(row.quantity));


    if (isNaN(quantity) || quantity <= 0) {
      this.toastr.error(`Invalid quantity (${row.quantity}) for ${product.name}`);
      return;
    }

    const saleData = {
      saleDate: new Date(row.saleDate).toISOString(),
      amount: product.price * quantity,
      saleItems: [{
        productId: product.id!,
        quantity: quantity,
        price: product.price
      }]
    };

    this.saleService.createSale({
      customerId: customer.id!,
      body: saleData
    }).subscribe({
      next: (createdSale) => {

      },
      error: (err) => {
        console.error('Sale creation error:', err);
        this.toastr.error(`Failed to create sale for ${product.name}`);
      }
    });
  }
  exportToCSV(): void {
    if (this.filteredResults.length === 0) {
      this.toastr.warning('No sales available to export');
      return;
    }

    const headers = ["Product", "Customer", "Quantity", "Price", "Total", "Date"];
    const csvRows = [
      headers.join(","),
      ...this.filteredResults.flatMap((sale) => sale.saleItems.map(item => {
        const productName = this.getProductName(item.productId);
        const customerName = sale.customer?.customerName || 'Unknown Customer';
        const total = item.price * item.quantity;
        const date = new Date(sale.saleDate).toLocaleDateString();

        return [productName, customerName, item.quantity, item.price.toFixed(2), total.toFixed(2), date].join(",");
      }))
    ];

    const blob = new Blob([csvRows.join("\n")], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'sales.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
