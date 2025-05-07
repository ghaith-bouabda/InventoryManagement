package com.pfe.GestionDuStock.product;

import com.pfe.GestionDuStock.exception.ProductNotFoundException;
import com.pfe.GestionDuStock.supplier.supplier;
import com.pfe.GestionDuStock.supplier.supplierMapper;
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
    private final supplierRepository supplierRepository;
    private final supplierMapper supplierMapper;// Added to fetch supplier when needed

    public productDTO saveProduct(productDTO dto) {
        // Fetch the supplier by its ID in the DTO
        supplier supplier = supplierRepository.findById(dto.supplier().id())
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

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
      product product=productRepository.getById(id);
     product.setDeleted(true);
     productRepository.save(product);

    }

    @Transactional
    public void reduceProductQuantity(Long productId, Long quantity) {
        product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found"));

        System.out.println("[STOCK UPDATE] Product: " + product.getName() +
                " | Current: " + product.getStockQuantity() +
                " | Deducting: " + quantity);

        if (product.getStockQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }

        product.setStockQuantity(product.getStockQuantity() - quantity);
        productRepository.save(product); // Explicit save

        System.out.println("[STOCK RESULT] New quantity: " + product.getStockQuantity());
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
    public productDTO updateProduct(Long id, productDTO dto) {
        product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Update 'name' only if provided in the DTO
        if (dto.name() != null) {
            existingProduct.setName(dto.name());
        }

        // Update 'stockQuantity' only if provided in the DTO
        if (dto.stockQuantity() != null) {
            existingProduct.setStockQuantity(dto.stockQuantity());
        }



        // Update 'supplier' only if provided in the DTO
        if (dto.supplier() != null) {
            supplier supplier = supplierRepository.findById(dto.supplier().id())
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));
            existingProduct.setSupplier(supplier);
        }

        return productMapper.toDTO(productRepository.save(existingProduct));
    }

}
