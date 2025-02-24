package com.pfe.GestionDuStock.supplier;

public record supplierDTO(
        String slug,
        String nom,
        String email,
        String telephone,
        String adresse,
        String contactPerson

) {
}
