package com.pfe.GestionDuStock.supplier;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class supplierService {

    private final supplierRepository supplierRepository;

    private String generateUniqueSlug(String nom) {
        String baseSlug = nom.toLowerCase().replaceAll("[^a-z0-9]+", "-");
        String uniqueSlug = baseSlug + "-" + UUID.randomUUID().toString().substring(0, 8);

        while (supplierRepository.existsBySlug(uniqueSlug)) {
            uniqueSlug = baseSlug + "-" + UUID.randomUUID().toString().substring(0, 8);
        }

        return uniqueSlug;
    }

    // Create a supplier
    public supplierDTO createSupplier(supplierDTO supplierDTO) {
        supplier entity = supplierMapper.toEntity(supplierDTO);
        String slug = generateUniqueSlug(supplierDTO.name());
        entity.setSlug(slug);
        supplier savedSupplier = supplierRepository.save(entity);
        return supplierMapper.toDTO(savedSupplier);
    }

    // Get supplier by slug
    public supplierDTO getSupplierBySlug(String slug) {
        supplier supplier = supplierRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Supplier not found with slug: " + slug));
        return supplierMapper.toDTO(supplier);
    }

    // Get all suppliers
    public List<supplierDTO> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(supplierMapper::toDTO)
                .collect(Collectors.toList());
    }

    // Update supplier by slug
    public supplierDTO updateSupplierBySlug(String slug, supplierDTO supplierDetails) {
        supplier supplier = supplierRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Supplier not found with slug: " + slug));

        supplier.setName(supplierDetails.name());
        supplier.setEmail(supplierDetails.email());
        supplier.setTelephone(supplierDetails.telephone());
        supplier.setAdresse(supplierDetails.adresse());
        supplier.setContactPerson(supplierDetails.contactPerson());

        if (!supplier.getName().equals(supplierDetails.name())) {
            String newSlug = generateUniqueSlug(supplierDetails.name());
            supplier.setSlug(newSlug);
        }

        supplier updatedSupplier = supplierRepository.save(supplier);
        return supplierMapper.toDTO(updatedSupplier);
    }

    // Soft delete a supplier by slug
    public void deleteSupplierBySlug(String slug) {
        supplier supplier = supplierRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Supplier not found with slug: " + slug));
        supplier.setDeleted(true);
        supplierRepository.save(supplier);
    }
}
