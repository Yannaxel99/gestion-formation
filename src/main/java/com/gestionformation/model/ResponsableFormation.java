package com.gestionformation.model;

import java.util.ArrayList;
import java.util.List;

public class ResponsableFormation extends Employe {

    private String dateNomination;
    private List<DemandeFormation> demandes;

    public ResponsableFormation() {
        super();
        this.demandes = new ArrayList<>();
    }

    public ResponsableFormation(int numeroEmploye, String nom, String adresse, String dateNomination) {
        super(numeroEmploye, nom, adresse);
        this.dateNomination = dateNomination;
        this.demandes = new ArrayList<>();
    }

    @Override
    public void afficher() {
        super.afficher();
        System.out.println("Responsable de formation | Nommé le: " + dateNomination);
    }

    public void ajouterDemande(DemandeFormation demande) {
        demandes.add(demande);
    }

    // Getters & Setters
    public String getDateNomination() { return dateNomination; }
    public void setDateNomination(String dateNomination) { this.dateNomination = dateNomination; }

    public List<DemandeFormation> getDemandes() { return demandes; }
}