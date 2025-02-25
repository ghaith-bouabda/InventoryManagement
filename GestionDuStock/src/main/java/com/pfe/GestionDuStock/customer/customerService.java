package com.pfe.GestionDuStock.customer;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class customerService {


    final private customerRepository customerRepository;



    public customer saveCustomer(customer customer) {
        return customerRepository.save(customer);
    }

    public List<customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public void deleteCustomer(Long id) {
        customerRepository.deleteById(id);
    }


    public customer getCustomerByEmail(String email) {
        return customerRepository.findByEmail(email);
    }

    public customer getCustomerByPhone(String phone) {
        return customerRepository.findByPhone(phone);
    }
}
