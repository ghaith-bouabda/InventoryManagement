package com.pfe.GestionDuStock.sale;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface saleRepository extends JpaRepository<sale,Long> {
    Optional<sale> findByInvoiceNumber(String invoiceNumber);


}
