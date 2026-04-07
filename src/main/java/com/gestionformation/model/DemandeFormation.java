package com.gestionformation.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "demandes_formation")
public class DemandeFormation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "numero_demande")
    private int numeroDemande;

    @Column(name = "date_demande", nullable = false)
    private String dateDemande;

    @Column(nullable = false)
    private String statut;

    // BUG CORRIGÉ #2 : la relation "Faire (Employe → Demande_Formation)" du diagramme
    // de classes UML était totalement absente du modèle. L'employé était chargé dans
    // le service uniquement pour vérifier son existence, mais jamais rattaché à la demande.
    // Ce champ ajoute la colonne employe_id en base et crée le lien correct.
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employe_id", nullable = false)
    private Employe employe;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "formation_id")
    private Formation formation;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "inscription_id")
    private Inscription inscription;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "demande_session",
            joinColumns = @JoinColumn(name = "demande_id"),
            inverseJoinColumns = @JoinColumn(name = "session_id")
    )
    private List<Session> sessions = new ArrayList<>();

    public DemandeFormation() {}

    public DemandeFormation(int numeroDemande, String dateDemande, String statut) {
        this.numeroDemande = numeroDemande;
        this.dateDemande = dateDemande;
        this.statut = statut;
    }

    public void demandeForm() {
        System.out.println("Demande #" + numeroDemande + " créée le " + dateDemande);
    }

    public boolean analyser() {
        return statut != null && statut.equalsIgnoreCase("acceptée");
    }

    public void ajouterSession(Session session) { sessions.add(session); }

    public int getNumeroDemande() { return numeroDemande; }
    public void setNumeroDemande(int numeroDemande) { this.numeroDemande = numeroDemande; }
    public String getDateDemande() { return dateDemande; }
    public void setDateDemande(String dateDemande) { this.dateDemande = dateDemande; }
    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
    public Employe getEmploye() { return employe; }
    public void setEmploye(Employe employe) { this.employe = employe; }
    public Formation getFormation() { return formation; }
    public void setFormation(Formation formation) { this.formation = formation; }
    public Inscription getInscription() { return inscription; }
    public void setInscription(Inscription inscription) { this.inscription = inscription; }
    public List<Session> getSessions() { return sessions; }
}