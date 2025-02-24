package com.pfe.GestionDuStock.supplier;


import com.pfe.GestionDuStock.product.product;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class supplier {

    @Id
    @GeneratedValue
        private Long id;

        @Column(unique = true)
        private String slug;

        private String nom;
        private String email;
        private String telephone;
        private String adresse;
        private String contactPerson;
    @OneToMany(mappedBy = "supplier", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<product> products; 

        @Column(name = "is_deleted", nullable = false)
        private boolean isDeleted = false;
    }
