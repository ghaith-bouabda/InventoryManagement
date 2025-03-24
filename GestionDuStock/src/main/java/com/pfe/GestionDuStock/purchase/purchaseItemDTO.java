package com.pfe.GestionDuStock.purchase;

public record purchaseItemDTO(
        Long productId,  // The ID of the product being purchased
        Integer quantity,  // Quantity of the product purchased
        Double price  // Price per unit of the product
) {}
