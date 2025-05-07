package com.pfe.GestionDuStock.sale;

import java.math.BigDecimal;

public record saleitemDTO(
        Long productId,  // The ID of the product being sold
        Long quantity,  // The quantity of the product sold
        Double price  // The price per unit of the product
) {}
