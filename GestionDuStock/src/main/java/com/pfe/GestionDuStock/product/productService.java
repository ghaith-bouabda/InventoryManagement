package com.pfe.GestionDuStock.product;

import com.pfe.GestionDuStock.purchase.purchaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class productService {

    private final productRepository productRepository;


    public product saveProduct(product product) {
        return productRepository.save(product); // Just save the product as it is
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
    public product reduceProductQuantity(Long productId, Long quantitySold) {
        product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStockQuantity() < quantitySold) {
            throw new RuntimeException("Not enough stock for the sale");
        }
        product.setStockQuantity(product.getStockQuantity() - quantitySold);
        return productRepository.save(product);
    }

    public product increaseProductQuantity(Long productId, Long quantityPurchased) {
        product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setStockQuantity(product.getStockQuantity() + quantityPurchased);
        return productRepository.save(product);
    }
}
