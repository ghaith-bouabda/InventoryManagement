package com.pfe.GestionDuStock.customer;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface customerRepository extends JpaRepository<customer, Long> {
    Optional<customer>  findByEmail(String email);

    Optional<customer> findById(Long id);

    Optional<customer> findByPhone(String phone);
}
