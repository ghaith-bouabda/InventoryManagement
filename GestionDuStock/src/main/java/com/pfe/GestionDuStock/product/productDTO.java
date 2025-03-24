package com.pfe.GestionDuStock.product;

import com.pfe.GestionDuStock.supplier.supplierDTO;

public record productDTO(
        Long id,                // Product ID
        String name,            // Product name
        Double price,           // Product price
        Long stockQuantity,     // Current stock quantity of the product
        Long stockThreshold,    // Stock threshold for reordering the product
        supplierDTO supplier    // Encapsulate the supplier details
) {}
