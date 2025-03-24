package com.pfe.GestionDuStock.sale;

import com.pfe.GestionDuStock.customer.customer;
import com.pfe.GestionDuStock.customer.customerMapper;
import com.pfe.GestionDuStock.supplier.supplier; // import supplier class
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.Mapping;

import java.util.List;
import java.util.stream.Collectors;
@Component
public class saleMapper {

    private final saleItemMapper saleItemMapper;

    public saleMapper(saleItemMapper saleItemMapper) {
        this.saleItemMapper = saleItemMapper;
    }

    // Convert sale entity to saleDTO
    public saleDTO toDTO(sale entity) {
        return new saleDTO(
                entity.getId(),
                entity.getSaleDate(),
                entity.getAmount(),
                entity.getInvoiceNumber(),
                customerMapper.toDTO(entity.getCustomer()),  // Convert customer entity to DTO
                entity.getSaleItems().stream()
                        .map(saleItemMapper::toDTO)  // Convert sale items to saleItemDTO
                        .collect(Collectors.toList())
        );
    }

    // Convert saleDTO to sale entity
    public sale toEntity(saleDTO dto, supplier supplier) {
        // Fetch customer entity by ID from the customerDTO
        customer customer = customerMapper.toEntity(dto.customer());

        // Convert saleItemsDTO to saleItems entities using saleItemMapper
        List<saleItem> saleItems = dto.saleItems().stream()
                .map(saleItemDTO -> saleItemMapper.toEntity(saleItemDTO, supplier))  // Convert sale item DTOs to entities
                .collect(Collectors.toList());

        // Create sale entity
        sale entity = new sale();
        entity.setId(dto.id());
        entity.setSaleDate(dto.saleDate());
        entity.setAmount(dto.amount());
        entity.setInvoiceNumber(dto.invoiceNumber());
        entity.setCustomer(customer);  // Set the customer
        entity.setSaleItems(saleItems);  // Set the sale items

        return entity;
    }
}
