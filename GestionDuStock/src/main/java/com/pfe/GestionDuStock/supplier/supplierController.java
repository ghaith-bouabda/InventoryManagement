package com.pfe.GestionDuStock.supplier;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/fournisseurs")
@RequiredArgsConstructor
public class supplierController {

    private final supplierService supplierService;

    @PostMapping
    public ResponseEntity<supplier> createFournisseur(@Valid @RequestBody supplier supplier) {
        supplier createdSupplier = supplierService.createFournisseur(supplier);
        return new ResponseEntity<>(createdSupplier, HttpStatus.CREATED);
    }

    @GetMapping("/{slug}")
    public ResponseEntity<supplier> getFournisseur(@PathVariable String slug) {
        supplier foundSupplier = supplierService.getFournisseurBySlug(slug);
        return new ResponseEntity<>(foundSupplier, HttpStatus.OK);
    }

    @PutMapping("/{slug}")
    public ResponseEntity<supplier> updateFournisseur(@PathVariable String slug,
                                                      @Valid @RequestBody supplier supplierDetails) {
        supplier updatedSupplier = supplierService.updateFournisseurBySlug(slug, supplierDetails);
        return new ResponseEntity<>(updatedSupplier, HttpStatus.OK);
    }

    @DeleteMapping("/{slug}")
    public ResponseEntity<Void> deleteFournisseur(@PathVariable String slug) {
        supplierService.deleteFournisseurBySlug(slug);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
