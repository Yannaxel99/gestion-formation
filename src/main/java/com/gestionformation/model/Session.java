package com.gestionformation.model;

import java.util.ArrayList;
import java.util.List;

public class Session {

    private int idSession;
    private String date;
    private float prix;

    private List<Inscription> inscriptions;

    public Session() {
        this.inscriptions = new ArrayList<>();
    }

    public Session(int idSession, String date, float prix) {
        this.idSession = idSession;
        this.date = date;
        this.prix = prix;
        this.inscriptions = new ArrayList<>();
    }

    public void afficher() {
        System.out.println("model.Session #" + idSession + " | Date: " + date + " | Prix: " + prix + " FCFA");
    }

    public void ajouterInscription(Inscription inscription) {
        inscriptions.add(inscription);
    }

    // Getters & Setters
    public int getIdSession() { return idSession; }
    public void setIdSession(int idSession) { this.idSession = idSession; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public float getPrix() { return prix; }
    public void setPrix(float prix) { this.prix = prix; }

    public List<Inscription> getInscriptions() { return inscriptions; }
}