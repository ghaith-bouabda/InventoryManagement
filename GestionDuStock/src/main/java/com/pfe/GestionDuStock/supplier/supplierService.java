package com.pfe.GestionDuStock.supplier;

import lombok.RequiredArgsConstructor;
import org.aspectj.weaver.ast.Not;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class supplierService {

    private final supplierRepository supplierRepository;



    private String generateUniqueSlug(String nom) {
        // Use UUID to generate a unique string
        String baseSlug = nom.toLowerCase().replaceAll("[^a-z0-9]+", "-");

        // Append a unique UUID
        String uniqueSlug = baseSlug + "-" + UUID.randomUUID().toString().substring(0, 8);

        while (supplierRepository.existsBySlug(uniqueSlug)) {
            uniqueSlug = baseSlug + "-" + UUID.randomUUID().toString().substring(0, 8);
        }

        return uniqueSlug;
    }

    public supplier createSupplier(supplier supplier) {
        String slug = generateUniqueSlug(supplier.getNom());
        supplier.setSlug(slug);

        return supplierRepository.save(supplier);
    }

    public supplier getSupplierBySlug(String slug) {
        return supplierRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Fournisseur not found with slug: " + slug));
    }

    public supplier updateSupplierBySlug(String slug, supplier supplierDetails) {
        supplier supplier = getSupplierBySlug(slug);

        supplier.setNom(supplierDetails.getNom());
        supplier.setEmail(supplierDetails.getEmail());
        supplier.setTelephone(supplierDetails.getTelephone());
        supplier.setAdresse(supplierDetails.getAdresse());
        supplier.setContactPerson(supplierDetails.getContactPerson());

        if (!supplier.getNom().equals(supplierDetails.getNom())) {
            String newSlug = generateUniqueSlug(supplierDetails.getNom());
            supplier.setSlug(newSlug);
        }

        return supplierRepository.save(supplier);
    }

    public void deleteSupplierBySlug(String slug) {
        supplier supplier = getSupplierBySlug(slug);
        supplier.setDeleted(true);}
}