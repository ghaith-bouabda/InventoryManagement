package com.pfe.GestionDuStock.product;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class productController {

    private final productService productService;

    @PostMapping
    public ResponseEntity<productDTO> createProduct(@RequestBody productDTO productDTO) {
        productDTO savedProduct = productService.saveProduct(productDTO);
        return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<productDTO>> getAllProducts() {
        List<productDTO> products = productService.getAllProducts();
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<productDTO> getProductById(@PathVariable Long id) {
        Optional<productDTO> product = productService.getProductById(id);
        return product.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<productDTO>> getLowStockProducts() {
        List<productDTO> lowStockProducts = productService.getLowStockProducts();
        return new ResponseEntity<>(lowStockProducts, HttpStatus.OK);
    }

    @GetMapping("/out-of-stock")
    public ResponseEntity<List<productDTO>> getOutOfStockProducts() {
        List<productDTO> outOfStockProducts = productService.getOutOfStockProducts();
        return new ResponseEntity<>(outOfStockProducts, HttpStatus.OK);
    }

    @GetMapping("/supplier-count")
    public ResponseEntity<Map<String, Long>> getProductCountBySupplier() {
        Map<String, Long> supplierProductCount = productService.getProductCountBySupplier();
        return new ResponseEntity<>(supplierProductCount, HttpStatus.OK);
    }

}
