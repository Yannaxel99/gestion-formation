package com.gestionformation.model;

public class Employe {

    private int numeroEmploye;
    private String nom;
    private String adresse;

    public Employe() {}

    public Employe(int numeroEmploye, String nom, String adresse) {
        this.numeroEmploye = numeroEmploye;
        this.nom = nom;
        this.adresse = adresse;
    }

    public void afficher() {
        System.out.println("Employé #" + numeroEmploye + " | Nom: " + nom + " | Adresse: " + adresse);
    }

    // Getters & Setters
    public int getNumeroEmploye() { return numeroEmploye; }
    public void setNumeroEmploye(int numeroEmploye) { this.numeroEmploye = numeroEmploye; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }
}