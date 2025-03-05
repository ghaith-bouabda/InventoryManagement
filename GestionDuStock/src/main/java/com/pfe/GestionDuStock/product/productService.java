package com.pfe.GestionDuStock.product;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class productService {

    private final productRepository productRepository;

    public product saveProduct(product product) {
        return productRepository.save(product);
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

    @Transactional
    public product reduceProductQuantity(Long productId, Long quantitySold) {
        product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStockQuantity() < quantitySold) {
            throw new RuntimeException("Not enough stock for the sale");
        }

        product.setStockQuantity(product.getStockQuantity() - quantitySold);
        return productRepository.save(product);
    }

    @Transactional
    public product increaseProductQuantity(Long productId, Long quantityPurchased) {
        product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setStockQuantity(product.getStockQuantity() + quantityPurchased);
        return productRepository.save(product);
    }


    public List<product> getLowStockProducts() {
        return productRepository.findAll().stream()
                .filter(p -> p.getStockQuantity() > 0 && p.getStockQuantity() < p.getStockThreshold())
                .collect(Collectors.toList());
    }


    public List<product> getOutOfStockProducts() {
        return productRepository.findAll().stream()
                .filter(p -> p.getStockQuantity() == 0)
                .collect(Collectors.toList());
    }

    public List<ProductCategoryDTO> getProductsByCategoryCount() {
        return productRepository.findAll().stream()
                .collect(Collectors.groupingBy(p -> p.getSupplier().getName(), Collectors.counting()))
                .entrySet().stream()
                .map(entry -> new ProductCategoryDTO(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());
    }
}
