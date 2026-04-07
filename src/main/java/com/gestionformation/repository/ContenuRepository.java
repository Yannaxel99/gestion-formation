package com.gestionformation.repository;

// BUG CORRIGÉ #5 : ContenuRepository était absent alors que l'entité Contenu existe.
// Sans ce repository, aucune requête directe sur les contenus n'est possible
// (findAll, findById, deleteById, etc.). La cascade ALL depuis Formation permet
// les sauvegardes, mais pas les lectures ou suppressions indépendantes.
import com.gestionformation.model.Contenu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContenuRepository extends JpaRepository<Contenu, Integer> {}