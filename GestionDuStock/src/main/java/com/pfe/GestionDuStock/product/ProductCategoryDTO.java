package com.pfe.GestionDuStock.product;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProductCategoryDTO {
    private String category;
    private Long count;
}
