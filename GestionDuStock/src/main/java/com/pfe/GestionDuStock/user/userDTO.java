package com.pfe.GestionDuStock.user;


public record userDTO(
        Long id,
        String username,
        String email,
        Role role) {
}
