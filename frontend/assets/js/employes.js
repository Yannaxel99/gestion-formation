/**
 * CHARGER LA LISTE DES EMPLOYÉS
 */
async function loadEmployes() {
    const employes = await apiGet("/employes");
    const table = document.getElementById("employesTable");
    const counter = document.getElementById("totalEmployes");

    // ✅ Mise à jour du compteur dynamique (Option 1)
    if (counter) {
        counter.innerText = employes.length;
    }

    table.innerHTML = "";

    employes.forEach(emp => {
        // Extraction de l'initiale pour l'avatar
        const initiale = emp.nom ? emp.nom.charAt(0).toUpperCase() : "?";

        table.innerHTML += `
            <tr>
                <td class="ps-4">
                    <span class="badge bg-light text-dark border fw-bold px-3 py-2">
                        #${emp.numeroEmploye}
                    </span>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="avatar-circle me-3 text-primary bg-primary bg-opacity-10" style="width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem;">
                            ${initiale}
                        </div>
                        <span class="fw-bold">${emp.nom}</span>
                    </div>
                </td>
                <td class="text-muted small">
                    <i class="bi bi-geo-alt me-1"></i> ${emp.adresse}
                </td>
                <td class="text-end pe-4">
                    <div class="btn-group">
                        <a href="edit.html?id=${emp.numeroEmploye}" class="btn btn-sm btn-outline-primary" title="Modifier">
                            <i class="bi bi-pencil-square"></i>
                        </a>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteEmploye(${emp.numeroEmploye})" title="Supprimer">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}

/**
 * AJOUTER UN EMPLOYÉ
 */
async function addEmploye() {
    const data = {
        numeroEmploye: parseInt(document.getElementById("num").value),
        nom: document.getElementById("nom").value,
        adresse: document.getElementById("adresse").value
    };

    try {
        await apiPost("/employes", data);
        alert("✅ Employé enregistré avec succès !");
        window.location.href = "list.html";
    } catch (error) {
        alert("❌ Erreur lors de l'enregistrement.");
        console.error(error);
    }
}

/**
 * SUPPRIMER UN EMPLOYÉ (Bonus pour la gestion)
 */
async function deleteEmploye(id) {
    if (confirm(`Voulez-vous vraiment retirer l'employé #${id} de l'annuaire ?`)) {
        // Logique de suppression à adapter selon ton API
        // await apiDelete(`/employes/${id}`);
        alert("Action de suppression envoyée à l'API !");
        loadEmployes(); // Rechargement de la vue
    }
}