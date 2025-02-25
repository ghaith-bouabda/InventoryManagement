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

    // Endpoint to save a new customer
    @PostMapping
    public ResponseEntity<customer> saveCustomer(@RequestBody customer customer) {
        customer savedCustomer = customerService.saveCustomer(customer);
        return new ResponseEntity<>(savedCustomer, HttpStatus.CREATED);
    }

    // Endpoint to get all customers
    @GetMapping
    public ResponseEntity<List<customer>> getAllCustomers() {
        List<customer> customers = customerService.getAllCustomers();
        return new ResponseEntity<>(customers, HttpStatus.OK);
    }

    // Endpoint to get a customer by email
    @GetMapping("/email/{email}")
    public ResponseEntity<customer> getCustomerByEmail(@PathVariable String email) {
        customer customer = customerService.getCustomerByEmail(email);
        if (customer != null) {
            return new ResponseEntity<>(customer, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // Endpoint to get a customer by phone
    @GetMapping("/phone/{phone}")
    public ResponseEntity<customer> getCustomerByPhone(@PathVariable String phone) {
        customer customer = customerService.getCustomerByPhone(phone);
        if (customer != null) {
            return new ResponseEntity<>(customer, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // Endpoint to delete a customer by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
