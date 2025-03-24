package com.pfe.GestionDuStock.supplier;

import java.util.List;

public record supplierDTO(
        Long id,
        String slug,
        String name,
        String email,
        String telephone,
        String adresse,
        String contactPerson,
        List<Long> productIds,
        boolean isDeleted
) {}
