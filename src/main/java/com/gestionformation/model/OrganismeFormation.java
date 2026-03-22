package com.gestionformation.model;

import java.util.ArrayList;
import java.util.List;

public class OrganismeFormation {

    private int idOrganisme;
    private String nom;
    private String adresse;

    private List<Formation> formations;

    public OrganismeFormation() {
        this.formations = new ArrayList<>();
    }

    public OrganismeFormation(int idOrganisme, String nom, String adresse) {
        this.idOrganisme = idOrganisme;
        this.nom = nom;
        this.adresse = adresse;
        this.formations = new ArrayList<>();
    }

    public void afficher() {
        System.out.println("Organisme #" + idOrganisme + " | Nom: " + nom + " | Adresse: " + adresse);
    }

    public void ajouterFormation(Formation formation) {
        formations.add(formation);
    }

    // Getters & Setters
    public int getIdOrganisme() { return idOrganisme; }
    public void setIdOrganisme(int idOrganisme) { this.idOrganisme = idOrganisme; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }

    public List<Formation> getFormations() { return formations; }
}