package com.pfe.GestionDuStock.purchase;

import com.pfe.GestionDuStock.supplier.supplier;
import com.pfe.GestionDuStock.supplier.supplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor  // Lombok generates the constructor automatically
public class purchaseService {

    private final purchaseRepository purchaseRepository;
    private final supplierRepository supplierRepository;  // Injecting supplierRepository

    // Save purchase with supplier
    public purchase savePurchase(Long supplierId, purchase purchase) {
        // Find the supplier by ID
        supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        // Set the supplier to the purchase
        purchase.setSupplier(supplier);

        // Set other purchase properties and save
        purchase.builder()
                .purchaseDate(purchase.getPurchaseDate())
                .approved(purchase.isApproved())
                .autoOrder(purchase.getAutoOrder())
                .invoiceNumber(generateInvoiceNumber())
                .status(purchase.getStatus())
                .quantity(purchase.getQuantity())
                .totalAmount(purchase.getTotalAmount())
                .build();

        return purchaseRepository.save(purchase);
    }

    // Get all purchases
    public List<purchase> getAllPurchases() {
        return purchaseRepository.findAll();
    }

    // Get purchase by ID
    public Optional<purchase> getPurchaseBySupplierSlug(String Slug) {
        return purchaseRepository.findBySupplierSlug(Slug);
    }

    // Get purchase by Invoice Number
    public Optional<purchase> getPurchaseByInvoiceNumber(String invoiceNumber) {
        return purchaseRepository.findByInvoiceNumber(invoiceNumber);
    }

    // Delete a purchase by ID
    public void deletePurchase(Long id) {
        purchaseRepository.deleteById(id);
    }

    private String generateInvoiceNumber() {
        return "INV-" + System.currentTimeMillis();
    }
}
