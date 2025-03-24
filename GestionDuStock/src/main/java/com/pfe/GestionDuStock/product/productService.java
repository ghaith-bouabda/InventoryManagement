package com.pfe.GestionDuStock.product;

import com.pfe.GestionDuStock.supplier.supplier;
import com.pfe.GestionDuStock.supplier.supplierRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class productService {

    private final productRepository productRepository;
    private final supplierRepository supplierRepository;  // Added to fetch supplier when needed

    public productDTO saveProduct(productDTO dto) {
        // Fetch the supplier by its ID in the DTO
        supplier supplier = supplierRepository.findById(dto.supplier().id())
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        // Convert productDTO to product entity with the supplier
        product product = productMapper.toEntity(dto, supplier);
        return productMapper.toDTO(productRepository.save(product));
    }

    public List<productDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(productMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<productDTO> getProductById(Long id) {
        return productRepository.findById(id).map(productMapper::toDTO);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    @Transactional
    public productDTO reduceProductQuantity(Long productId, Long quantitySold) {
        product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStockQuantity() < quantitySold) {
            throw new RuntimeException("Not enough stock for the sale");
        }

        product.setStockQuantity(product.getStockQuantity() - quantitySold);
        return productMapper.toDTO(productRepository.save(product));
    }

    @Transactional
    public productDTO increaseProductQuantity(Long productId, Long quantityPurchased) {
        product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setStockQuantity(product.getStockQuantity() + quantityPurchased);
        return productMapper.toDTO(productRepository.save(product));
    }

    public List<productDTO> getLowStockProducts() {
        return productRepository.findAll().stream()
                .filter(p -> p.getStockQuantity() > 0 && p.getStockQuantity() < p.getStockThreshold())
                .map(productMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<productDTO> getOutOfStockProducts() {
        return productRepository.findAll().stream()
                .filter(p -> p.getStockQuantity() == 0)
                .map(productMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Map<String, Long> getProductCountBySupplier() {
        return productRepository.findAll().stream()
                .filter(p -> p.getSupplier() != null)
                .collect(Collectors.groupingBy(p -> p.getSupplier().getName(), Collectors.counting()));
    }
}
