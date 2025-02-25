package com.pfe.GestionDuStock.customer;

import org.springframework.data.jpa.repository.JpaRepository;

public interface customerRepository extends JpaRepository<customer, Long> {
    customer findByEmail(String email);

    customer findByPhone(String phone);
}
