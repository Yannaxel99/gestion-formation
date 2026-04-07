package com.gestionformation;

import com.gestionformation.model.*;
import com.gestionformation.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Random;
import java.util.Set;

/**
 * Ce fichier s'exécute automatiquement au démarrage de Spring Boot.
 * Il insère les données initiales UNIQUEMENT si la base est vide.
 *
 * Modifications apportées :
 *  - Tous les IDs manuels sont des nombres de 3 chiffres attribués aléatoirement
 *    (plage 100–999, sans doublon) via la méthode nextId().
 *  - 5 employés sont créés (autant que de sessions disponibles).
 *  - 1 responsable de formation est également créé.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final FormationRepository         formationRepo;
    private final SessionRepository           sessionRepo;
    private final OrganismeFormationRepository organismeRepo;
    private final EmployeRepository            employeRepo;
    private final ResponsableFormationRepository responsableRepo;

    public DataInitializer(
            FormationRepository formationRepo,
            SessionRepository sessionRepo,
            OrganismeFormationRepository organismeRepo,
            EmployeRepository employeRepo,
            ResponsableFormationRepository responsableRepo) {
        this.formationRepo   = formationRepo;
        this.sessionRepo     = sessionRepo;
        this.organismeRepo   = organismeRepo;
        this.employeRepo     = employeRepo;
        this.responsableRepo = responsableRepo;
    }

    // ── Générateur d'IDs 3 chiffres uniques ──────────────────────────────────
    private final Random rng = new Random();
    private final Set<Integer> usedIds = new HashSet<>();

    /** Retourne un entier unique dans [100, 999]. */
    private int nextId() {
        int id;
        do { id = 100 + rng.nextInt(900); } while (!usedIds.add(id));
        return id;
    }

    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public void run(String... args) {

        if (formationRepo.count() == 0) {

            System.out.println(">>> Initialisation des données de départ...");

            // ── Organismes de formation ──────────────────────────────────────
            OrganismeFormation ufhb = new OrganismeFormation(
                    nextId(), "UFHB", "Abidjan Cocody");
            OrganismeFormation cfci = new OrganismeFormation(
                    nextId(), "CFCI - Centre de Formation Continue", "Abidjan Plateau");
            OrganismeFormation ina  = new OrganismeFormation(
                    nextId(), "INA - Institut National des Arts", "Abidjan Treichville");
            organismeRepo.save(ufhb);
            organismeRepo.save(cfci);
            organismeRepo.save(ina);

            // ── Formations ───────────────────────────────────────────────────
            Formation f1 = new Formation(nextId(),
                    "Développement Java & Spring Boot",
                    "Maîtrise des fondamentaux Java, programmation orientée objet, " +
                            "développement d'APIs REST avec Spring Boot et gestion de bases de données avec JPA/Hibernate.");
            Formation f2 = new Formation(nextId(),
                    "Gestion de Projet Agile & Scrum",
                    "Introduction aux méthodologies agiles, rôles Scrum (Product Owner, Scrum Master), " +
                            "organisation des sprints, rétrospectives et outils de suivi de projet.");
            Formation f3 = new Formation(nextId(),
                    "Sécurité Informatique & Cybersécurité",
                    "Identification des menaces et vulnérabilités, bonnes pratiques de sécurité, " +
                            "gestion des accès, chiffrement des données et sensibilisation aux attaques courantes.");
            Formation f4 = new Formation(nextId(),
                    "Communication Professionnelle & Prise de Parole",
                    "Techniques de communication orale et écrite en milieu professionnel, " +
                            "prise de parole en public, rédaction de rapports et conduite de réunions efficaces.");
            Formation f5 = new Formation(nextId(),
                    "Analyse de Données & Excel Avancé",
                    "Exploitation avancée d'Excel : tableaux croisés dynamiques, formules complexes, " +
                            "macros VBA, visualisation de données et initiation à Power BI.");
            Formation f6 = new Formation(nextId(),
                    "Management & Leadership",
                    "Développement des compétences managériales : motivation des équipes, " +
                            "gestion des conflits, délégation, feedback constructif et styles de leadership.");
            formationRepo.save(f1);
            formationRepo.save(f2);
            formationRepo.save(f3);
            formationRepo.save(f4);
            formationRepo.save(f5);
            formationRepo.save(f6);

            // ── Sessions ─────────────────────────────────────────────────────
            Session s1 = new Session(nextId(), "2025-09-10", 150000f);
            Session s2 = new Session(nextId(), "2025-09-25", 120000f);
            Session s3 = new Session(nextId(), "2025-10-08", 180000f);
            Session s4 = new Session(nextId(), "2025-10-20",  95000f);
            Session s5 = new Session(nextId(), "2025-11-05", 200000f);
            sessionRepo.save(s1);
            sessionRepo.save(s2);
            sessionRepo.save(s3);
            sessionRepo.save(s4);
            sessionRepo.save(s5);

            // ── Employés (autant que de sessions = 5) ────────────────────────
            Employe e1 = new Employe(nextId(), "Kouassi Yao",     "Abidjan Cocody");
            Employe e2 = new Employe(nextId(), "Bamba Aminata",   "Abidjan Yopougon");
            Employe e3 = new Employe(nextId(), "Diallo Moussa",   "Abidjan Plateau");
            Employe e4 = new Employe(nextId(), "Koné Fatou",      "Abidjan Marcory");
            Employe e5 = new Employe(nextId(), "Traoré Issouf",   "Abidjan Abobo");
            employeRepo.save(e1);
            employeRepo.save(e2);
            employeRepo.save(e3);
            employeRepo.save(e4);
            employeRepo.save(e5);

            // ── Responsable de formation ─────────────────────────────────────
            // ID fixé à 111 : facile à retenir pour la connexion.
            // On l'ajoute manuellement dans usedIds pour éviter toute collision.
            usedIds.add(111);
            ResponsableFormation resp = new ResponsableFormation(
                    111, "Dupont Jean", "Abidjan Plateau", "2023-01-15");
            responsableRepo.save(resp);

            System.out.println(">>> ✅ Données insérées avec succès :");
            System.out.println("      • 3 organismes de formation");
            System.out.println("      • 6 formations");
            System.out.println("      • 5 sessions");
            System.out.println("      • 5 employés");
            System.out.println("      • 1 responsable de formation (ID fixe : 111)");
            System.out.println("      • IDs attribués aléatoirement entre 100 et 999");

        } else {
            System.out.println(">>> Base de données déjà initialisée — aucune insertion.");
        }
    }
}