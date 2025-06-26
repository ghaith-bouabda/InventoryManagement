package com.pfe.GestionDuStock.sale;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface saleRepository extends JpaRepository<sale,Long> {
    Optional<sale> findByInvoiceNumber(String invoiceNumber);

    @Query("SELECT SUM(s.amount) FROM sale s")
    Long sumTotalAmount();
}
