package com.pfe.GestionDuStock.supplier;

import com.pfe.GestionDuStock.product.product;


public class supplierMapper {
    public static supplierDTO toDTO(supplier entity) {
        return new supplierDTO(
                entity.getId(),
                entity.getSlug(),
                entity.getName(),
                entity.getEmail(),
                entity.getTelephone(),
                entity.getAdresse(),
                entity.getContactPerson(),
                entity.getProducts() != null ? entity.getProducts().stream().map(product::getId).toList() : null,
                entity.isDeleted()
        );
    }

    public static supplier toEntity(supplierDTO dto) {
        supplier entity = new supplier();
        entity.setId(dto.id());
        entity.setSlug(dto.slug());
        entity.setName(dto.name());
        entity.setEmail(dto.email());
        entity.setTelephone(dto.telephone());
        entity.setAdresse(dto.adresse());
        entity.setContactPerson(dto.contactPerson());
        entity.setDeleted(dto.isDeleted());
        return entity;
    }
}
