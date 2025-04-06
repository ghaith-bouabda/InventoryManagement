package com.pfe.GestionDuStock.purchase;

import com.pfe.GestionDuStock.product.product;
import com.pfe.GestionDuStock.product.productMapper;
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
    private final productMapper productMapper;
    private final com.pfe.GestionDuStock.product.productService productService;

    @Transactional
    public purchaseDTO savePurchase(purchaseDTO dto) {
        // Validate that the supplier exists
        supplier supplier = supplierRepository.findById(dto.supplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        // Create new purchase
        purchase purchase = new purchase();
        purchase.setSupplier(supplier);
        purchase.setPurchaseDate(dto.purchaseDate());
        purchase.setInvoiceNumber(dto.invoiceNumber() != null ? dto.invoiceNumber() : generateInvoiceNumber());
        purchase.setApproved(false);
        purchase.setStatus("Pending");

        List<purchaseItem> purchaseItems = new ArrayList<>();
        double totalAmount = 0;

        for (purchaseItemDTO itemDTO : dto.purchaseItems()) {
            product product = productRepository.findByNameAndSupplierId(itemDTO.name(), supplier.getId())
                    .orElseGet(() -> createNewProduct(itemDTO, supplier));

            // Create and add purchase item
            purchaseItem item = new purchaseItem();
            item.setProduct(product);
            item.setName(itemDTO.name());
            item.setStockThreshold(itemDTO.stockThreshold());
            item.setQuantity(itemDTO.quantity());
            item.setPrice(itemDTO.price());
            item.setPurchase(purchase);
            purchaseItems.add(item);

            totalAmount += itemDTO.quantity() * itemDTO.price();
        }

        // Save the purchase first
        purchase.setTotalAmount(totalAmount);
        purchase.setQuantity((int) purchaseItems.stream().mapToLong(purchaseItem::getQuantity).sum());
        purchaseRepository.save(purchase);

        // Save purchase items separately
        purchaseItemRepository.saveAll(purchaseItems);

        // Update stock quantities *after* saving the purchase
        for (purchaseItem item : purchaseItems) {
            product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            product.setStockThreshold(product.getStockThreshold());
            productRepository.save(product);
        }

        return purchaseMapper.toDTO(purchase);
    }

    // Helper method to create new product if not found
    private product createNewProduct(purchaseItemDTO itemDTO, supplier supplier) {
        product newProduct = new product();
        newProduct.setName(itemDTO.name());
        newProduct.setPrice(itemDTO.price());
        newProduct.setStockQuantity(0L); // Initial quantity
        newProduct.setStockThreshold(itemDTO.stockThreshold()); // Default threshold
        newProduct.setSupplier(supplier);
        productRepository.save(newProduct);
        return newProduct;
         // Save new product
    }

    // Get all purchases
    public List<purchaseDTO> getAllPurchases() {
        return purchaseRepository.findAll().stream()
                .map(purchaseMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<purchaseDTO> getPurchaseBySupplierSlug(String slug) {
        return purchaseRepository.findBySupplierSlug(slug)
                .stream()  // You need to convert the result to a stream
                .map(purchaseMapper::toDTO)  // Map each result to a DTO
                .collect(Collectors.toList());  // Collect the results into a list
    }

    // Get purchase by invoice number
    public Optional<purchaseDTO> getPurchaseByInvoiceNumber(String invoiceNumber) {
        return purchaseRepository.findByInvoiceNumber(invoiceNumber)
                .map(purchaseMapper::toDTO);
    }

    // Delete purchase by id
    public void deletePurchase(Long id) {
        purchaseRepository.deleteById(id);
    }

    // Generate a new invoice number (simple timestamp approach)
    private String generateInvoiceNumber() {
        return "INV-" + System.currentTimeMillis();
    }
}
