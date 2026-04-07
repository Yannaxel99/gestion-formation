package com.gestionformation.service;

import com.gestionformation.model.*;
import com.gestionformation.repository.EmployeRepository;
import com.gestionformation.repository.ResponsableFormationRepository;
import com.gestionformation.repository.DemandeFormationRepository;
import com.gestionformation.repository.SessionRepository;
import com.gestionformation.repository.InscriptionRepository;
import com.gestionformation.repository.FormationRepository;
import com.gestionformation.repository.OrganismeFormationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FormationService {

    private final EmployeRepository employeRepo;
    private final ResponsableFormationRepository responsableRepo;
    private final DemandeFormationRepository demandeRepo;
    private final SessionRepository sessionRepo;
    private final InscriptionRepository inscriptionRepo;
    private final FormationRepository formationRepo;
    private final OrganismeFormationRepository organismeRepo;

    public FormationService(
            EmployeRepository employeRepo,
            ResponsableFormationRepository responsableRepo,
            DemandeFormationRepository demandeRepo,
            SessionRepository sessionRepo,
            InscriptionRepository inscriptionRepo,
            FormationRepository formationRepo,
            OrganismeFormationRepository organismeRepo) {
        this.employeRepo     = employeRepo;
        this.responsableRepo = responsableRepo;
        this.demandeRepo     = demandeRepo;
        this.sessionRepo     = sessionRepo;
        this.inscriptionRepo = inscriptionRepo;
        this.formationRepo   = formationRepo;
        this.organismeRepo   = organismeRepo;
    }

    public DemandeFormation soumettreDemandeFormation(int idEmploye, int idFormation, String dateDemande) {
        // BUG CORRIGÉ #2 : l'employé était chargé mais jamais lié à la demande.
        // On le récupère maintenant et on l'associe via demande.setEmploye(employe).
        Employe employe = employeRepo.findById(idEmploye)
                .orElseThrow(() -> new RuntimeException("Employe introuvable : " + idEmploye));
        Formation formation = formationRepo.findById(idFormation)
                .orElseThrow(() -> new RuntimeException("Formation introuvable : " + idFormation));

        DemandeFormation demande = new DemandeFormation();
        demande.setDateDemande(dateDemande);
        demande.setStatut("En attente");
        demande.setEmploye(employe);   // ← lien Employe → Demande maintenant établi
        demande.setFormation(formation);
        return demandeRepo.save(demande);
    }

    public DemandeFormation instruireDemande(int idDemande, int idResponsable, boolean accepter) {
        DemandeFormation demande = demandeRepo.findById(idDemande)
                .orElseThrow(() -> new RuntimeException("Demande introuvable : " + idDemande));
        ResponsableFormation responsable = responsableRepo.findById(idResponsable)
                .orElseThrow(() -> new RuntimeException("Responsable introuvable : " + idResponsable));
        demande.setStatut(accepter ? "Acceptee" : "Refusee");
        if (accepter) responsable.ajouterDemande(demande);
        responsableRepo.save(responsable);
        return demandeRepo.save(demande);
    }

    public Inscription inscrireEmploye(int idDemande, int idSession, String dateInscription) {
        DemandeFormation demande = demandeRepo.findById(idDemande)
                .orElseThrow(() -> new RuntimeException("Demande introuvable : " + idDemande));
        if (!demande.getStatut().equalsIgnoreCase("Acceptee"))
            throw new RuntimeException("La demande #" + idDemande + " n'est pas acceptee.");
        Session session = sessionRepo.findById(idSession)
                .orElseThrow(() -> new RuntimeException("Session introuvable : " + idSession));
        Inscription inscription = new Inscription();
        inscription.setDateInscription(dateInscription);
        inscription.setStatut("Active");
        inscription = inscriptionRepo.save(inscription);
        session.ajouterInscription(inscription);
        sessionRepo.save(session);
        demande.setInscription(inscription);
        demandeRepo.save(demande);
        return inscription;
    }

    public Inscription annulerInscription(int idInscription) {
        Inscription inscription = inscriptionRepo.findById(idInscription)
                .orElseThrow(() -> new RuntimeException("Inscription introuvable : " + idInscription));
        if (inscription.getStatut().equalsIgnoreCase("Annulee"))
            throw new RuntimeException("L'inscription #" + idInscription + " est deja annulee.");
        inscription.annuler();
        return inscriptionRepo.save(inscription);
    }

    public Inscription cloturerFormation(int idInscription, String appreciation, String document) {
        Inscription inscription = inscriptionRepo.findById(idInscription)
                .orElseThrow(() -> new RuntimeException("Inscription introuvable : " + idInscription));
        inscription.setAppreciation(appreciation);
        inscription.setDocument(document);
        inscription.valider();
        return inscriptionRepo.save(inscription);
    }

    public List<Formation> consulterCatalogue()                { return formationRepo.findAll(); }
    public List<Session> consulterSessions()                   { return sessionRepo.findAll(); }
    public List<Employe> tousLesEmployes()                     { return employeRepo.findAll(); }
    public List<DemandeFormation> toutesLesDemandes()          { return demandeRepo.findAll(); }
    public void sauvegarderEmploye(Employe e)                  { employeRepo.save(e); }
    public void sauvegarderResponsable(ResponsableFormation r) { responsableRepo.save(r); }
    public void sauvegarderFormation(Formation f)              { formationRepo.save(f); }
    public void sauvegarderSession(Session s)                  { sessionRepo.save(s); }
    public void sauvegarderOrganisme(OrganismeFormation o)     { organismeRepo.save(o); }
}