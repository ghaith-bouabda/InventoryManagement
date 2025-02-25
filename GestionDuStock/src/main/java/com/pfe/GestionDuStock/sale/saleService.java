package com.pfe.GestionDuStock.sale;

import com.pfe.GestionDuStock.customer.customer;
import com.pfe.GestionDuStock.customer.customerRepository;
import com.pfe.GestionDuStock.product.product;
import com.pfe.GestionDuStock.product.productService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;

@Service
@AllArgsConstructor
public class saleService {

    private final productService productService;
    private final saleRepository saleRepository;
    private final customerRepository customerRepository;

    public sale registerSale(Long customerId, saleDTO saleDTO) {
        customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        sale sale = new sale();
        sale.setSaleDate(LocalDateTime.now());
        sale.setSaleItems(new ArrayList<>());
        sale.setCustomer(customer);

        for (saleitemDTO itemDTO : saleDTO.saleItems()) {
            product product = productService.getProductById(itemDTO.productId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            if (product.getStockQuantity() < itemDTO.quantity()) {
                throw new RuntimeException("Not enough stock for product: " + product.getName());
            }

            productService.reduceProductQuantity(itemDTO.productId(), itemDTO.quantity());

            saleItem saleItem = new saleItem();
            saleItem.setProduct(product);
            saleItem.setQuantity(itemDTO.quantity());
            saleItem.setPrice(itemDTO.price());
            saleItem.setSale(sale);

            sale.getSaleItems().add(saleItem);
        }
        return saleRepository.save(sale);
    }

    public void addSaleItem(Long saleId, Long productId, Long quantity, Long price) {
        sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new RuntimeException("Sale not found"));

        product product = productService.getProductById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStockQuantity()< quantity) {
            throw new RuntimeException("Not enough stock for product: " + product.getName());
        }

        productService.reduceProductQuantity(productId, quantity);

        saleItem saleItem = new saleItem();
        saleItem.setProduct(product);
        saleItem.setQuantity(quantity);
        saleItem.setPrice(price);
        saleItem.setSale(sale);

        sale.getSaleItems().add(saleItem);

        saleRepository.save(sale);
    }

    public void removeSaleItem(Long saleId, Long saleItemId) {
        sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new RuntimeException("Sale not found"));

        saleItem saleItem = sale.getSaleItems().stream()
                .filter(item -> item.getId().equals(saleItemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("SaleItem not found"));

        sale.getSaleItems().remove(saleItem);
        saleItem.setSale(null);

        saleRepository.save(sale);
    }
}
