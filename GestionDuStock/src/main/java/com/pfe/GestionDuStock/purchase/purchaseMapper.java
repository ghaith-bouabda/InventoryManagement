package com.pfe.GestionDuStock.purchase;

import com.pfe.GestionDuStock.product.product;
import com.pfe.GestionDuStock.supplier.supplier;

import java.util.List;
import java.util.stream.Collectors;

public class purchaseMapper {

    // Convert purchase entity to purchaseDTO
    public static purchaseDTO toDTO(purchase entity) {
        return new purchaseDTO(
                entity.getId(),
                entity.getSupplier() != null ? entity.getSupplier().getId() : null,  // Convert supplier to its ID
                entity.getPurchaseItems() != null ?
                        entity.getPurchaseItems().stream()
                                .map(purchaseItemMapper::toDTO)  // Map each purchaseItem to purchaseItemDTO
                                .collect(Collectors.toList()) : null,  // List of purchaseItemDTOs
                entity.getTotalAmount(),
                entity.getPurchaseDate(),
                entity.getInvoiceNumber(),
                entity.isApproved(),
                entity.getStatus()
        );
    }

    // Convert purchaseDTO to purchase entity
    public static purchase toEntity(purchaseDTO dto, supplier supplier, List<product> products) {
        purchase entity = new purchase();
        entity.setId(dto.id());
        entity.setSupplier(supplier);  // Set supplier directly
        entity.setPurchaseDate(dto.purchaseDate());  // Set purchase date
        entity.setInvoiceNumber(dto.invoiceNumber());  // Set invoice number
        entity.setApproved(dto.approved());  // Set approved status
        entity.setStatus(dto.status());  // Set status
        entity.setTotalAmount(dto.totalAmount());  // Set total amount

        // Map purchaseItemsDTO to purchaseItems entities
        List<purchaseItem> purchaseItems = dto.purchaseItems().stream()
                .map(itemDTO -> purchaseItemMapper.toEntity(itemDTO, entity, products))  // Convert each DTO to entity
                .collect(Collectors.toList());

        entity.setPurchaseItems(purchaseItems);  // Set the purchase items in the purchase entity
        return entity;
    }
}
