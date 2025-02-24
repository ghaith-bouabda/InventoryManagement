package com.pfe.GestionDuStock.purchase;

import com.pfe.GestionDuStock.supplier.supplier;
import com.pfe.GestionDuStock.product.product;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class purchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "fournisseur_id", nullable = false, updatable = false)
    private supplier supplier;

    @OneToMany
    @JoinColumn(name = "purchase_id")
    private List<product> products;  // List of products in the purchase

    @Column(nullable = false)
    private Integer quantity;  // How many units are being ordered

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Column(name = "purchase_date", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date purchaseDate;

    @Column(name = "invoice_number", unique = true)
    private String invoiceNumber;

    @Column(name = "auto_order", nullable = false)
    private Boolean autoOrder; // Indicates if this was auto-created due to low stock

    @Column(name = "approved", nullable = false)
    private boolean approved = false;  // Whether the purchase is approved
    @Column(name = "status", nullable = false)
    private String status = "Pending";  // Default to "Pending" until processed
}
