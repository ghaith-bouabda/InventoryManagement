package com.pfe.GestionDuStock.sale;

import com.pfe.GestionDuStock.product.product;
import com.pfe.GestionDuStock.product.productDTO;
import com.pfe.GestionDuStock.product.productMapper;
import com.pfe.GestionDuStock.product.productService;
import com.pfe.GestionDuStock.supplier.supplier; // import supplier class
import org.springframework.stereotype.Component;

@Component
public class saleItemMapper {

    private final productService productService;

    public saleItemMapper(productService productService) {
        this.productService = productService;
    }

    // Convert saleItem entity to saleItemDTO
    public  saleitemDTO toDTO(saleItem entity) {
        return new saleitemDTO(
                entity.getProduct().getId(),  // Extract the product ID
                entity.getQuantity(),
                entity.getPrice()
        );
    }

    // Convert saleItemDTO to saleItem entity
    public saleItem toEntity(saleitemDTO dto, supplier supplier) {
        // Fetch productDTO from the productService using the provided productId
        productDTO productDTO = productService.getProductById(dto.productId())
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + dto.productId()));

        product product = productMapper.toEntity(productDTO, supplier); // Pass the supplier to productMapper

        // Create the saleItem entity and set its properties
        saleItem entity = new saleItem();
        entity.setProduct(product);  // Set the product entity
        entity.setQuantity(dto.quantity());
        entity.setPrice(dto.price());

        return entity;
    }
}
