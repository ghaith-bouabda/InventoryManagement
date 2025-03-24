package com.pfe.GestionDuStock.product;

import com.pfe.GestionDuStock.supplier.supplier;
import com.pfe.GestionDuStock.supplier.supplierMapper;
import org.springframework.stereotype.Component;

@Component
public class productMapper {

    // Convert product entity to productDTO
    public static productDTO toDTO(product entity) {
        return new productDTO(
                entity.getId(),
                entity.getName(),
                entity.getPrice(),
                entity.getStockQuantity(),
                entity.getStockThreshold(),
                entity.getSupplier() != null ? supplierMapper.toDTO(entity.getSupplier()) : null  // Map supplier to supplierDTO
        );
    }

    // Convert productDTO to product entity
    public static product toEntity(productDTO dto, supplier supplier) {
        product entity = new product();
        entity.setId(dto.id());
        entity.setName(dto.name());
        entity.setPrice(dto.price());
        entity.setStockQuantity(dto.stockQuantity());
        entity.setStockThreshold(dto.stockThreshold());

        entity.setSupplier(supplier);  // Set the supplier entity

        return entity;
    }
}
