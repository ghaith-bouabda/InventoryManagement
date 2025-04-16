import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerControllerService } from '../services/services/customer-controller.service';
import { Customer } from '../services/models/customer';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  selectedCustomer: Customer | null = null;

  customerForm!: FormGroup;
  editForm!: FormGroup;

  isAdding: boolean = false;
  isEditing: boolean = false;

  errorMessage: string = '';

  constructor(
    private customerService: CustomerControllerService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
    this.initForms();
  }

  initForms() {
    this.customerForm = this.fb.group({
      customerName: ['', Validators.required],
      address: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{8,15}$')]]
    });

    this.editForm = this.fb.group({
      customerName: ['', Validators.required],
      address: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{8,15}$')]]
    });
  }

  loadCustomers(): void {
    this.customerService.getAllCustomers().subscribe({
      next: (data: Customer[]) => {
        this.customers = data;
        this.errorMessage = '';
      },
      error: () => {
        this.errorMessage = 'Failed to load customers.';
      }
    });
  }

  startAddingCustomer(): void {
    this.isAdding = true;
    this.customerForm.reset();
  }

  cancelAdding(): void {
    this.isAdding = false;
  }

  addCustomer(): void {
    if (this.customerForm.invalid) return;

    this.customerService.saveCustomer({ body: this.customerForm.value }).subscribe({
      next: () => {
        this.isAdding = false;
        this.loadCustomers();
      },
      error: () => {
        this.errorMessage = 'Failed to create customer.';
      }
    });
  }

  selectCustomer(customer: Customer): void {
    this.selectedCustomer = this.selectedCustomer === customer ? null : customer;
    this.isEditing = false;

    if (this.selectedCustomer) {
      this.editForm.patchValue(this.selectedCustomer);
    }
  }

  editCustomer(): void {
    this.isEditing = true;
  }

  updateCustomer(): void {
    if (this.editForm.invalid || !this.selectedCustomer) return;

    const updated = { ...this.selectedCustomer, ...this.editForm.value };

    this.customerService.updateCustomer({ body: updated }).subscribe({
      next: () => {
        this.loadCustomers();
        this.isEditing = false;
        this.selectedCustomer = null;
      },
      error: () => {
        this.errorMessage = 'Failed to update customer.';
      }
    });
  }

  deleteCustomer(): void {
    if (!this.selectedCustomer?.id) return;

    this.customerService.deleteCustomer({ id: this.selectedCustomer.id }).subscribe({
      next: () => {
        this.customers = this.customers.filter(c => c.id !== this.selectedCustomer?.id);
        this.selectedCustomer = null;
      },
      error: () => {
        this.errorMessage = 'Failed to delete customer.';
      }
    });
  }
}
