package com.pfe.GestionDuStock.purchase;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface purchaseRepository extends JpaRepository<purchase, Long> {
    Optional<purchase> findByInvoiceNumber(String invoiceNumber);
}
