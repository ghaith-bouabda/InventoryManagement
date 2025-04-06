import { Component, OnInit } from '@angular/core';
import { CustomerControllerService } from '../services/services/customer-controller.service';
import { Customer } from '../services/models/customer';
import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss'
})
export class CustomersComponent  implements OnInit {


  customers: Customer[] = [];
  selectedCustomer: Customer | null = null;
  isEditing: boolean = false;
  isAdding: boolean = false;
  newCustomer: Customer = {}; // Object to bind form data
  errorMessage: string = '';

  constructor(private customerService: CustomerControllerService) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.customerService.getAllCustomers().subscribe({
      next: (data: Customer[]) => {
        this.customers = data;
        this.errorMessage='';
      },
      error: (error) => {
        this.errorMessage = 'Failed to load customers.';
        console.error(error);
      }
    });
  }

  selectCustomer(customer: Customer): void {
    if(this.selectedCustomer == null || this.selectedCustomer != customer)
      this.selectedCustomer = customer;
    else
      this.selectedCustomer=null;
    this.isEditing = false;
  }

  startAddingCustomer(): void {
    this.isAdding = true;
    this.newCustomer = {}; // Reset the form data
  }

  cancelAdding(): void {
    this.isAdding = false;
  }

  addCustomer(): void {
    this.customerService.saveCustomer({ body: this.newCustomer }).subscribe({
      next: (newCustomer) => {
        this.customers.push(newCustomer);
        this.isAdding = false;
        this.loadCustomers();
      },
      error: (error) => {
        this.errorMessage = 'Failed to create customer.';
        console.error(error);
      }
    });
  }

  editCustomer(): void {
    if (this.selectedCustomer) {
      this.isEditing = true;

    }
  }
  UpdateCustomer(): void {
    if (this.selectedCustomer) {
      this.customerService.updateCustomer({body: this.selectedCustomer}).subscribe({
        next: (newCustomer) => {
          console.log(newCustomer, "jawa bhy");
          console.log(this.selectedCustomer)
        }
      })
    }
  }



  deleteCustomer(): void {
    if (this.selectedCustomer) {
      this.customerService.deleteCustomer({ id: this.selectedCustomer.id! }).subscribe({
        next: () => {
          console.log('Customer deleted successfully');
          this.customers = this.customers.filter(c => c.id !== this.selectedCustomer!.id);
          this.selectedCustomer = null;
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete customer.';
          console.error(error);
        }
      });
    }
  }
}


