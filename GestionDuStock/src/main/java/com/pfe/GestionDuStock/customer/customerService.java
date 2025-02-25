package com.pfe.GestionDuStock.customer;

import com.pfe.GestionDuStock.exception.CustomerNotFoundException;
import com.pfe.GestionDuStock.exception.DuplicateEmailException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class customerService {


    final private customerRepository customerRepository;


    public customer saveCustomer(customer customer) {
        if (customerRepository.findByEmail(customer.getEmail()) != null) {
            throw new DuplicateEmailException("Email " + customer.getEmail() + " is already in use");
        }
        return customerRepository.save(customer);
    }
    public List<customer> getAllCustomers() {
        if (customerRepository.findAll().isEmpty()) {throw new RuntimeException("no customers found");}
        return customerRepository.findAll();
    }

    public void deleteCustomer(Long id) {
        customerRepository.deleteById(id);
    }


    public customer getCustomerByEmail(String email) {
        return customerRepository.findByEmail(email)
                .orElseThrow(() -> new CustomerNotFoundException("Customer with email " + email + " not found"));
    }

    public customer getCustomerByPhone(String phone) {
        return customerRepository.findByPhone(phone)
                .orElseThrow(() -> new CustomerNotFoundException("Customer with phone " + phone + " not found"));
    }
}
