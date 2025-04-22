package com.pfe.GestionDuStock.product;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.pfe.GestionDuStock.purchase.purchase;
import com.pfe.GestionDuStock.supplier.supplier;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Double price;

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    private supplier supplier;  // Only have supplier as a reference for product

    private Long stockQuantity;
    private Long stockThreshold;
    private boolean isDeleted;
}
