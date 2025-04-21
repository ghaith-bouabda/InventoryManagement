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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class saleService {

    private final productService productService;
    private final saleRepository saleRepository;
    private final customerRepository customerRepository;
    private final productMapper productMapper;
    private final saleItemMapper saleItemMapper;
    private final com.pfe.GestionDuStock.sale.saleMapper saleMapper;
    private String generateInvoiceNumber() {
        String invoiceNumber;
        do {
            invoiceNumber = "INV-" + java.util.UUID.randomUUID(); // Using UUID for guaranteed uniqueness
        } while (saleRepository.findByInvoiceNumber(invoiceNumber).isPresent()); // Check if the invoice number already exists
        return invoiceNumber;
    }


    @Transactional
    public sale registerSale(Long customerId, saleDTO saleDTO) {
        customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomerNotFoundException("Customer with ID " + customerId + " not found"));

        sale sale = new sale();
        sale.setSaleDate(LocalDateTime.now());
        sale.setAmount(saleDTO.amount());
        sale.setInvoiceNumber(generateInvoiceNumber());
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

    @Transactional
    public sale updateSale(Long saleId, saleDTO updatedSaleDTO) {
        sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new SaleNotFoundException("Sale with ID " + saleId + " not found"));

        // Preserve the provided amount
        sale.setAmount(updatedSaleDTO.amount());

        // Clear existing items
        sale.getSaleItems().clear();

        // Process new items
        sale updatedSale = processSaleItems(updatedSaleDTO, sale);

        return updatedSale;
    }


    public Optional<sale> getSaleByInvoiceNumber(String invoiceNumber) {
        return saleRepository.findByInvoiceNumber(invoiceNumber);
    }


    private sale processSaleItems(saleDTO saleDTO, sale sale) {
        // Store original amount
        BigDecimal originalAmount = sale.getAmount();

        for (saleitemDTO itemDTO : saleDTO.saleItems()) {
            productDTO productDTO = productService.getProductById(itemDTO.productId())
                    .orElseThrow(() -> new ProductNotFoundException("Product with ID " + itemDTO.productId() + " not found"));

            supplier supplier = supplierMapper.toEntity(productDTO.supplier());
            product product = productMapper.toEntity(productDTO, supplier);

            if (product.getStockQuantity() < itemDTO.quantity()) {
                throw new RuntimeException("Not enough stock for product: " + product.getName());
            }

            productService.reduceProductQuantity(itemDTO.productId(), itemDTO.quantity());

            saleItem saleItem = saleItemMapper.toEntity(itemDTO, product.getSupplier());
            saleItem.setSale(sale);
            sale.getSaleItems().add(saleItem);
        }

        // Restore original amount
        sale.setAmount(originalAmount);
        return saleRepository.save(sale);
    }

    public Long getTotalSales() {
        return saleRepository.sumTotalAmount();
    }

    public List<saleDTO> getAllSales() {
        return saleRepository.findAll().stream()
                .map(saleMapper::toDTO)
                .collect(Collectors.toList());
    }

}
