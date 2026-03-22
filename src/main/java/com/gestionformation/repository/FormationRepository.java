package com.gestionformation.repository;

import com.gestionformation.model.*;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class FormationRepository {

    private List<Employe> employes = new ArrayList<>();
    private List<ResponsableFormation> responsables = new ArrayList<>();
    private List<DemandeFormation> demandes = new ArrayList<>();
    private List<Session> sessions = new ArrayList<>();
    private List<Inscription> inscriptions = new ArrayList<>();
    private List<Formation> formations = new ArrayList<>();
    private List<OrganismeFormation> organismes = new ArrayList<>();

    public void sauvegarderEmploye(Employe e) { employes.add(e); }
    public Optional<Employe> trouverEmployeParId(int id) {
        return employes.stream().filter(e -> e.getNumeroEmploye() == id).findFirst();
    }
    public List<Employe> tousLesEmployes() { return employes; }

    public void sauvegarderResponsable(ResponsableFormation r) { responsables.add(r); }
    public Optional<ResponsableFormation> trouverResponsableParId(int id) {
        return responsables.stream().filter(r -> r.getNumeroEmploye() == id).findFirst();
    }

    public void sauvegarderDemande(DemandeFormation d) { demandes.add(d); }
    public Optional<DemandeFormation> trouverDemandeParId(int id) {
        return demandes.stream().filter(d -> d.getNumeroDemande() == id).findFirst();
    }
    public List<DemandeFormation> toutesLesDemandes() { return demandes; }

    public void sauvegarderSession(Session s) { sessions.add(s); }
    public Optional<Session> trouverSessionParId(int id) {
        return sessions.stream().filter(s -> s.getIdSession() == id).findFirst();
    }
    public List<Session> toutesLesSessions() { return sessions; }

    public void sauvegarderInscription(Inscription i) { inscriptions.add(i); }
    public Optional<Inscription> trouverInscriptionParId(int id) {
        return inscriptions.stream().filter(i -> i.getIdInscription() == id).findFirst();
    }

    public void sauvegarderFormation(Formation f) { formations.add(f); }
    public Optional<Formation> trouverFormationParId(int id) {
        return formations.stream().filter(f -> f.getNumeroFormation() == id).findFirst();
    }
    public List<Formation> toutesLesFormations() { return formations; }

    public void sauvegarderOrganisme(OrganismeFormation o) { organismes.add(o); }
    public List<OrganismeFormation> tousLesOrganismes() { return organismes; }

    public List<Inscription> tousLesInscriptions() {
        return inscriptions;
    }
}