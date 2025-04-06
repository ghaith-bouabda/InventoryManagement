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
  newSupplier: Supplier = {};
  errorMessage: string = '';

  constructor(private supplierService: SupplierControllerService) {}
  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.supplierService.getAllFournisseurs().subscribe({
      next: (data:Supplier[]) => {
        this.suppliers = data;
        this.suppliers = data.filter(supplier => !supplier.deleted);
        },
      error: (error) => {
        this.errorMessage = 'Failed to load suppliers.';
        console.error(error);
      }
    });
  }

  selectSupplier(supplier: Supplier): void {
    if(this.selectedSupplier ==null || this.selectedSupplier != supplier ) {
        this.selectedSupplier= supplier;}
    else
      this.selectedSupplier=null;
    this.isEditing = false;
  }

  startAddingSupplier(): void {
    this.isAdding = true;
    this.newSupplier = {};
  }

  cancelAdding(): void {
    this.isAdding = false;
  }

  addSupplier(): void {
    this.supplierService.createFournisseur({ body: this.newSupplier }).subscribe({
      next: (newSupplier) => {
        this.suppliers.push(newSupplier);
        this.isAdding = false;
        this.loadSuppliers();
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
          console.log('Supplier deleted successfully');
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
