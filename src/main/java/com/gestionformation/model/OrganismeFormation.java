package com.gestionformation.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "organismes_formation")
public class OrganismeFormation {

    @Id
    @Column(name = "id_organisme")
    private int idOrganisme;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String adresse;

    // BUG CORRIGÉ #1 : l'ancienne version utilisait @OneToMany + @JoinColumn(name="organisme_id")
    // ce qui créait une colonne FK dans la table "formations" EN PLUS de la table de jointure
    // "formation_organisme" définie dans Formation.java → mapping contradictoire et corruption
    // des données. La correction utilise mappedBy="organismes" pour indiquer que Formation
    // est le côté propriétaire (owner) de la relation ManyToMany.
    @ManyToMany(mappedBy = "organismes", fetch = FetchType.LAZY)
    private List<Formation> formations = new ArrayList<>();

    public OrganismeFormation() {}

    public OrganismeFormation(int idOrganisme, String nom, String adresse) {
        this.idOrganisme = idOrganisme;
        this.nom = nom;
        this.adresse = adresse;
    }

    public void afficher() {
        System.out.println("Organisme #" + idOrganisme + " | " + nom + " | " + adresse);
    }

    public void ajouterFormation(Formation formation) { formations.add(formation); }

    public int getIdOrganisme() { return idOrganisme; }
    public void setIdOrganisme(int idOrganisme) { this.idOrganisme = idOrganisme; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }
    public List<Formation> getFormations() { return formations; }
}