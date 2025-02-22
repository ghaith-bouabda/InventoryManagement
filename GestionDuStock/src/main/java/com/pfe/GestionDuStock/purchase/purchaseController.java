package com.pfe.GestionDuStock.purchase;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/purchases")
@RequiredArgsConstructor  // Lombok generates the constructor automatically
public class purchaseController {

    private final purchaseService purchaseService;

    // Create or update a purchase
    @PostMapping
    public ResponseEntity<purchase> createPurchase(@RequestBody purchase purchase) {
        purchase savedPurchase = purchaseService.savePurchase(purchase);
        return new ResponseEntity<>(savedPurchase, HttpStatus.CREATED);
    }

    // Get all purchases
    @GetMapping
    public ResponseEntity<List<purchase>> getAllPurchases() {
        List<purchase> purchases = purchaseService.getAllPurchases();
        return new ResponseEntity<>(purchases, HttpStatus.OK);
    }

    // Get a purchase by ID
    @GetMapping("/{id}")
    public ResponseEntity<purchase> getPurchaseById(@PathVariable Long id) {
        Optional<purchase> purchase = purchaseService.getPurchaseById(id);
        return purchase.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // Get a purchase by invoice number
    @GetMapping("/invoice/{invoiceNumber}")
    public ResponseEntity<purchase> getPurchaseByInvoiceNumber(@PathVariable String invoiceNumber) {
        Optional<purchase> purchase = purchaseService.getPurchaseByInvoiceNumber(invoiceNumber);
        return purchase.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // Delete a purchase by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePurchase(@PathVariable Long id) {
        purchaseService.deletePurchase(id);
        return ResponseEntity.noContent().build();
    }
}
