package com.pfe.GestionDuStock.purchase;

import java.util.Date;
import java.util.List;

public record purchaseDTO(
        Long id,                    // Purchase ID
        Long supplierId,            // Supplier ID associated with the purchase
        List<purchaseItemDTO> purchaseItems,   // List of purchaseItemDTOs, each containing a product ID and quantity
        Double totalAmount,         // Total amount of the purchase (calculated in service)
        Date purchaseDate,          // The date the purchase was made
        String invoiceNumber,       // The invoice number associated with the purchase
        boolean approved,           // Whether the purchase is approved or not
        String status               // The status of the purchase (e.g., Pending, Completed)
) {}
