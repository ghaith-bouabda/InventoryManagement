package com.pfe.GestionDuStock.purchase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor  // Lombok generates the constructor automatically
public class purchaseService {

    private final purchaseRepository purchaseRepository;

    public purchase savePurchase(purchase purchase) {
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
    private String generateInvoiceNumber() {
        return "INV-" + System.currentTimeMillis();
    }

    // Get purchase by ID
    public Optional<purchase> getPurchaseById(Long id) {
        return purchaseRepository.findById(id);
    }

    // Get purchase by Invoice Number
    public Optional<purchase> getPurchaseByInvoiceNumber(String invoiceNumber) {
        return purchaseRepository.findByInvoiceNumber(invoiceNumber);
    }

    // Delete a purchase by ID
    public void deletePurchase(Long id) {
        purchaseRepository.deleteById(id);
    }
}
