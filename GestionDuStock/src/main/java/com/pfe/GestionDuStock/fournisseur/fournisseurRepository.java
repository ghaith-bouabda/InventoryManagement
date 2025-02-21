package com.pfe.GestionDuStock.fournisseur;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface fournisseurRepository extends JpaRepository<fournisseur, Integer> {
    boolean existsBySlug(String slug);

    // Find a fournisseur by slug
    Optional<fournisseur> findBySlug(String slug);
}
