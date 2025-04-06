package com.pfe.GestionDuStock.sale;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
public class saleController {

    private final saleService saleService;

    @PostMapping
    public sale createSale(@RequestParam Long customerId, @RequestBody saleDTO saleDTO) {
        return saleService.registerSale(customerId, saleDTO);
    }

    @PostMapping("/{saleId}/items")
    public void addSaleItem(@PathVariable Long saleId,
                            @RequestParam Long productId,
                            @RequestParam Long quantity,
                            @RequestParam Long price) {
        saleService.addSaleItem(saleId, productId, quantity, price);
    }

    @GetMapping("/invoice/{invoiceNumber}")
    public ResponseEntity<sale> getSaleByInvoiceNumber(@PathVariable String invoiceNumber) {
        Optional<sale> sale = saleService.getSaleByInvoiceNumber(invoiceNumber);
        return sale.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{saleId}/items/{saleItemId}")
    public void removeSaleItem(@PathVariable Long saleId, @PathVariable Long saleItemId) {
        saleService.removeSaleItem(saleId, saleItemId);
    }

    @PutMapping("/{saleId}")
    public sale updateSale(@PathVariable Long saleId, @RequestBody saleDTO updatedSaleDTO) {
        return saleService.updateSale(saleId, updatedSaleDTO);
    }
    @GetMapping("/total-sales")
    public Long getTotalSales() {
        return saleService.getTotalSales();
    }
}
