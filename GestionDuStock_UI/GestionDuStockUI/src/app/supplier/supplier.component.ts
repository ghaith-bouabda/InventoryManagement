import { Component, OnInit } from '@angular/core';
import { SupplierControllerService } from '../services/services/supplier-controller.service';
import { SupplierDto } from '../services/models/supplier-dto';
import {AuthControllerService} from '../services/services/auth-controller.service';

@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.scss']
})
export class SupplierComponent implements OnInit {
  suppliers: SupplierDto[] = [];
  filteredSuppliers: SupplierDto[] = [];
  selectedSupplier: SupplierDto | null = null;
  isEditing = false;
  isAdding = false;
  newSupplier: SupplierDto = {} as SupplierDto;
  errorMessage = '';

  isAdmin: any ;

  constructor(private supplierService: SupplierControllerService,    private authService : AuthControllerService
  ) {
  }

  ngOnInit(): void {
    this.authService.isAdmin$.subscribe(status => {
      this.isAdmin = status;
    });

  this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.supplierService.getAllSuppliers().subscribe({
      next: (data: SupplierDto[]) => {
        this.suppliers = data;
        this.filteredSuppliers = this.suppliers.filter(supplier => !supplier.isDeleted);
      },
      error: (error) => this.handleError('Failed to load suppliers.', error),
    });
  }

  selectSupplier(supplier: SupplierDto): void {
    this.selectedSupplier = this.selectedSupplier === supplier ? null : supplier;
    this.isEditing = false;
    this.isAdding = false;

  }

  startAddingSupplier(): void {
    this.isAdding = true;
    this.newSupplier = {} as SupplierDto;

    this.selectedSupplier =  null ;

  }

  cancelAdding(): void {
    this.isAdding = false;
  }

  addSupplier(): void {

    this.supplierService.createSupplier({ body: this.newSupplier }).subscribe({
      next: (newSupplier) => {
        this.suppliers.push(newSupplier);
        this.updateFilteredSuppliers();
        this.isAdding = false;
      },
      error: (error) => this.handleError('Failed to create supplier.', error),
    });
  }

  editSupplier(): void {
    if (this.selectedSupplier) {
      this.isEditing = true;
      this.isAdding = false;

    }
  }

  updateSupplier(): void {
    if (this.selectedSupplier) {
      this.supplierService.updateSupplier({
        slug: this.selectedSupplier.slug!,
        body: this.selectedSupplier
      }).subscribe({
        next: () => {
          this.isEditing = false;
          this.loadSuppliers(); // Reload and filter again
        },
        error: (error) => this.handleError('Failed to update supplier.', error),
      });
    }
  }

  deleteSupplier(): void {
    if (this.selectedSupplier) {
      this.supplierService.deleteSupplier({ slug: this.selectedSupplier.slug! }).subscribe({
        next: () => {
          this.suppliers = this.suppliers.filter(s => s.slug !== this.selectedSupplier!.slug);
          this.updateFilteredSuppliers();
          this.selectedSupplier = null;
        },
        error: (error) => this.handleError('Failed to delete supplier.', error),
      });
    }
  }

  private updateFilteredSuppliers(): void {
    this.filteredSuppliers = this.suppliers.filter(supplier => !supplier.isDeleted);
  }

  private handleError(message: string, error: any): void {
    this.errorMessage = message;
    console.error(error);
  }
}
