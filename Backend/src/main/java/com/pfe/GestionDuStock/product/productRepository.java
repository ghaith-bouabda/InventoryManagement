package com.pfe.GestionDuStock.product;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface productRepository extends JpaRepository<product, Long> {

    Optional<product> findByNameAndSupplierId(String name, Long id);

    product getById(Long id);

    Optional<product> findByNameAndSupplierIdAndIsDeletedTrue(String name, Long id);

    Optional<product> findByNameAndSupplierIdAndIsDeletedFalse(String name, Long id);

    Optional<product> findByNameAndSupplierIdAndIsDeleted(String name, Long id, boolean b);
}
