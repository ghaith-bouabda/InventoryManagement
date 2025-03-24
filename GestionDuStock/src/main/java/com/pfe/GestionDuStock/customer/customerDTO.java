package com.pfe.GestionDuStock.customer;

public record customerDTO(
        Long id,                // Customer ID
        String customerName,    // Customer Name
        String email,           // Customer Email
        String phone,           // Customer Phone
        String address          // Customer Address
) {}
