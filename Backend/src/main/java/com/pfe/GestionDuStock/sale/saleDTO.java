package com.pfe.GestionDuStock.sale;

import com.pfe.GestionDuStock.customer.customerDTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record saleDTO(
        Long id,                    // Sale ID
        LocalDateTime saleDate,      // Date and time when the sale occurred
        BigDecimal amount,           // Total amount of the sale
        String invoiceNumber,        // Invoice number of the sale
        customerDTO customer,        // Customer associated with the sale
        List<saleitemDTO> saleItems  // List of sale items, each containing productId, quantity, and price
) {}
