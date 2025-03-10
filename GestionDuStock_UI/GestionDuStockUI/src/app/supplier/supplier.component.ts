import { Component, OnInit } from '@angular/core';
import { SupplierControllerService } from '../services/services/supplier-controller.service';
import { Supplier } from '../services/models/supplier';

import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.scss']
})
export class SupplierComponent implements OnInit {
  suppliers: Supplier[] = [];
  selectedSupplier: Supplier | null = null;
  isEditing: boolean = false;
  isAdding: boolean = false;
  newSupplier: Supplier = {}; // Object to bind form data
  errorMessage: string = '';

  constructor(private supplierService: SupplierControllerService) {}

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.supplierService.getFournisseur({ slug: '' }).subscribe({
      next: (data) => {
        this.suppliers = [data]; // Adjust if multiple suppliers are returned
      },
      error: (error) => {
        this.errorMessage = 'Failed to load suppliers.';
        console.error(error);
      }
    });
  }

  selectSupplier(supplier: Supplier): void {
    this.selectedSupplier = supplier;
    this.isEditing = false;
  }

  startAddingSupplier(): void {
    this.isAdding = true;
    this.newSupplier = {}; // Reset the form data
  }

  cancelAdding(): void {
    this.isAdding = false;
  }

  addSupplier(): void {
    this.supplierService.createFournisseur({ body: this.newSupplier }).subscribe({
      next: (newSupplier) => {
        this.suppliers.push(newSupplier);
        this.isAdding = false; // Hide the form after successful addition
      },
      error: (error) => {
        this.errorMessage = 'Failed to create supplier.';
        console.error(error);
      }
    });
  }

  editSupplier(): void {
    if (this.selectedSupplier) {
      this.isEditing = true;
    }
  }

  updateSupplier(): void {
    if (this.selectedSupplier) {
      this.supplierService.updateFournisseur({
        slug: this.selectedSupplier.slug!,
        body: this.selectedSupplier
      }).subscribe({
        next: () => {
          this.isEditing = false;
          this.loadSuppliers();
        },
        error: (error) => {
          this.errorMessage = 'Failed to update supplier.';
          console.error(error);
        }
      });
    }
  }

  deleteSupplier(): void {
    if (this.selectedSupplier) {
      this.supplierService.deleteFournisseur({ slug: this.selectedSupplier.slug! }).subscribe({
        next: () => {
          this.suppliers = this.suppliers.filter(s => s.slug !== this.selectedSupplier!.slug);
          this.selectedSupplier = null;
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete supplier.';
          console.error(error);
        }
      });
    }
  }
}
