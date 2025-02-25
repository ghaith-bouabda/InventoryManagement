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

    public sale registerSale(Long customerId,saleDTO saleDTO) {
        customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        // Create a new sale instance and link it to the customer
        sale sale = new sale();
        sale.setSaleDate(LocalDateTime.now());
        sale.setSaleItems(new ArrayList<>());
        sale.setCustomer(customer);  // ✅ Associate the sale with the customer



        // Loop through the sale items DTO and create saleItems
        for (saleitemDTO itemDTO : saleDTO.saleItems()) {
            // Fetch the product by ID from the productService
            product product = productService.getProductById(itemDTO.productId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            // Create a saleItem object and set the necessary fields
            saleItem saleItem = new saleItem();
            saleItem.setProduct(product);
            saleItem.setQuantity(itemDTO.quantity());
            saleItem.setPrice(itemDTO.price());
            saleItem.setSale(sale);  // Set the relationship back to the sale

            // Add the saleItem to the sale's saleItems list
            sale.getSaleItems().add(saleItem);
        }

        // Save the sale to the repository and return the saved sale
        return saleRepository.save(sale);
    }

    public void addSaleItem(Long saleId, Long productId, Long quantity, Long price) {
        sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new RuntimeException("Sale not found"));

        product product = productService.getProductById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Create the saleItem
        saleItem saleItem = new saleItem();
        saleItem.setProduct(product);
        saleItem.setQuantity(quantity);
        saleItem.setPrice(price);
        saleItem.setSale(sale); // Set the relationship back to the sale

        // Add the new saleItem to the sale's saleItems list
        sale.getSaleItems().add(saleItem);

        // Save the updated sale
        saleRepository.save(sale);
    }

    public void removeSaleItem(Long saleId, Long saleItemId) {
        // Find the sale by ID, throw exception if not found
        sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new RuntimeException("Sale not found"));

        // Find the saleItem by ID, throw exception if not found
        saleItem saleItem = sale.getSaleItems().stream()
                .filter(item -> item.getId().equals(saleItemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("SaleItem not found"));

        // Remove the saleItem from the sale's saleItems list
        sale.getSaleItems().remove(saleItem);
        saleItem.setSale(null); // Remove the relationship between sale and saleItem

        // Save the updated sale
        saleRepository.save(sale);
    }
}
