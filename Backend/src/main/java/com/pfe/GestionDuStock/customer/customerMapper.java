package com.pfe.GestionDuStock.customer;


public class customerMapper {

    // Convert customer entity to customerDTO
    public static customerDTO toDTO(customer entity) {
        return new customerDTO(
                entity.getId(),
                entity.getCustomerName(),
                entity.getEmail(),
                entity.getPhone(),
                entity.getAddress()
        );
    }

    // Convert customerDTO to customer entity
    public static customer toEntity(customerDTO dto) {
        customer entity = new customer();
        entity.setId(dto.id());
        entity.setCustomerName(dto.customerName());
        entity.setEmail(dto.email());
        entity.setPhone(dto.phone());
        entity.setAddress(dto.address());
        return entity;
    }
}
