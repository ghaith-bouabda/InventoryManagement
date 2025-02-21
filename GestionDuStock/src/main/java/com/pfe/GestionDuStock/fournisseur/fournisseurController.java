package com.pfe.GestionDuStock.fournisseur;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/fournisseurs")
@RequiredArgsConstructor
public class fournisseurController {

    private final fournisseurService fournisseurService;

    // Create a new Fournisseur
    @PostMapping
    public ResponseEntity<fournisseur> createFournisseur(@Valid @RequestBody fournisseur fournisseur) {
        fournisseur createdFournisseur = fournisseurService.createFournisseur(fournisseur);
        return new ResponseEntity<>(createdFournisseur, HttpStatus.CREATED);
    }

    // Get a Fournisseur by slug
    @GetMapping("/{slug}")
    public ResponseEntity<fournisseur> getFournisseur(@PathVariable String slug) {
        fournisseur foundFournisseur = fournisseurService.getFournisseurBySlug(slug);
        return new ResponseEntity<>(foundFournisseur, HttpStatus.OK);
    }

    // Update a Fournisseur by slug
    @PutMapping("/{slug}")
    public ResponseEntity<fournisseur> updateFournisseur(@PathVariable String slug,
                                                         @Valid @RequestBody fournisseur fournisseurDetails) {
        fournisseur updatedFournisseur = fournisseurService.updateFournisseurBySlug(slug, fournisseurDetails);
        return new ResponseEntity<>(updatedFournisseur, HttpStatus.OK);
    }

    // Soft delete a Fournisseur by slug
    @DeleteMapping("/{slug}")
    public ResponseEntity<Void> deleteFournisseur(@PathVariable String slug) {
        fournisseurService.deleteFournisseurBySlug(slug);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
