package com.pfe.GestionDuStock.sale;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.pfe.GestionDuStock.customer.customer;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class sale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime saleDate; // When the sale occurred

    @Column(nullable = false)
    private BigDecimal amount; // Use BigDecimal for precision in currency values

    @Column(name = "invoice_number", unique = true, nullable = false)
    private String invoiceNumber;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    @JsonIgnore
    private customer customer;  // Customer associated with the sale

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<saleItem> saleItems = new ArrayList<>();  // List of sale items in the sale

    // Helper method to add a sale item to the sale
    public void addSaleItem(saleItem item) {
        saleItems.add(item);
        item.setSale(this);
    }

    // Helper method to remove a sale item from the sale
    public void removeSaleItem(saleItem item) {
        saleItems.remove(item);
        item.setSale(null);
    }
}
