package com.pfe.GestionDuStock.purchase;

import com.pfe.GestionDuStock.supplier.supplier;
import com.pfe.GestionDuStock.supplier.supplierDTO;
import com.pfe.GestionDuStock.supplier.supplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/purchases")
@RequiredArgsConstructor
public class purchaseController {

    private final purchaseService purchaseService;
    private final supplierService supplierService;

    // Create a new purchase
    @PostMapping
    public ResponseEntity<purchaseDTO> createPurchase(@RequestBody purchaseDTO purchaseDTO) {
        purchaseDTO savedPurchase = purchaseService.savePurchase(purchaseDTO);
        return new ResponseEntity<>(savedPurchase, HttpStatus.CREATED);
    }

    // Get all purchases
    @GetMapping
    public ResponseEntity<List<purchaseDTO>> getAllPurchases() {
        List<purchaseDTO> purchases = purchaseService.getAllPurchases();
        return new ResponseEntity<>(purchases, HttpStatus.OK);
    }

    // Get a purchase by supplier slug
    @GetMapping("/{slug}")
    public ResponseEntity<purchaseDTO> getPurchaseBySupplier(@PathVariable String slug) {
        Optional<purchaseDTO> purchase = purchaseService.getPurchaseBySupplierSlug(slug);
        return purchase.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // Get a purchase by invoice number
    @GetMapping("/invoice/{invoiceNumber}")
    public ResponseEntity<purchaseDTO> getPurchaseByInvoiceNumber(@PathVariable String invoiceNumber) {
        Optional<purchaseDTO> purchase = purchaseService.getPurchaseByInvoiceNumber(invoiceNumber);
        return purchase.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePurchase(@PathVariable Long id) {
        purchaseService.deletePurchase(id);
        return ResponseEntity.noContent().build();
    }
}
