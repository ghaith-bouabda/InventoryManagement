package com.pfe.GestionDuStock.sale;

import com.pfe.GestionDuStock.product.product;
import jakarta.persistence.*;
import lombok.*;

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
    private product product; // The product being sold

    private int quantity;  // How many units of this product

    private double price;  // Price at which the product was sold

    @ManyToOne
    @JoinColumn(name = "sale_id", nullable = false)
    private sale sale;  // Link to the sale this item belongs to
}
