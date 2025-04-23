package com.pfe.GestionDuStock.purchase;

import com.pfe.GestionDuStock.product.product;
import com.pfe.GestionDuStock.product.productMapper;
import com.pfe.GestionDuStock.product.productRepository;
import com.pfe.GestionDuStock.supplier.supplier;
import com.pfe.GestionDuStock.supplier.supplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class purchaseService {

    private final purchaseRepository purchaseRepository;
    private final productRepository productRepository;
    private final supplierRepository supplierRepository;
    private final purchaseItemRepository purchaseItemRepository;
    private final productMapper productMapper;
    private final com.pfe.GestionDuStock.product.productService productService;

    @Transactional
    public purchaseDTO savePurchase(purchaseDTO dto) {
        // Validate that the supplier exists
        supplier supplier = supplierRepository.findById(dto.supplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        // Create new purchase
        purchase purchase = new purchase();
        purchase.setSupplier(supplier);
        purchase.setPurchaseDate(dto.purchaseDate());
        purchase.setInvoiceNumber(dto.invoiceNumber() != null ? dto.invoiceNumber() : generateInvoiceNumber());
        purchase.setApproved(false);
        purchase.setStatus("Pending");

        List<purchaseItem> purchaseItems = new ArrayList<>();
        double totalAmount = 0;

        for (purchaseItemDTO itemDTO : dto.purchaseItems()) {
            product product = findOrReactivateProduct(itemDTO, supplier);

            // Create and add purchase item
            purchaseItem item = new purchaseItem();
            item.setProduct(product);
            item.setName(itemDTO.name());
            item.setStockThreshold(itemDTO.stockThreshold());
            item.setQuantity(itemDTO.quantity());
            item.setPrice(itemDTO.price());
            item.setPurchase(purchase);
            purchaseItems.add(item);

            totalAmount += itemDTO.quantity() * itemDTO.price();
        }

        // Save the purchase first
        purchase.setTotalAmount(totalAmount);
        purchase.setQuantity((int) purchaseItems.stream().mapToLong(purchaseItem::getQuantity).sum());
        purchaseRepository.save(purchase);

        // Save purchase items separately
        purchaseItemRepository.saveAll(purchaseItems);

        // Update stock quantities *after* saving the purchase
        for (purchaseItem item : purchaseItems) {
            product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            product.setStockThreshold(product.getStockThreshold());
            productRepository.save(product);
        }

        return purchaseMapper.toDTO(purchase);
    }

    // Helper method to create new product if not found
    private product createNewProduct(purchaseItemDTO itemDTO, supplier supplier) {
        product newProduct = new product();
        newProduct.setName(itemDTO.name());
        newProduct.setPrice(itemDTO.price());
        newProduct.setStockQuantity(0L); // Initial quantity
        newProduct.setStockThreshold(itemDTO.stockThreshold()); // Default threshold
        newProduct.setSupplier(supplier);
        productRepository.save(newProduct);
        return newProduct;
         // Save new product
    }

    // Get all purchases
    public List<purchaseDTO> getAllPurchases() {
        return purchaseRepository.findAll().stream()
                .map(purchaseMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<purchaseDTO> getPurchaseBySupplierSlug(String slug) {
        return purchaseRepository.findBySupplierSlug(slug)
                .stream()  // You need to convert the result to a stream
                .map(purchaseMapper::toDTO)  // Map each result to a DTO
                .collect(Collectors.toList());  // Collect the results into a list
    }
    public Long getTotalPurchases() {
        return purchaseRepository.sumTotalAmount();
    }
    // Get purchase by invoice number
    public Optional<purchaseDTO> getPurchaseByInvoiceNumber(String invoiceNumber) {
        return purchaseRepository.findByInvoiceNumber(invoiceNumber)
                .map(purchaseMapper::toDTO);
    }

    @Transactional
    public void deletePurchase(String invoiceNumber) {
        purchaseRepository.deleteByInvoiceNumber(invoiceNumber);
    }
    private String generateInvoiceNumber() {
        String invoiceNumber;
        do {
            invoiceNumber = "INV-" + java.util.UUID.randomUUID(); // Using UUID for guaranteed uniqueness
        } while (purchaseRepository.findByInvoiceNumber(invoiceNumber).isPresent()); // Check if the invoice number already exists
        return invoiceNumber;
    }

    @Transactional
    public purchaseDTO updatePurchase(String invoiceNumber, purchaseDTO dto) {
        // Find existing purchase
        purchase existingPurchase = purchaseRepository.findByInvoiceNumber(invoiceNumber)
                .orElseThrow(() -> new RuntimeException("Purchase not found"));

        // Validate supplier
        supplier supplier = supplierRepository.findById(dto.supplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        reduceStockByOriginalQuantities(existingPurchase.getPurchaseItems());
        existingPurchase.setSupplier(supplier);
        existingPurchase.setPurchaseDate(dto.purchaseDate());
        existingPurchase.setStatus(dto.status());

        // Clear existing items
        purchaseItemRepository.deleteAll(existingPurchase.getPurchaseItems());
        existingPurchase.getPurchaseItems().clear();

        // Process new items
        List<purchaseItem> purchaseItems = new ArrayList<>();
        double totalAmount = 0;

        for (purchaseItemDTO itemDTO : dto.purchaseItems()) {
            product product = findOrReactivateProduct(itemDTO, supplier);

            // Create and add purchase item
            purchaseItem item = new purchaseItem();
            item.setProduct(product);
            item.setName(itemDTO.name());
            item.setStockThreshold(itemDTO.stockThreshold());
            item.setQuantity(itemDTO.quantity());
            item.setPrice(itemDTO.price());
            item.setPurchase(existingPurchase);
            purchaseItems.add(item);

            totalAmount += itemDTO.quantity() * itemDTO.price();
        }

        // Update purchase with new items and amount
        existingPurchase.setTotalAmount(totalAmount);
        existingPurchase.setQuantity((int) purchaseItems.stream().mapToLong(purchaseItem::getQuantity).sum());

        // Save the updated purchase
        purchaseRepository.save(existingPurchase);
        purchaseItemRepository.saveAll(purchaseItems);

        // Update stock quantities
        updateProductStocks(purchaseItems);

        return purchaseMapper.toDTO(existingPurchase);
    }
    private void reduceStockByOriginalQuantities(List<purchaseItem> originalItems) {
        for (purchaseItem item : originalItems) {
            product product = item.getProduct();
            long newStock = product.getStockQuantity() - item.getQuantity();
            if (newStock < 0) {
                throw new RuntimeException("Cannot reduce stock below 0 for product: " + product.getName());
            }
            product.setStockQuantity(newStock);
            productRepository.save(product);
        }
    }


    private void updateProductStocks(List<purchaseItem> items) {
        for (purchaseItem item : items) {
            // Always reload the product from DB to get accurate stock
            product dbProduct = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            long newStock = dbProduct.getStockQuantity() + item.getQuantity();
            dbProduct.setStockQuantity(newStock- dbProduct.getStockQuantity());
            dbProduct.setStockThreshold(item.getStockThreshold());
            productRepository.save(dbProduct);
        }
    }

    public int importPurchasesFromFile(MultipartFile file) throws Exception {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty.");
        }

        List<purchase> purchases = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            boolean isFirstLine = true;

            while ((line = reader.readLine()) != null) {
                if (isFirstLine) {
                    isFirstLine = false;
                    continue;
                }

                String[] data = line.split(",");

                if (data.length < 7) continue;

                String supplierName = data[0].trim();
                String dateString = data[1].trim();
                int quantity = Integer.parseInt(data[2].trim());
                double totalAmount = Double.parseDouble(data[3].trim());
                boolean approved = Boolean.parseBoolean(data[4].trim());
                String status = data[5].trim();

                supplier supplier = supplierRepository.findByName(supplierName);
                if (supplier == null) continue;

                Date purchaseDate = new SimpleDateFormat("yyyy-MM-dd HH:mm").parse(dateString);

                purchase  newPurchase = purchase.builder()
                        .supplier(supplier)
                        .purchaseDate(purchaseDate)
                        .quantity(quantity)
                        .totalAmount(totalAmount)
                        .approved(approved)
                        .status(status)
                        .build();

                purchases.add(newPurchase);
            }
        }

        purchaseRepository.saveAll(purchases);
        return purchases.size();
    }
    private product findOrReactivateProduct(purchaseItemDTO itemDTO, supplier supplier) {
        // First, check if there's an active product
        Optional<product> activeProduct = productRepository.findByNameAndSupplierIdAndIsDeletedFalse(
                itemDTO.name(), supplier.getId()
        );
        if (activeProduct.isPresent()) {
            return activeProduct.get();
        }

        // Then, check if there's a deleted product to reactivate
        Optional<product> deletedProduct = productRepository.findByNameAndSupplierIdAndIsDeletedTrue(
                itemDTO.name(), supplier.getId()
        );
        if (deletedProduct.isPresent()) {
            product p = deletedProduct.get();
            p.setDeleted(false);
            p.setPrice(itemDTO.price());
            p.setStockQuantity(itemDTO.quantity());
            p.setStockThreshold(itemDTO.stockThreshold());
            return productRepository.save(p);
        }

        // Otherwise, create a new product
        return createNewProduct(itemDTO, supplier);
    }

}
