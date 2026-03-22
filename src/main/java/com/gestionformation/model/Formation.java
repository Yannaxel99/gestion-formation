package com.gestionformation.model;

import java.util.ArrayList;
import java.util.List;

public class Formation {

    private int numeroFormation;
    private String nomFormation;
    private String contenuTexte;

    private List<Contenu> contenus;
    private List<OrganismeFormation> organismes;

    public Formation() {
        this.contenus = new ArrayList<>();
        this.organismes = new ArrayList<>();
    }

    public Formation(int numeroFormation, String nomFormation, String contenuTexte) {
        this.numeroFormation = numeroFormation;
        this.nomFormation = nomFormation;
        this.contenuTexte = contenuTexte;
        this.contenus = new ArrayList<>();
        this.organismes = new ArrayList<>();
    }

    public void afficher() {
        System.out.println("model.Formation #" + numeroFormation + " | Nom: " + nomFormation);
        System.out.println("model.Contenu: " + contenuTexte);
    }

    public void ajouterContenu(Contenu contenu) {
        contenus.add(contenu);
    }

    public void ajouterOrganisme(OrganismeFormation organisme) {
        organismes.add(organisme);
    }

    // Getters & Setters
    public int getNumeroFormation() { return numeroFormation; }
    public void setNumeroFormation(int numeroFormation) { this.numeroFormation = numeroFormation; }

    public String getNomFormation() { return nomFormation; }
    public void setNomFormation(String nomFormation) { this.nomFormation = nomFormation; }

    public String getContenuTexte() { return contenuTexte; }
    public void setContenuTexte(String contenuTexte) { this.contenuTexte = contenuTexte; }

    public List<Contenu> getContenus() { return contenus; }
    public List<OrganismeFormation> getOrganismes() { return organismes; }
}