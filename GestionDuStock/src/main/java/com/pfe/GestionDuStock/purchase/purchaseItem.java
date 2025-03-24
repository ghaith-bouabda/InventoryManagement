package com.pfe.GestionDuStock.purchase;

import com.pfe.GestionDuStock.product.product;
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
public class purchaseItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private product product;  // Product being purchased

    private Integer quantity;  // Quantity of the product purchased
    private Double price;  // Price at which the product was purchased

    @ManyToOne
    @JoinColumn(name = "purchase_id")
    private purchase purchase;  // The purchase this item belongs to
}
