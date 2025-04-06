package com.pfe.GestionDuStock.sale;

import com.pfe.GestionDuStock.customer.customer;
import com.pfe.GestionDuStock.customer.customerRepository;
import com.pfe.GestionDuStock.exception.CustomerNotFoundException;
import com.pfe.GestionDuStock.exception.ProductNotFoundException;
import com.pfe.GestionDuStock.exception.SaleNotFoundException;
import com.pfe.GestionDuStock.product.product;
import com.pfe.GestionDuStock.product.productDTO;
import com.pfe.GestionDuStock.product.productMapper;
import com.pfe.GestionDuStock.product.productService;
import com.pfe.GestionDuStock.supplier.supplier;
import com.pfe.GestionDuStock.supplier.supplierDTO;
import com.pfe.GestionDuStock.supplier.supplierMapper;
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
    private final productMapper productMapper;
    private final saleItemMapper saleItemMapper;

    @Transactional
    public sale registerSale(Long customerId, saleDTO saleDTO) {
        customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomerNotFoundException("Customer with ID " + customerId + " not found"));

        sale sale = new sale();
        sale.setSaleDate(LocalDateTime.now());
        sale.setAmount(saleDTO.amount());
        sale.setInvoiceNumber(saleDTO.invoiceNumber());
        sale.setSaleItems(new ArrayList<>());
        sale.setCustomer(customer);

        return processSaleItems(saleDTO, sale);
    }

    @Transactional
    public void addSaleItem(Long saleId, Long productId, Long quantity, Long price) {
        sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new SaleNotFoundException("Sale with ID " + saleId + " not found"));

        productDTO productDTO = productService.getProductById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product with ID " + productId + " not found"));

        supplierDTO supplierdto = productDTO.supplier();
        supplier    supplier = supplierMapper.toEntity(supplierdto); // Get supplier (changed from supplierDTO)

        product product = productMapper.toEntity(productDTO, supplier); // Convert DTO to entity with supplier

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
            // Fetch productDTO from the service
            productDTO productDTO = productService.getProductById(itemDTO.productId())
                    .orElseThrow(() -> new ProductNotFoundException("Product with ID " + itemDTO.productId() + " not found"));

            supplierDTO supplierdto = productDTO.supplier();
            supplier    supplier = supplierMapper.toEntity(supplierdto);
            // Convert productDTO to product entity using supplier
            product product = productMapper.toEntity(productDTO, supplier);

            // Check stock availability
            if (product.getStockQuantity() < itemDTO.quantity()) {
                throw new RuntimeException("Not enough stock for product: " + product.getName());
            }

            // Reduce stock quantity
            productService.reduceProductQuantity(itemDTO.productId(), itemDTO.quantity());

            // Use saleItemMapper to map DTO to entity
            saleItem saleItem = saleItemMapper.toEntity(itemDTO, product.getSupplier());

            saleItem.setSale(sale); // Link saleItem to sale
            sale.getSaleItems().add(saleItem);
        }

        return saleRepository.save(sale);
    }
}
