package com.pfe.GestionDuStock.purchase;

import com.pfe.GestionDuStock.fournisseur.fournisseur;
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
    private fournisseur fournisseur;

    @OneToMany
    @JoinColumn(name = "purchase_id")
    private List<product> products;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Column(name = "purchase_date", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date purchaseDate;


    @Column(name = "invoice_number", unique = true)
    private String invoiceNumber;
}
