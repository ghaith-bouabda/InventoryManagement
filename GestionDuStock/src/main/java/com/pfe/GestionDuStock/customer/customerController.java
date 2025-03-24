package com.pfe.GestionDuStock.customer;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class customerController {

    private final customerService customerService;

    // Create a new customer
    @PostMapping
    public ResponseEntity<customerDTO> saveCustomer(@RequestBody customerDTO customerDTO) {
        customerDTO savedCustomer = customerService.saveCustomer(customerDTO);
        return new ResponseEntity<>(savedCustomer, HttpStatus.CREATED);
    }

    // Get all customers
    @GetMapping
    public ResponseEntity<List<customerDTO>> getAllCustomers() {
        List<customerDTO> customers = customerService.getAllCustomers();
        return new ResponseEntity<>(customers, HttpStatus.OK);
    }

    // Get customer by email
    @GetMapping("/email/{email}")
    public ResponseEntity<customerDTO> getCustomerByEmail(@PathVariable String email) {
        customerDTO customer = customerService.getCustomerByEmail(email);
        return customer != null ?
                new ResponseEntity<>(customer, HttpStatus.OK) :
                new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // Get customer by phone
    @GetMapping("/phone/{phone}")
    public ResponseEntity<customerDTO> getCustomerByPhone(@PathVariable String phone) {
        customerDTO customer = customerService.getCustomerByPhone(phone);
        return customer != null ?
                new ResponseEntity<>(customer, HttpStatus.OK) :
                new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // Delete a customer by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
