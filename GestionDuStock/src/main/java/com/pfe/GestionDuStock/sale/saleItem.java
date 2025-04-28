package com.pfe.GestionDuStock.sale;

import com.pfe.GestionDuStock.product.product;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class saleItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private product product;  // Product being sold

    @Column(nullable = false)
    private Long quantity;  // Quantity of the product sold

    @Column(nullable = false)
    private Double price;  // Price of the product at the time of sale

    @ManyToOne
    @JoinColumn(name = "sale_id", nullable = false)
    private sale sale;  // Reference to the sale
}
