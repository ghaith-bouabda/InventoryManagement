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
import org.springframework.data.domain.PageRequest;
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
        // 1. Validate customer exists
        customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found"));

        // 2. Create new sale
        sale sale = new sale();
        sale.setCustomer(customer);
        sale.setSaleDate(LocalDateTime.now());
        sale.setInvoiceNumber(generateInvoiceNumber());
        sale.setSaleItems(new ArrayList<>());

        // 3. Process each sale item WITH CURRENT PRICES
        double totalAmount = 0;
        for (saleitemDTO itemDTO : saleDTO.saleItems()) {
            // Get current product state
            productDTO productDTO = productService.getProductById(itemDTO.productId())
                    .orElseThrow(() -> new ProductNotFoundException("Product not found"));

            // Validate sufficient stock
            if (productDTO.stockQuantity() < itemDTO.quantity()) {
                throw new RuntimeException("Insufficient stock for product: " + productDTO.name());
            }

            // Use CURRENT PRODUCT PRICE, not the one from request
            Double currentPrice = productDTO.price();
            totalAmount += currentPrice * itemDTO.quantity();

            // Reduce stock
            productService.reduceProductQuantity(itemDTO.productId(), itemDTO.quantity());

            // Create sale item WITH CURRENT PRICE
            saleItem saleItem = new saleItem();
            saleItem.setProduct(productMapper.toEntity(productDTO,supplierMapper.toEntity(productDTO.supplier())));
            saleItem.setQuantity(itemDTO.quantity());
            saleItem.setPrice(currentPrice); // <-- THIS IS CRUCIAL
            saleItem.setSale(sale);

            sale.getSaleItems().add(saleItem);
        }

        // 4. Set the calculated amount
        sale.setAmount(BigDecimal.valueOf(totalAmount));

        // 5. Save and return
        return saleRepository.save(sale);
    }

    @Transactional
    public void addSaleItem(Long saleId, Long productId, Long quantity, Double price) {
        sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new SaleNotFoundException("Sale with ID " + saleId + " not found"));

        productDTO productDTO = productService.getProductById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product with ID " + productId + " not found"));

        supplierDTO supplierdto = productDTO.supplier();
        supplier supplier = supplierMapper.toEntity(supplierdto); // Get supplier (changed from supplierDTO)

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

            // Add validation for quantity
            if (itemDTO.quantity() <= 0) {
                throw new RuntimeException("Invalid quantity for product: " + product.getName());
            }

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


    @Transactional
    public void deleteSale(String invoiceNumber) {
        // Retrieve the sale by invoice number
        sale sale = saleRepository.findByInvoiceNumber(invoiceNumber)
                .orElseThrow(() -> new SaleNotFoundException("Sale with InvoiceNumber " + invoiceNumber + " not found"));

        // For each sale item, restore the stock quantity of the product
        for (saleItem saleItem : sale.getSaleItems()) {
            product product = saleItem.getProduct();
            // Add the quantity sold back to the stock
            product.setStockQuantity(product.getStockQuantity() + saleItem.getQuantity());

            // Convert product entity to productDTO and update the product in the database
            productDTO productDTO = productMapper.toDTO(product);  // Convert entity to DTO
            productService.updateProduct(product.getId(), productDTO); // Call the update method with ID and DTO
        }

        // Now delete the sale
        saleRepository.delete(sale);
    }


}
