package com.pfe.GestionDuStock.fournisseur;

import com.pfe.GestionDuStock.fournisseur.fournisseurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class fournisseurService {

    private final fournisseurRepository fournisseurRepository;



    private String generateUniqueSlug(String nom) {
        // Use UUID to generate a unique string
        String baseSlug = nom.toLowerCase().replaceAll("[^a-z0-9]+", "-");

        // Append a unique UUID
        String uniqueSlug = baseSlug + "-" + UUID.randomUUID().toString().substring(0, 8);

        while (fournisseurRepository.existsBySlug(uniqueSlug)) {
            uniqueSlug = baseSlug + "-" + UUID.randomUUID().toString().substring(0, 8);
        }

        return uniqueSlug;
    }

    public fournisseur createFournisseur(fournisseur fournisseur) {
        String slug = generateUniqueSlug(fournisseur.getNom());
        fournisseur.setSlug(slug);

        return fournisseurRepository.save(fournisseur);
    }

    public fournisseur getFournisseurBySlug(String slug) {
        return fournisseurRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Fournisseur not found with slug: " + slug));
    }

    public fournisseur updateFournisseurBySlug(String slug, fournisseur fournisseurDetails) {
        fournisseur fournisseur = getFournisseurBySlug(slug); // Find existing fournisseur

        fournisseur.setNom(fournisseurDetails.getNom());
        fournisseur.setEmail(fournisseurDetails.getEmail());
        fournisseur.setTelephone(fournisseurDetails.getTelephone());
        fournisseur.setAdresse(fournisseurDetails.getAdresse());
        fournisseur.setContactPerson(fournisseurDetails.getContactPerson());

        if (!fournisseur.getNom().equals(fournisseurDetails.getNom())) {
            String newSlug = generateUniqueSlug(fournisseurDetails.getNom());
            fournisseur.setSlug(newSlug);
        }

        return fournisseurRepository.save(fournisseur);
    }

    public void deleteFournisseurBySlug(String slug) {
        fournisseur fournisseur = getFournisseurBySlug(slug);
    }
}