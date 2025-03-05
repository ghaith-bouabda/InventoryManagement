package com.pfe.GestionDuStock.product;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class productController {

    private final productService productService;

    @PostMapping
    public ResponseEntity<product> createProduct(@RequestBody product product) {
        product savedProduct = productService.saveProduct(product);
        return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<product>> getAllProducts() {
        List<product> products = productService.getAllProducts();
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<product> getProductById(@PathVariable Long id) {
        Optional<product> product = productService.getProductById(id);
        return product.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<product>> getLowStockProducts() {
        List<product> lowStockProducts = productService.getLowStockProducts();
        return new ResponseEntity<>(lowStockProducts, HttpStatus.OK);
    }

    @GetMapping("/out-of-stock")
    public ResponseEntity<List<product>> getOutOfStockProducts() {
        List<product> outOfStockProducts = productService.getOutOfStockProducts();
        return new ResponseEntity<>(outOfStockProducts, HttpStatus.OK);
    }

    @GetMapping("/category-count")
    public ResponseEntity<List<ProductCategoryDTO>> getProductsByCategoryCount() {
        List<ProductCategoryDTO> categoryCount = productService.getProductsByCategoryCount();
        return new ResponseEntity<>(categoryCount, HttpStatus.OK);
    }
}
