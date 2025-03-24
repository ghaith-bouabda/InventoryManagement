package com.pfe.GestionDuStock.purchase;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.pfe.GestionDuStock.supplier.supplier;
import com.pfe.GestionDuStock.product.product;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
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
    @JoinColumn(name = "supplier_id")
    private supplier supplier;  // The supplier from whom the products are purchased

    @OneToMany(mappedBy = "purchase", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<purchaseItem> purchaseItems = new ArrayList<>();

    @Column(nullable = false)
    private Integer quantity;  // Total quantity of products purchased

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;  // Total amount spent on the purchase

    @Column(name = "purchase_date", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date purchaseDate;  // Date of purchase

    @Column(name = "invoice_number", unique = true)
    private String invoiceNumber;  // Unique invoice number for the purchase

    @Column(name = "approved", nullable = false)
    private boolean approved = false;  // Indicates whether the purchase has been approved

    @Column(name = "status", nullable = false)
    private String status = "Pending";  // Status of the purchase (e.g., Pending, Completed)
}
