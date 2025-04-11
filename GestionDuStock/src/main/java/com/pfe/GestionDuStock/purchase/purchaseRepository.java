package com.pfe.GestionDuStock.purchase;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface purchaseRepository extends JpaRepository<purchase, Long> {
    Optional<purchase> findByInvoiceNumber(String invoiceNumber);
   List<purchase> findBySupplierSlug(String slug);
    @Query("SELECT SUM(p.totalAmount) FROM purchase p")
    Long sumTotalAmount();


    void deleteByInvoiceNumber(String invoiceNumber);
}
