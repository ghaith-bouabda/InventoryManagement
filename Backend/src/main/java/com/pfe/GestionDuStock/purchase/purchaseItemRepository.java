package com.pfe.GestionDuStock.purchase;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface purchaseItemRepository extends JpaRepository<purchaseItem, Long> {
    // You can add custom queries if needed
}
