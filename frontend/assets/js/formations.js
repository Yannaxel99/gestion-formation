/**
 * CHARGER LA LISTE DES FORMATIONS
 */
async function loadFormations() {
    const formations = await apiGet("/formations");
    const table = document.getElementById("formationsTable");
    const totalCount = document.getElementById("totalCount");

    // ✅ OPTION 1 : Mise à jour du compteur dynamique
    if (totalCount) {
        totalCount.innerText = formations.length;
    }

    table.innerHTML = "";

    formations.forEach(f => {
        // ✅ On génère des lignes avec le style "Badge" et des boutons d'icônes
        table.innerHTML += `
            <tr>
                <td class="ps-4">
                    <span class="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3 py-2">
                        #${f.numeroFormation}
                    </span>
                </td>
                <td class="fw-bold">${f.nomFormation}</td>
                <td class="text-muted small">${f.contenuTexte}</td>
                <td class="text-end pe-4">
                    <div class="btn-group">
                        <a href="edit.html?id=${f.numeroFormation}" class="btn btn-sm btn-outline-warning" title="Modifier">
                            <i class="bi bi-pencil"></i>
                        </a>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteFormation(${f.numeroFormation})" title="Supprimer">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
    });
}

/**
 * AJOUTER UNE FORMATION
 */
async function addFormation() {
    const data = {
        numeroFormation: parseInt(document.getElementById("num").value),
        nomFormation: document.getElementById("nom").value,
        contenuTexte: document.getElementById("contenu").value
    };

    try {
        await apiPost("/formations", data);
        alert("✅ Formation ajoutée avec succès !");
        window.location.href = "list.html";
    } catch (error) {
        alert("❌ Erreur lors de l'ajout.");
        console.error(error);
    }
}

/**
 * PRÉ-REMPLIR LE FORMULAIRE DE MODIFICATION
 */
async function loadFormationForEdit() {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) return;

    const formations = await apiGet("/formations");
    const f = formations.find(x => x.numeroFormation == id);

    if (f) {
        document.getElementById("num").value = f.numeroFormation;
        document.getElementById("nom").value = f.nomFormation;
        document.getElementById("contenu").value = f.contenuTexte;

        // On bloque le changement du numéro si c'est ta clé primaire
        document.getElementById("num").setAttribute("readonly", true);
    }
}

/**
 * METTRE À JOUR UNE FORMATION
 */
async function updateFormation() {
    const data = {
        numeroFormation: parseInt(document.getElementById("num").value),
        nomFormation: document.getElementById("nom").value,
        contenuTexte: document.getElementById("contenu").value
    };

    try {
        await apiPost("/formations", data);
        alert("✨ Formation mise à jour !");
        window.location.href = "list.html";
    } catch (error) {
        alert("❌ Erreur lors de la mise à jour.");
    }
}

/**
 * BONUS : SUPPRIMER UNE FORMATION (Si ton API le permet)
 */
async function deleteFormation(id) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette formation ?")) {
        // Note : Adapte l'URL selon ton API (ex: /formations/delete/id)
        // await apiDelete(`/formations/${id}`);
        alert("Fonction de suppression à lier avec votre API !");
        loadFormations(); // Recharger la liste
    }
}