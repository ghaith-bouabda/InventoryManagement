package com.pfe.GestionDuStock.supplier;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/Supplier")
@RequiredArgsConstructor
public class supplierController {

    private final supplierService supplierService;

    // Create a supplier
    @PostMapping
    public ResponseEntity<supplierDTO> createSupplier(@Valid @RequestBody supplierDTO supplierDTO) {
        supplierDTO createdSupplier = supplierService.createSupplier(supplierDTO);
        return new ResponseEntity<>(createdSupplier, HttpStatus.CREATED);
    }

    // Get supplier by slug
    @GetMapping("/{slug}")
    public ResponseEntity<supplierDTO> getSupplier(@PathVariable String slug) {
        supplierDTO foundSupplier = supplierService.getSupplierBySlug(slug);
        return new ResponseEntity<>(foundSupplier, HttpStatus.OK);
    }

    // Get all suppliers
    @GetMapping("/")
    public ResponseEntity<List<supplierDTO>> getAllSuppliers() {
        List<supplierDTO> foundSuppliers = supplierService.getAllSuppliers();
        return new ResponseEntity<>(foundSuppliers, HttpStatus.OK);
    }

    // Update supplier by slug
    @PutMapping("/{slug}")
    public ResponseEntity<supplierDTO> updateSupplier(@PathVariable String slug,
                                                         @Valid @RequestBody supplierDTO supplierDTO) {
        supplierDTO updatedSupplier = supplierService.updateSupplierBySlug(slug, supplierDTO);
        return new ResponseEntity<>(updatedSupplier, HttpStatus.OK);
    }

    // Soft delete a supplier by slug
    @DeleteMapping("/{slug}")
    public ResponseEntity<Void> deleteSupplier(@PathVariable String slug) {
        supplierService.deleteSupplierBySlug(slug);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
