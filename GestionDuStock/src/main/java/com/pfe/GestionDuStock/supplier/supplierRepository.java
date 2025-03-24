package com.pfe.GestionDuStock.supplier;

import org.springframework.data.domain.Example;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface supplierRepository extends JpaRepository<supplier, Long> {
    boolean existsBySlug(String slug);


    Optional<supplier> findBySlug(String slug);
}
