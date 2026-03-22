package com.gestionformation.controller;

import com.gestionformation.model.*;
import com.gestionformation.service.FormationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")  // autorise le front-end de ton binôme à appeler l'API
public class Formationcontroller {

    private final FormationService service;

    // Spring injecte automatiquement le service ici
    public Formationcontroller(FormationService service) {
        this.service = service;
    }

    // ══════════════════════════════════════════════════════════════
    // CATALOGUE & SESSIONS  —  GET
    // ══════════════════════════════════════════════════════════════

    // GET /api/formations  →  retourne toutes les formations
    @GetMapping("/formations")
    public ResponseEntity<List<Formation>> getCatalogue() {
        return ResponseEntity.ok(service.consulterCatalogue());
    }

    // GET /api/sessions  →  retourne toutes les sessions disponibles
    @GetMapping("/sessions")
    public ResponseEntity<List<Session>> getSessions() {
        return ResponseEntity.ok(service.consulterSessions());
    }

    // GET /api/employes  →  retourne tous les employés
    @GetMapping("/employes")
    public ResponseEntity<List<Employe>> getEmployes() {
        return ResponseEntity.ok(service.tousLesEmployes());
    }

    // ══════════════════════════════════════════════════════════════
    // DONNÉES DE BASE  —  POST (ajout d'employés, formations, etc.)
    // ══════════════════════════════════════════════════════════════

    // POST /api/employes  →  ajouter un employé
    @PostMapping("/employes")
    public ResponseEntity<String> ajouterEmploye(@RequestBody Employe employe) {
        service.sauvegarderEmploye(employe);
        return ResponseEntity.ok("Employé ajouté : " + employe.getNom());
    }

    // POST /api/responsables  →  ajouter un responsable
    @PostMapping("/responsables")
    public ResponseEntity<String> ajouterResponsable(@RequestBody ResponsableFormation responsable) {
        service.sauvegarderResponsable(responsable);
        return ResponseEntity.ok("Responsable ajouté : " + responsable.getNom());
    }

    // POST /api/formations  →  ajouter une formation au catalogue
    @PostMapping("/formations")
    public ResponseEntity<String> ajouterFormation(@RequestBody Formation formation) {
        service.sauvegarderFormation(formation);
        return ResponseEntity.ok("Formation ajoutée : " + formation.getNomFormation());
    }

    // POST /api/sessions  →  ajouter une session
    @PostMapping("/sessions")
    public ResponseEntity<String> ajouterSession(@RequestBody Session session) {
        service.sauvegarderSession(session);
        return ResponseEntity.ok("Session ajoutée : " + session.getDate());
    }

    // ══════════════════════════════════════════════════════════════
    // PROCESSUS MÉTIER  —  étapes du diagramme d'activités
    // ══════════════════════════════════════════════════════════════

    // POST /api/demandes  →  ÉTAPE 1 : soumettre une demande de formation
    // Body JSON attendu : { "idEmploye": 1, "idFormation": 1, "dateDemande": "2025-07-01" }
    @PostMapping("/demandes")
    public ResponseEntity<DemandeFormation> soumettreDemandeFormation(@RequestBody Map<String, String> body) {
        int idEmploye = Integer.parseInt(body.get("idEmploye"));
        int idFormation = Integer.parseInt(body.get("idFormation"));
        String dateDemande = body.get("dateDemande");

        DemandeFormation demande = service.soumettreDemandeFormation(idEmploye, idFormation, dateDemande);
        return ResponseEntity.ok(demande);
    }

    // PUT /api/demandes/{id}/instruire  →  ÉTAPE 2 : le responsable instruit la demande
    // Body JSON attendu : { "idResponsable": 2, "accepter": true }
    @PutMapping("/demandes/{id}/instruire")
    public ResponseEntity<DemandeFormation> instruireDemande(
            @PathVariable int id,
            @RequestBody Map<String, String> body) {

        int idResponsable = Integer.parseInt(body.get("idResponsable"));
        boolean accepter = Boolean.parseBoolean(body.get("accepter"));

        DemandeFormation demande = service.instruireDemande(id, idResponsable, accepter);
        return ResponseEntity.ok(demande);
    }

    // POST /api/inscriptions  →  ÉTAPE 3 : inscrire l'employé à une session
    // Body JSON attendu : { "idDemande": 1, "idSession": 1, "dateInscription": "2025-07-05" }
    @PostMapping("/inscriptions")
    public ResponseEntity<Inscription> inscrireEmploye(@RequestBody Map<String, String> body) {
        int idDemande = Integer.parseInt(body.get("idDemande"));
        int idSession = Integer.parseInt(body.get("idSession"));
        String dateInscription = body.get("dateInscription");

        Inscription inscription = service.inscrireEmploye(idDemande, idSession, dateInscription);
        return ResponseEntity.ok(inscription);
    }

    // PUT /api/inscriptions/{id}/annuler  →  ÉTAPE 4 : annuler suite à un empêchement
    @PutMapping("/inscriptions/{id}/annuler")
    public ResponseEntity<Inscription> annulerInscription(@PathVariable int id) {
        Inscription inscription = service.annulerInscription(id);
        return ResponseEntity.ok(inscription);
    }

    // PUT /api/inscriptions/{id}/cloturer  →  ÉTAPE 5 : clôturer la formation
    // Body JSON attendu : { "appreciation": "Très bien", "document": "attestation.pdf" }
    @PutMapping("/inscriptions/{id}/cloturer")
    public ResponseEntity<Inscription> cloturerFormation(
            @PathVariable int id,
            @RequestBody Map<String, String> body) {

        String appreciation = body.get("appreciation");
        String document = body.get("document");

        Inscription inscription = service.cloturerFormation(id, appreciation, document);
        return ResponseEntity.ok(inscription);
    }

    // ══════════════════════════════════════════════════════════════
    // GESTION DES ERREURS
    // ══════════════════════════════════════════════════════════════
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleError(RuntimeException e) {
        return ResponseEntity.badRequest().body("Erreur : " + e.getMessage());
    }
}