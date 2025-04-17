package com.pfe.GestionDuStock.purchase;

import com.pfe.GestionDuStock.product.product;

public class purchaseItemMapper {

    // Convert purchaseItem entity to purchaseItemDTO
    public static purchaseItemDTO toDTO(purchaseItem entity) {
        return new purchaseItemDTO(
                entity.getProduct() != null ? entity.getProduct().getId() : null,
                entity.getProduct() != null ? entity.getProduct().getName() : null,
                entity.getQuantity(),       // Correct order - quantity comes first
                entity.getStockThreshold(), // Then stockThreshold
                entity.getPrice()
        );
    }
    // Convert purchaseItemDTO to purchaseItem entity
    public static purchaseItem toEntity(purchaseItemDTO dto, purchase purchase, product product) {
        if (product == null) {
            throw new RuntimeException("Product not found for purchase item");
        }

        purchaseItem entity = new purchaseItem();
        entity.setProduct(product);
        entity.setQuantity(dto.quantity());
        entity.setStockThreshold(dto.stockThreshold());
        entity.setPrice(dto.price());
        entity.setPurchase(purchase);

        return entity;
    }
}
