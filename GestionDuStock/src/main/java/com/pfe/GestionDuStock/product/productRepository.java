package com.pfe.GestionDuStock.product;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface productRepository extends JpaRepository<product, Long> {
    List<product> findByStockQuantityLessThanAndStockQuantityGreaterThan(Long threshold, Long zero);
    List<product> findByStockQuantity(Long quantity);

    Optional<product> findByNameAndSupplierId(String name, Long id);
}
