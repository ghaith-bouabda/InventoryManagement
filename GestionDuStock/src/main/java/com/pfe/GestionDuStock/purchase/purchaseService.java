package com.pfe.GestionDuStock.purchase;

import com.pfe.GestionDuStock.product.product;
import com.pfe.GestionDuStock.product.productRepository;
import com.pfe.GestionDuStock.supplier.supplier;
import com.pfe.GestionDuStock.supplier.supplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class purchaseService {

    private final purchaseRepository purchaseRepository;
    private final productRepository productRepository;
    private final supplierRepository supplierRepository;
    private final purchaseItemRepository purchaseItemRepository;

    @Transactional
    public purchaseDTO savePurchase(purchaseDTO dto) {
        // Find the supplier by ID
        supplier supplier = supplierRepository.findById(dto.supplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        // Fetch products by product IDs
        List<product> products = productRepository.findAllById(
                dto.purchaseItems().stream().map(purchaseItemDTO::productId).collect(Collectors.toList())
        );

        if (products.size() != dto.purchaseItems().size()) {
            throw new RuntimeException("One or more products not found");
        }

        // Create purchase entity from DTO and map the supplier and products
        purchase purchase = purchaseMapper.toEntity(dto, supplier, products);
        purchase.setInvoiceNumber(generateInvoiceNumber());

        // List of PurchaseItems that will be added to the purchase
        List<purchaseItem> purchaseItems = new ArrayList<>();
        double totalAmount = 0;

        // Loop over each purchaseItemDTO
        for (int i = 0; i < dto.purchaseItems().size(); i++) {
            purchaseItemDTO itemDTO = dto.purchaseItems().get(i);
            product product = products.get(i);
            int quantity = itemDTO.quantity();
            double price = itemDTO.price();  // Now using the price from the DTO

            // Create a PurchaseItem for each product in the purchase
            purchaseItem purchaseItem = new purchaseItem();
            purchaseItem.setProduct(product);
            purchaseItem.setQuantity(quantity);
            purchaseItem.setPrice(price);
            purchaseItem.setPurchase(purchase);

            // Add to list of purchase items
            purchaseItems.add(purchaseItem);

            // Update total amount of the purchase
            totalAmount += price * quantity;

            // Update product stock quantity
            product.setStockQuantity(product.getStockQuantity() + quantity);
        }

        // Set the purchase items and total amount
        purchase.setPurchaseItems(purchaseItems);
        purchase.setTotalAmount(totalAmount);
        purchase.setQuantity(purchaseItems.stream().mapToInt(purchaseItem::getQuantity).sum());

        // Save the purchase and associated items
        purchaseRepository.save(purchase);

        // Return the saved purchase DTO
        return purchaseMapper.toDTO(purchase);
    }

    public List<purchaseDTO> getAllPurchases() {
        return purchaseRepository.findAll().stream()
                .map(purchaseMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<purchaseDTO> getPurchaseBySupplierSlug(String slug) {
        return purchaseRepository.findBySupplierSlug(slug)
                .map(purchaseMapper::toDTO);
    }

    public Optional<purchaseDTO> getPurchaseByInvoiceNumber(String invoiceNumber) {
        return purchaseRepository.findByInvoiceNumber(invoiceNumber)
                .map(purchaseMapper::toDTO);
    }

    public void deletePurchase(Long id) {
        purchaseRepository.deleteById(id);
    }

    private String generateInvoiceNumber() {
        return "INV-" + System.currentTimeMillis();
    }
}
