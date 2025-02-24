package com.pfe.GestionDuStock.product;

import com.pfe.GestionDuStock.purchase.purchase;
import com.pfe.GestionDuStock.purchase.purchaseRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class productService {

    private final productRepository productRepository;
    private final purchaseRepository purchaseRepository;


    public product saveProduct(product product) {
        return productRepository.save(product); // Just save the product as it is
    }

    @Transactional
    public void finalizePurchase(Long purchaseOrderId) {
        purchase order = purchaseRepository.findById(purchaseOrderId)
                .orElseThrow(() -> new RuntimeException("Purchase order not found"));

        // Ensure the order is approved before proceeding
        if (!order.isApproved()) {
            throw new RuntimeException("Purchase order not approved yet.");
        }

        for (product p : order.getProducts()) {
            // Ensure there is enough stock to fulfill the order
            Optional<product> productInDb = productRepository.findById(p.getId());
            if (productInDb.isPresent()) {
                product productFromDb = productInDb.get();
                if (productFromDb.getStockQuantity() < p.getStockQuantity()) {
                    throw new RuntimeException("Not enough stock to fulfill order for " + p.getName());
                }
                // Reduce stock by the quantity ordered
                productFromDb.setStockQuantity(productFromDb.getStockQuantity() - p.getStockQuantity());
                productRepository.save(productFromDb); // Save the updated product stock
            } else {
                throw new RuntimeException("Product not found in inventory: " + p.getName());
            }
        }
        order.setStatus("Finalized");
        purchaseRepository.save(order); // Save the updated purchase order
    }
    public List<product> getAllProducts() {
        return productRepository.findAll();
    }

    public Optional<product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}
