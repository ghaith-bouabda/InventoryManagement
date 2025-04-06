package com.pfe.GestionDuStock.purchase;

public record purchaseItemDTO(
        Long productId,
        String name,// The ID of the product being purchased
        Long quantity,
        Long stockThreshold,// Quantity of the product purchased
        Double price  // Price per unit of the product
) {}
