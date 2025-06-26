package com.pfe.GestionDuStock.purchase;

import com.pfe.GestionDuStock.supplier.supplier;
import com.pfe.GestionDuStock.supplier.supplierDTO;
import com.pfe.GestionDuStock.supplier.supplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @PutMapping("/{invoiceNumber}")
    public ResponseEntity<purchaseDTO> updatePurchase(
            @PathVariable String invoiceNumber,
            @RequestBody purchaseDTO purchaseDTO) {

        purchaseDTO updatedPurchase = purchaseService.updatePurchase(invoiceNumber, purchaseDTO);
        return new ResponseEntity<>(updatedPurchase, HttpStatus.OK);
    }
    // Get purchases by supplier slug
    @GetMapping("/{slug}")
    public ResponseEntity<List<purchaseDTO>> getPurchaseBySupplier(@PathVariable String slug) {
        List<purchaseDTO> purchases = purchaseService.getPurchaseBySupplierSlug(slug);
        if (purchases.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();  // If no purchases found
        } else {
            return ResponseEntity.ok(purchases);  // If purchases are found, return them with status 200
        }
    }
    @GetMapping("/total-purchases")
    public Long getTotalPurchases() {
        return purchaseService.getTotalPurchases();
    }
    @GetMapping("/invoice/{invoiceNumber}")
    public ResponseEntity<purchaseDTO> getPurchaseByInvoiceNumber(@PathVariable String invoiceNumber) {
        Optional<purchaseDTO> purchase = purchaseService.getPurchaseByInvoiceNumber(invoiceNumber);
        return purchase.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }


    @DeleteMapping("/delete/{invoice}")
    public ResponseEntity<Void> deletePurchase(@PathVariable("invoice") String invoiceNumber) {
        purchaseService.deletePurchase(invoiceNumber);
        return ResponseEntity.noContent().build();
    }

}
