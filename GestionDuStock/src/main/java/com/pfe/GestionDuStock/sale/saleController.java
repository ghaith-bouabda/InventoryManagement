package com.pfe.GestionDuStock.sale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sales")
public class saleController {

    @Autowired
    private saleService saleService;

    // Endpoint to register a new sale
    @PostMapping
    public sale createSale(@RequestBody saleDTO saleDTO) {
        return saleService.registerSale(saleDTO);
    }

    // Endpoint to add a sale item to an existing sale
    @PostMapping("/{saleId}/items")
    public void addSaleItem(@PathVariable Long saleId,
                            @RequestParam Long productId,
                            @RequestParam int quantity,
                            @RequestParam double price) {
        saleService.addSaleItem(saleId, productId, quantity, price);
    }

    // Endpoint to remove a sale item from an existing sale
    @DeleteMapping("/{saleId}/items/{saleItemId}")
    public void removeSaleItem(@PathVariable Long saleId,
                               @PathVariable Long saleItemId) {
        saleService.removeSaleItem(saleId, saleItemId);
    }
}
