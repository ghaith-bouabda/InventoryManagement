package com.pfe.GestionDuStock.sale;

import com.pfe.GestionDuStock.customer.customer;
import com.pfe.GestionDuStock.customer.customerRepository;
import com.pfe.GestionDuStock.exception.CustomerNotFoundException;
import com.pfe.GestionDuStock.exception.ProductNotFoundException;
import com.pfe.GestionDuStock.exception.SaleNotFoundException;
import com.pfe.GestionDuStock.product.product;
import com.pfe.GestionDuStock.product.productService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

@Service
@AllArgsConstructor
public class saleService {

    private final productService productService;
    private final saleRepository saleRepository;
    private final customerRepository customerRepository;

    @Transactional
    public sale registerSale(Long customerId, saleDTO saleDTO) {
        customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomerNotFoundException("Customer with ID " + customerId + " not found"));

        sale sale = new sale();
        sale.setSaleDate(LocalDateTime.now());
        sale.setSaleItems(new ArrayList<>());
        sale.setCustomer(customer);

        return processSaleItems(saleDTO, sale);
    }

    @Transactional
    public void addSaleItem(Long saleId, Long productId, Long quantity, Long price) {
        sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new SaleNotFoundException("Sale with ID " + saleId + " not found"));

        product product = productService.getProductById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product with ID " + productId + " not found"));

        if (product.getStockQuantity() < quantity) {
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

    @Transactional
    public void removeSaleItem(Long saleId, Long saleItemId) {
        sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new SaleNotFoundException("Sale with ID " + saleId + " not found"));

        saleItem saleItem = sale.getSaleItems().stream()
                .filter(item -> item.getId().equals(saleItemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("SaleItem with ID " + saleItemId + " not found"));

        sale.getSaleItems().remove(saleItem);
        saleItem.setSale(null);
        saleRepository.save(sale);
    }

    public sale updateSale(Long saleId, saleDTO updatedSaleDTO) {
        sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new SaleNotFoundException("Sale with ID " + saleId + " not found"));

        sale.getSaleItems().clear();  // Remove old sale items

        return processSaleItems(updatedSaleDTO, sale);
    }

    public Optional<sale> getSaleByInvoiceNumber(String invoiceNumber) {
        return saleRepository.findByInvoiceNumber(invoiceNumber);
    }



    private sale processSaleItems(saleDTO saleDTO, sale sale) {
        for (saleitemDTO itemDTO : saleDTO.saleItems()) {
            product product = productService.getProductById(itemDTO.productId())
                    .orElseThrow(() -> new ProductNotFoundException("Product with ID " + itemDTO.productId() + " not found"));

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
}
