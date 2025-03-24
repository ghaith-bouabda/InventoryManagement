package com.pfe.GestionDuStock.product;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface productRepository extends JpaRepository<product, Long> {
    List<product> findByStockQuantityLessThanAndStockQuantityGreaterThan(Long threshold, Long zero);
    List<product> findByStockQuantity(Long quantity);


}
