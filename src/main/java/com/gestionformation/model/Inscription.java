package com.gestionformation.model;

public class Inscription {

    private int idInscription;
    private String dateInscription;
    private String statut;
    private String appreciation;
    private String document;

    public Inscription() {}

    public Inscription(int idInscription, String dateInscription, String statut) {
        this.idInscription = idInscription;
        this.dateInscription = dateInscription;
        this.statut = statut;
    }

    public void valider() {
        this.statut = "Validée";
        System.out.println("model.Inscription #" + idInscription + " validée.");
    }

    public void annuler() {
        this.statut = "Annulée";
        System.out.println("model.Inscription #" + idInscription + " annulée.");
    }

    public void afficher() {
        System.out.println("model.Inscription #" + idInscription + " | Date: " + dateInscription + " | Statut: " + statut);
    }

    // Getters & Setters
    public int getIdInscription() { return idInscription; }
    public void setIdInscription(int idInscription) { this.idInscription = idInscription; }

    public String getDateInscription() { return dateInscription; }
    public void setDateInscription(String dateInscription) { this.dateInscription = dateInscription; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public String getAppreciation() { return appreciation; }
    public void setAppreciation(String appreciation) { this.appreciation = appreciation; }

    public String getDocument() { return document; }
    public void setDocument(String document) { this.document = document; }
}