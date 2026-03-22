package com.gestionformation.service;

import com.gestionformation.model.*;
import com.gestionformation.repository.FormationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FormationService {

    private final FormationRepository repository;

    public FormationService(FormationRepository repository) {
        this.repository = repository;
    }

    public DemandeFormation soumettreDemandeFormation(int idEmploye, int idFormation, String dateDemande) {
        Employe employe = repository.trouverEmployeParId(idEmploye)
                .orElseThrow(() -> new RuntimeException("Employé introuvable : " + idEmploye));
        Formation formation = repository.trouverFormationParId(idFormation)
                .orElseThrow(() -> new RuntimeException("Formation introuvable : " + idFormation));
        int idDemande = repository.toutesLesDemandes().size() + 1;
        DemandeFormation demande = new DemandeFormation(idDemande, dateDemande, "En attente");
        demande.setFormation(formation);
        repository.sauvegarderDemande(demande);
        return demande;
    }

    public DemandeFormation instruireDemande(int idDemande, int idResponsable, boolean accepter) {
        DemandeFormation demande = repository.trouverDemandeParId(idDemande)
                .orElseThrow(() -> new RuntimeException("Demande introuvable : " + idDemande));
        ResponsableFormation responsable = repository.trouverResponsableParId(idResponsable)
                .orElseThrow(() -> new RuntimeException("Responsable introuvable : " + idResponsable));
        demande.setStatut(accepter ? "Acceptée" : "Refusée");
        if (accepter) responsable.ajouterDemande(demande);
        return demande;
    }

    public Inscription inscrireEmploye(int idDemande, int idSession, String dateInscription) {
        DemandeFormation demande = repository.trouverDemandeParId(idDemande)
                .orElseThrow(() -> new RuntimeException("Demande introuvable : " + idDemande));
        if (!demande.getStatut().equalsIgnoreCase("Acceptée"))
            throw new RuntimeException("La demande #" + idDemande + " n'est pas acceptée.");
        Session session = repository.trouverSessionParId(idSession)
                .orElseThrow(() -> new RuntimeException("Session introuvable : " + idSession));
        int idInscription = repository.tousLesInscriptions().size() + 1;
        Inscription inscription = new Inscription(idInscription, dateInscription, "Active");
        session.ajouterInscription(inscription);
        demande.setInscription(inscription);
        repository.sauvegarderInscription(inscription);
        return inscription;
    }

    public Inscription annulerInscription(int idInscription) {
        Inscription inscription = repository.trouverInscriptionParId(idInscription)
                .orElseThrow(() -> new RuntimeException("Inscription introuvable : " + idInscription));
        if (inscription.getStatut().equalsIgnoreCase("Annulée"))
            throw new RuntimeException("L'inscription #" + idInscription + " est déjà annulée.");
        inscription.annuler();
        return inscription;
    }

    public Inscription cloturerFormation(int idInscription, String appreciation, String document) {
        Inscription inscription = repository.trouverInscriptionParId(idInscription)
                .orElseThrow(() -> new RuntimeException("Inscription introuvable : " + idInscription));
        inscription.setAppreciation(appreciation);
        inscription.setDocument(document);
        inscription.valider();
        return inscription;
    }

    public List<Formation> consulterCatalogue() { return repository.toutesLesFormations(); }
    public List<Session> consulterSessions() { return repository.toutesLesSessions(); }
    public List<Employe> tousLesEmployes() { return repository.tousLesEmployes(); }
    public void sauvegarderEmploye(Employe e) { repository.sauvegarderEmploye(e); }
    public void sauvegarderResponsable(ResponsableFormation r) { repository.sauvegarderResponsable(r); }
    public void sauvegarderFormation(Formation f) { repository.sauvegarderFormation(f); }
    public void sauvegarderSession(Session s) { repository.sauvegarderSession(s); }
    public void sauvegarderOrganisme(OrganismeFormation o) { repository.sauvegarderOrganisme(o); }
}