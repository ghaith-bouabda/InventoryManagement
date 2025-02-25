package com.pfe.GestionDuStock.purchase;

import com.pfe.GestionDuStock.product.product;
import com.pfe.GestionDuStock.product.productService;
import com.pfe.GestionDuStock.supplier.supplier;
import com.pfe.GestionDuStock.supplier.supplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class purchaseService {

    private final purchaseRepository purchaseRepository;
    private final productService productService;
    private final supplierRepository supplierRepository;

    public purchase savePurchase(Long supplierId, purchase purchase) {
        supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        purchase.setSupplier(supplier);

        // For each item in the purchase, increase product quantity
        for (product purchaseItem : purchase.getProducts()) {
            // Increment the product quantity using the existing method in productService
            productService.increaseProductQuantity(purchaseItem.getId(), purchaseItem.getStockQuantity());
        }

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

    public List<purchase> getAllPurchases() {
        return purchaseRepository.findAll();
    }

    public Optional<purchase> getPurchaseBySupplierSlug(String Slug) {
        return purchaseRepository.findBySupplierSlug(Slug);
    }

    public Optional<purchase> getPurchaseByInvoiceNumber(String invoiceNumber) {
        return purchaseRepository.findByInvoiceNumber(invoiceNumber);
    }

    public void deletePurchase(Long id) {
        purchaseRepository.deleteById(id);
    }

    private String generateInvoiceNumber() {
        return "INV-" + System.currentTimeMillis();
    }
}
