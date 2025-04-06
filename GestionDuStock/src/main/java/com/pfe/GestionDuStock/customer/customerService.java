package com.pfe.GestionDuStock.customer;

import com.pfe.GestionDuStock.exception.CustomerNotFoundException;
import com.pfe.GestionDuStock.exception.DuplicateEmailException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class customerService {

    private final customerRepository customerRepository;

    @Transactional
    public customerDTO saveCustomer(customerDTO customerDTO) {
        if (customerRepository.findByEmail(customerDTO.email()).isPresent()) {
            throw new DuplicateEmailException("Email " + customerDTO.email() + " is already in use");
        }

        customer customer = customerMapper.toEntity(customerDTO);

        customer savedCustomer = customerRepository.save(customer);

        return customerMapper.toDTO(savedCustomer);
    }
    @Transactional
    public customerDTO UpdateCustomer(customerDTO customerDTO) {
        customer customer = customerRepository.findById(customerDTO.id()).orElseThrow(
                () -> new CustomerNotFoundException("Customer not found")
        );
        if (customerRepository.findByEmail(customerDTO.email())
                .filter(existingCustomer -> !existingCustomer.getId().equals(customerDTO.id()))
                .isPresent()) {
            throw new DuplicateEmailException("Email " + customerDTO.email() + " is already in use");
        }
        customer.setCustomerName(customerDTO.customerName());
        customer.setEmail(customerDTO.email());
        customer.setAddress(customerDTO.address());
        customer.setPhone(customerDTO.phone());
        customer savedCustomer = customerRepository.save(customer);
        return customerMapper.toDTO(savedCustomer);

}
    // Get all customers
    public List<customerDTO> getAllCustomers() {
        List<customer> customers = customerRepository.findAll();

        if (customers.isEmpty()) {
            throw new RuntimeException("No customers found");
        }

        return customers.stream()
                .map(customerMapper::toDTO)  // Convert each customer to DTO
                .toList();
    }

    // Delete customer by ID
    public void deleteCustomer(Long id) {
        customerRepository.deleteById(id);
    }

    // Get customer by email
    public customerDTO getCustomerByEmail(String email) {
        customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new CustomerNotFoundException("Customer with email " + email + " not found"));

        return customerMapper.toDTO(customer);  // Return as DTO
    }

    // Get customer by phone
    public customerDTO getCustomerByPhone(String phone) {
        customer customer = customerRepository.findByPhone(phone)
                .orElseThrow(() -> new CustomerNotFoundException("Customer with phone " + phone + " not found"));

        return customerMapper.toDTO(customer);  // Return as DTO
    }
}
