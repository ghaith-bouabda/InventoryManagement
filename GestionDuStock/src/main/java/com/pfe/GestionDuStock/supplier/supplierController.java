package com.pfe.GestionDuStock.supplier;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/fournisseurs")
@RequiredArgsConstructor
public class supplierController {

    private final supplierService supplierService;

    // Create a supplier
    @PostMapping
    public ResponseEntity<supplierDTO> createFournisseur(@Valid @RequestBody supplierDTO supplierDTO) {
        supplierDTO createdSupplier = supplierService.createSupplier(supplierDTO);
        return new ResponseEntity<>(createdSupplier, HttpStatus.CREATED);
    }

    // Get supplier by slug
    @GetMapping("/{slug}")
    public ResponseEntity<supplierDTO> getFournisseur(@PathVariable String slug) {
        supplierDTO foundSupplier = supplierService.getSupplierBySlug(slug);
        return new ResponseEntity<>(foundSupplier, HttpStatus.OK);
    }

    // Get all suppliers
    @GetMapping("/")
    public ResponseEntity<List<supplierDTO>> getAllFournisseurs() {
        List<supplierDTO> foundSuppliers = supplierService.getAllSuppliers();
        return new ResponseEntity<>(foundSuppliers, HttpStatus.OK);
    }

    // Update supplier by slug
    @PutMapping("/{slug}")
    public ResponseEntity<supplierDTO> updateFournisseur(@PathVariable String slug,
                                                         @Valid @RequestBody supplierDTO supplierDTO) {
        supplierDTO updatedSupplier = supplierService.updateSupplierBySlug(slug, supplierDTO);
        return new ResponseEntity<>(updatedSupplier, HttpStatus.OK);
    }

    // Soft delete a supplier by slug
    @DeleteMapping("/{slug}")
    public ResponseEntity<Void> deleteFournisseur(@PathVariable String slug) {
        supplierService.deleteSupplierBySlug(slug);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
