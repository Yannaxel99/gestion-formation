package com.gestionformation.model;

public class Contenu {

    private int numeroContenu;
    private String description;

    public Contenu() {}

    public Contenu(int numeroContenu, String description) {
        this.numeroContenu = numeroContenu;
        this.description = description;
    }

    public void afficher() {
        System.out.println("model.Contenu #" + numeroContenu + " : " + description);
    }

    // Getters & Setters
    public int getNumeroContenu() { return numeroContenu; }
    public void setNumeroContenu(int numeroContenu) { this.numeroContenu = numeroContenu; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}