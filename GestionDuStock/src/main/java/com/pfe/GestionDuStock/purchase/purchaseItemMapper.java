package com.pfe.GestionDuStock.purchase;

import com.pfe.GestionDuStock.product.product;

import java.util.List;
public class purchaseItemMapper {

    // Convert purchaseItem entity to purchaseItemDTO
    public static purchaseItemDTO toDTO(purchaseItem entity) {
        return new purchaseItemDTO(
                entity.getProduct() != null ? entity.getProduct().getId() : null,  // Product ID
                entity.getQuantity(),  // Quantity of the product purchased
                entity.getPrice()  // Price per product
        );
    }

    // Convert purchaseItemDTO to purchaseItem entity
    public static purchaseItem toEntity(purchaseItemDTO dto, purchase purchase, List<product> products) {
        product product = products.stream()
                .filter(p -> p.getId().equals(dto.productId()))  // Find the product by ID
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Product not found"));

        purchaseItem entity = new purchaseItem();
        entity.setProduct(product);  // Set the product
        entity.setQuantity(dto.quantity());  // Set the quantity
        entity.setPrice(dto.price());  // Set the price
        entity.setPurchase(purchase);  // Set the associated purchase

        return entity;
    }
}
