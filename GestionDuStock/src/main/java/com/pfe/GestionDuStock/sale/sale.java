package com.pfe.GestionDuStock.sale;


import com.pfe.GestionDuStock.customer.customer;
import jakarta.persistence.*;
import lombok.*;

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
     private long amount;

    @Column(name = "invoice_number", unique = true,nullable = false)
    private String invoiceNumber;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private customer customer;
    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<saleItem> saleItems = new ArrayList<>();



}
