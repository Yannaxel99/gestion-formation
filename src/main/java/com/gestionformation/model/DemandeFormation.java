package com.gestionformation.model;

import java.util.ArrayList;
import java.util.List;

public class DemandeFormation {

    private int numeroDemande;
    private String dateDemande;
    private String statut;

    private Formation formation;
    private Inscription inscription;
    private List<Session> sessions;

    public DemandeFormation() {
        this.sessions = new ArrayList<>();
    }

    public DemandeFormation(int numeroDemande, String dateDemande, String statut) {
        this.numeroDemande = numeroDemande;
        this.dateDemande = dateDemande;
        this.statut = statut;
        this.sessions = new ArrayList<>();
    }

    public void demandeForm() {
        System.out.println("Demande de formation #" + numeroDemande + " créée le " + dateDemande);
    }

    public boolean analyser() {
        System.out.println("Analyse de la demande #" + numeroDemande + " | Statut: " + statut);
        return statut != null && statut.equalsIgnoreCase("acceptée");
    }

    public void ajouterSession(Session session) {
        sessions.add(session);
    }

    // Getters & Setters
    public int getNumeroDemande() { return numeroDemande; }
    public void setNumeroDemande(int numeroDemande) { this.numeroDemande = numeroDemande; }

    public String getDateDemande() { return dateDemande; }
    public void setDateDemande(String dateDemande) { this.dateDemande = dateDemande; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public Formation getFormation() { return formation; }
    public void setFormation(Formation formation) { this.formation = formation; }

    public Inscription getInscription() { return inscription; }
    public void setInscription(Inscription inscription) { this.inscription = inscription; }

    public List<Session> getSessions() { return sessions; }
}