/* ═══════════════════════════════════════════════
   app.js — Logique complète de l'application
   Importé par index.html via <script src="app.js">
   ═══════════════════════════════════════════════ */

const API = "http://localhost:8080/api";
let currentUser = null;
let currentRole = null;

/* ════════════════════════════════════════════════
   API — Fonctions de communication avec le back-end
   ════════════════════════════════════════════════ */

async function apiFetch(path, opts = {}) {
  const r = await fetch(API + path, {
    headers: { "Content-Type": "application/json" },
    ...opts
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t || r.statusText);
  }
  const contentType = r.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return r.json();
  return r.text();
}

/* ════════════════════════════════════════════════
   STOCKAGE LOCAL — Données de clôture transmises par l'employé
   Clé : "cloture_dem_<numeroDemande>"
   Valeur : { appreciation, document, nom, date }
   ════════════════════════════════════════════════ */

function saveClotureDemande(numeroDemande, appreciation, document, nomFormation) {
  const data = {
    appreciation,
    document,
    nomFormation,
    dateTransmission: new Date().toLocaleDateString("fr-FR", {
      day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
    })
  };
  localStorage.setItem("cloture_dem_" + numeroDemande, JSON.stringify(data));
}

function getClotureDemande(numeroDemande) {
  const raw = localStorage.getItem("cloture_dem_" + numeroDemande);
  return raw ? JSON.parse(raw) : null;
}

const getFormations = () => apiFetch("/formations");
const getSessions   = () => apiFetch("/sessions");
const getEmployes   = () => apiFetch("/employes");
const getDemandes   = () => apiFetch("/demandes");

/* ════════════════════════════════════════════════
   NAVIGATION — Changement de vue principale
   ════════════════════════════════════════════════ */

function switchView(name) {
  document.querySelectorAll(".view-panel").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".hero-nav-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("view-" + name).classList.add("active");

  const tabMap = { dashboard: 0, catalogue: 1, connexion: 2, employe: 3, responsable: 3 };
  const btns = document.querySelectorAll(".hero-nav-btn");
  if (btns[tabMap[name]]) btns[tabMap[name]].classList.add("active");

  if (name === "catalogue")   chargerCatalogue();
  if (name === "employe")     { chargerFormationsEmp(); document.getElementById("e_date_dem").valueAsDate = new Date(); }
  if (name === "responsable") { chargerDemandes(); chargerDemandesAcceptees(); chargerSessionsInscrire(); }
}

/* ════════════════════════════════════════════════
   CONNEXION — Sélection du rôle et login
   ════════════════════════════════════════════════ */

let selectedRole = "employe";

function selRole(r) {
  selectedRole = r;
  document.getElementById("ro-employe").classList.toggle("selected", r === "employe");
  document.getElementById("ro-responsable").classList.toggle("selected", r === "responsable");
}

async function doLogin() {
  const num   = parseInt(document.getElementById("li-num").value);
  const errEl = document.getElementById("login-err");
  const btn   = document.getElementById("login-btn");
  errEl.classList.remove("show");

  if (!num || num < 100 || num > 999) {
    errEl.textContent = "Entrez un numéro valide (3 chiffres).";
    errEl.classList.add("show");
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<span class="spin-btn" style="border-top-color:#1a1d2e;"></span>';

  try {
    const employes = await getEmployes();
    const emp = employes.find(e => e.numeroEmploye === num);

    if (!emp) {
      errEl.textContent = `Employé #${num} introuvable.`;
      errEl.classList.add("show");
      return;
    }

    const isResp = !!emp.dateNomination;

    if (selectedRole === "responsable" && !isResp) {
      errEl.textContent = `#${num} est un employé, pas un responsable.`;
      errEl.classList.add("show");
      return;
    }

    if (selectedRole === "employe" && isResp) {
      errEl.textContent = `#${num} est un responsable. Choisissez le rôle Responsable.`;
      errEl.classList.add("show");
      return;
    }

    currentUser = emp;
    currentRole = selectedRole;
    afterLogin();

  } catch (e) {
    errEl.textContent = "Erreur serveur : " + e.message;
    errEl.classList.add("show");
  } finally {
    btn.disabled = false;
    btn.innerHTML = "Se connecter →";
  }
}

function afterLogin() {
  const prenom = currentUser.nom.split(" ")[0];

  // Topbar pill
  document.getElementById("app-avatar").textContent    = prenom.substring(0, 2).toUpperCase();
  document.getElementById("app-username").textContent  = currentUser.nom;
  document.getElementById("app-role-label").textContent = currentRole === "responsable" ? "Responsable" : "Employé";
  document.getElementById("user-pill").classList.add("show");
  document.getElementById("logout-btn").style.display = "flex";
  document.getElementById("login-dot").style.display  = "none";

  // Ajouter l'onglet "Mon espace" si absent
  if (!document.getElementById("nav-monespace")) {
    const nav = document.getElementById("hero-nav");
    const btn = document.createElement("button");
    btn.className = "hero-nav-btn";
    btn.id = "nav-monespace";
    btn.innerHTML = `<i class="bi bi-${currentRole === "responsable" ? "person-badge" : "person"} me-1"></i>Mon espace`;
    btn.onclick = () => switchView(currentRole === "responsable" ? "responsable" : "employe");
    nav.appendChild(btn);
  }

  // Panneau droit : résumé de l'espace
  const spaceView = currentRole === "responsable" ? "responsable" : "employe";
  const actions   = currentRole === "responsable"
    ? "<li>Instruire les demandes</li><li>Inscrire un employé à une session</li><li>Annuler / clôturer une formation</li><li>Gérer le catalogue &amp; les sessions</li>"
    : "<li>Soumettre une demande de formation</li><li>Signaler un empêchement</li><li>Clôturer ma formation</li>";

  document.getElementById("connexion-right").innerHTML = `
    <div class="space-card">
      <div class="login-section-title" style="color:#065f46;">
        <i class="fa-solid fa-circle-check"></i> Connecté en tant que ${currentRole === "responsable" ? "Responsable" : "Employé"}
      </div>
      <div style="margin-bottom:1rem;">
        <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:1.1rem;color:#1a1d2e;">${currentUser.nom}</div>
        <div style="font-size:0.82rem;color:#9ca3af;">N° ${currentUser.numeroEmploye}</div>
      </div>
      <div style="font-size:0.85rem;color:#374151;margin-bottom:1.2rem;">
        <strong style="font-family:'Syne',sans-serif;font-size:0.78rem;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:.5rem;">Vos fonctionnalités</strong>
        <ul style="padding-left:1.2rem;margin:0;line-height:2;">${actions}</ul>
      </div>
      <button class="resp-btn resp-btn-primary" onclick="switchView('${spaceView}')">
        <i class="bi bi-arrow-right-circle me-1"></i>Accéder à mon espace
      </button>
    </div>`;

  // Préremplir les champs liés à l'utilisateur connecté
  if (currentRole === "employe") {
    document.getElementById("e_emp_id").value = currentUser.numeroEmploye;
  } else {
    document.getElementById("inst_resp").value = currentUser.numeroEmploye;
  }

  showToast(`Bienvenue, ${prenom} !`);
}

function logout() {
  currentUser = null;
  currentRole = null;

  document.getElementById("user-pill").classList.remove("show");
  document.getElementById("logout-btn").style.display = "none";
  document.getElementById("login-dot").style.display  = "";
  document.getElementById("li-num").value = "";
  document.getElementById("login-err").classList.remove("show");

  const t = document.getElementById("nav-monespace");
  if (t) t.remove();

  document.getElementById("connexion-right").innerHTML = `
    <div class="space-card space-card-locked">
      <div class="locked-placeholder">
        <span class="locked-icon"><i class="fa-solid fa-lock"></i></span>
        <div class="locked-title">Votre espace personnel</div>
        <div class="locked-sub">Connectez-vous à gauche pour accéder à votre espace et à toutes les fonctionnalités associées à votre rôle.</div>
      </div>
    </div>`;

  selRole("employe");
  switchView("dashboard");
}

/* ════════════════════════════════════════════════
   STATS — Compteurs du hero
   ════════════════════════════════════════════════ */

async function chargerStats() {
  try {
    const [f, s, e, d] = await Promise.all([getFormations(), getSessions(), getEmployes(), getDemandes()]);
    document.getElementById("statFormations").textContent = f.length;
    document.getElementById("statSessions").textContent   = s.length;
    document.getElementById("statEmployes").textContent   = e.length;
    document.getElementById("statDemandes").textContent   = d.length;
  } catch (_) {}
}

/* ════════════════════════════════════════════════
   CATALOGUE — Vue publique
   ════════════════════════════════════════════════ */

async function chargerCatalogue() {
  const grid = document.getElementById("catalogueGrid");
  grid.innerHTML = `<div class="resp-empty"><div class="e-icon">📚</div>Chargement...</div>`;
  try {
    const data = await getFormations();
    if (!data.length) {
      grid.innerHTML = `<div class="resp-empty"><div class="e-icon">📭</div>Aucune formation</div>`;
      return;
    }
    grid.innerHTML = data.map(f => `
      <div class="formation-card">
        <div class="card-num">FORMATION #${f.numeroFormation}</div>
        <div class="card-name">${f.nomFormation}</div>
        <div class="card-desc-text">${f.contenuTexte || "Aucune description."}</div>
        <div class="card-footer-row">
          <span class="card-badge-pill">Disponible</span>
          ${currentRole === "employe"
            ? `<button class="btn-demander" onclick="switchView('employe');switchEmpTab('demande');document.getElementById('e_formation').value='${f.numeroFormation}'">Demander →</button>`
            : ""}
        </div>
      </div>`).join("");
  } catch (e) {
    grid.innerHTML = `<div class="resp-empty"><div class="e-icon">⚠️</div>Erreur de chargement</div>`;
  }
}

/* ════════════════════════════════════════════════
   ESPACE EMPLOYÉ
   ════════════════════════════════════════════════ */

function switchEmpTab(name, btn) {
  document.querySelectorAll("#etab-demande,#etab-inscription").forEach(p => p.classList.remove("active"));
  document.getElementById("etab-" + name).classList.add("active");
  document.querySelectorAll("#empTabs .sub-tab-btn").forEach(b => b.classList.remove("active"));
  if (btn) {
    btn.classList.add("active");
  } else {
    const idx = { demande: 0, inscription: 1 }[name];
    document.querySelectorAll("#empTabs .sub-tab-btn")[idx]?.classList.add("active");
  }
  if (name === "inscription") chargerHistoriqueDemandes();
}

async function chargerFormationsEmp() {
  const c   = document.getElementById("list_formations_emp");
  const sel = document.getElementById("e_formation");
  try {
    const data = await getFormations();
    document.getElementById("cnt_form_emp").textContent = data.length;
    sel.innerHTML = `<option value="">Sélectionner...</option>` +
      data.map(f => `<option value="${f.numeroFormation}">${f.nomFormation}</option>`).join("");
    c.innerHTML = data.map(f => `
      <div class="resp-item" onclick="document.getElementById('e_formation').value='${f.numeroFormation}'">
        <div>
          <div class="resp-item-title">${f.nomFormation}</div>
          <div class="resp-item-sub">${(f.contenuTexte || "").substring(0, 80)}${f.contenuTexte && f.contenuTexte.length > 80 ? "…" : ""}</div>
        </div>
        <span style="font-size:0.75rem;color:#9ca3af;font-family:'Syne',sans-serif;">#${f.numeroFormation}</span>
      </div>`).join("") || `<div class="resp-empty"><div class="e-icon">📭</div>Aucune formation</div>`;
  } catch (e) {
    c.innerHTML = `<div class="resp-empty"><div class="e-icon">⚠️</div>Erreur</div>`;
  }
}

async function soumettreDemandeEmp() {
  const emp  = document.getElementById("e_emp_id").value;
  const form = document.getElementById("e_formation").value;
  const date = document.getElementById("e_date_dem").value;
  const res  = document.getElementById("res_dem");

  if (!form || !date) {
    showResult(res, "<strong>⚠️ Sélectionnez une formation et une date</strong>", "error");
    return;
  }

  setBtnLoading("btnSoumettre", true);
  try {
    const d = await apiFetch("/demandes", {
      method: "POST",
      body: JSON.stringify({ idEmploye: String(emp), idFormation: String(form), dateDemande: date })
    });
    showResult(res, `<strong>✅ Demande #${d.numeroDemande} soumise !</strong>Statut : ${d.statut}`, "success");
    showToast("Demande soumise !");
    chargerStats();
  } catch (e) {
    showResult(res, `<strong>❌ Erreur</strong>${e.message}`, "error");
  } finally {
    setBtnLoading("btnSoumettre", false, "Soumettre ma demande →");
  }
}

// Résout l'ID inscription depuis un ID de demande
async function resolveInscriptionId(demandeId) {
  const demandes = await getDemandes();
  const dem = demandes.find(d => d.numeroDemande == demandeId);
  if (!dem) throw new Error(`Demande #${demandeId} introuvable.`);
  if (!dem.inscription) throw new Error(`La demande #${demandeId} n'a pas encore d'inscription associée.`);
  return dem.inscription.idInscription;
}

async function empAnnuler() {
  const demId = document.getElementById("e_ann_dem").value;
  const res   = document.getElementById("res_e_ann");
  if (!demId) { showResult(res, "<strong>⚠️ Entrez votre N° de demande</strong>", "error"); return; }

  setBtnLoading("btnEmpAnnuler", true);
  try {
    const insId = await resolveInscriptionId(demId);
    const ins   = await apiFetch(`/inscriptions/${insId}/annuler`, { method: "PUT" });
    showResult(res, `<strong>🚫 Signalé</strong>Inscription #${ins.idInscription} — ${ins.statut}`, "warning");
    showToast("Empêchement signalé");
  } catch (e) {
    showResult(res, `<strong>❌ Erreur</strong>${e.message}`, "error");
  } finally {
    setBtnLoading("btnEmpAnnuler", false, "🚫 Signaler l'empêchement");
  }
}

async function empCloturer() {
  const demId = document.getElementById("e_clo_dem").value;
  const app   = document.getElementById("e_clo_app").value;
  const doc   = document.getElementById("e_clo_doc").value;
  const res   = document.getElementById("res_e_clo");

  if (!demId || !app || !doc) {
    showResult(res, "<strong>⚠️ Remplis tous les champs et joignez l'attestation</strong>", "error");
    return;
  }

  setBtnLoading("btnEmpCloturer", true);
  try {
    const insId = await resolveInscriptionId(demId);
    const ins   = await apiFetch(`/inscriptions/${insId}/cloturer`, {
      method: "PUT",
      body: JSON.stringify({ appreciation: app, document: doc })
    });

    // Sauvegarder les données pour que le responsable les reçoive automatiquement
    const demandes    = await getDemandes();
    const dem         = demandes.find(d => d.numeroDemande == demId);
    const nomFormation = dem?.formation?.nomFormation || "Formation";
    saveClotureDemande(demId, app, doc, nomFormation);

    showResult(res, `<strong>🎓 Transmis avec succès !</strong>
      Votre appréciation et votre attestation ont bien été transmises au responsable.<br/>
      <span style="font-size:0.78rem;color:#6b7280;margin-top:4px;display:block;">
        Le responsable peut maintenant clôturer votre formation avec le N° de demande <strong>#${demId}</strong>.
      </span>`, "success");
    showToast("🎓 Données transmises au responsable !");

    // Rafraîchir l'historique si visible
    if (document.getElementById("etab-inscription").classList.contains("active")) {
      chargerHistoriqueDemandes();
    }
  } catch (e) {
    showResult(res, `<strong>❌ Erreur</strong>${e.message}`, "error");
  } finally {
    setBtnLoading("btnEmpCloturer", false, "🎓 Transmettre et clôturer");
  }
}

/* ════════════════════════════════════════════════
   HISTORIQUE DES DEMANDES DE L'EMPLOYÉ CONNECTÉ
   ════════════════════════════════════════════════ */

async function chargerHistoriqueDemandes() {
  const container = document.getElementById("historique_demandes");
  if (!container) return;

  container.innerHTML = `<div class="resp-empty" style="padding:1.5rem;">
    <div class="e-icon" style="font-size:1.4rem;">⏳</div>Chargement...
  </div>`;

  try {
    const demandes = await getDemandes();
    // Filtrer les demandes de l'employé connecté
    const mesDemandes = demandes.filter(d =>
      d.employe && d.employe.numeroEmploye == currentUser.numeroEmploye
    );

    if (!mesDemandes.length) {
      container.innerHTML = `<div class="resp-empty" style="padding:1.5rem;">
        <div class="e-icon" style="font-size:1.5rem;">📋</div>
        Vous n'avez soumis aucune demande pour le moment.
      </div>`;
      return;
    }

    container.innerHTML = mesDemandes.map(d => {
      const s = (d.statut || "").toLowerCase();
      const statusCls = s.includes("accept") ? "s-acceptee" : s.includes("refus") ? "s-refusee" : "s-attente";
      const statusIcon = s.includes("accept") ? "✅" : s.includes("refus") ? "❌" : "⏳";

      // Vérifier si des données de clôture ont été transmises
      const cloture = getClotureDemande(d.numeroDemande);
      const inscInfo = d.inscription
        ? `<div class="histo-detail"><i class="fa-solid fa-calendar-check" style="color:#8b5cf6;"></i> Inscrit — Session #${d.inscription.idInscription}</div>`
        : "";
      const clotureInfo = cloture
        ? `<div class="histo-detail histo-cloture"><i class="fa-solid fa-paper-plane" style="color:#10b981;"></i> Appréciation transmise le ${cloture.dateTransmission}</div>`
        : "";

      return `
        <div class="histo-card">
          <div class="histo-top">
            <div>
              <div class="histo-title">
                <span class="histo-num">#${d.numeroDemande}</span>
                ${d.formation ? d.formation.nomFormation : "Formation inconnue"}
              </div>
              <div class="histo-date">📅 Soumise le ${d.dateDemande || "—"}</div>
              ${inscInfo}
              ${clotureInfo}
            </div>
            <span class="resp-status ${statusCls}">${statusIcon} ${d.statut || "En attente"}</span>
          </div>
        </div>`;
    }).join("");

  } catch (e) {
    container.innerHTML = `<div class="resp-empty" style="padding:1.5rem;">
      <div class="e-icon" style="font-size:1.5rem;">⚠️</div>Impossible de charger l'historique.
    </div>`;
  }
}

/* ════════════════════════════════════════════════
   ESPACE RESPONSABLE — Navigation par onglets
   ════════════════════════════════════════════════ */

function switchRespTab(name, btn) {
  document.querySelectorAll("[id^='rtab-']").forEach(p => p.classList.remove("active"));
  document.getElementById("rtab-" + name).classList.add("active");
  document.querySelectorAll("#respTabs .sub-tab-btn").forEach(b => b.classList.remove("active"));
  if (btn) {
    btn.classList.add("active");
  } else {
    const m = { demandes: 0, inscrire: 1, annuler: 2, cloturer: 3, "catalogue-resp": 4, "sessions-resp": 5, "employes-resp": 6 };
    document.querySelectorAll("#respTabs .sub-tab-btn")[m[name]]?.classList.add("active");
  }
  if (name === "catalogue-resp") chargerListeFormations();
  if (name === "sessions-resp")  chargerListeSessions();
  if (name === "employes-resp")  chargerListeEmployes();
  if (name === "inscrire")       { chargerDemandesAcceptees(); chargerSessionsInscrire(); }
}

/* ── Demandes ── */

async function chargerDemandes() {
  const c = document.getElementById("list_demandes");
  try {
    const data = await getDemandes();
    document.getElementById("cnt_dem").textContent = data.length;
    if (!data.length) { c.innerHTML = `<div class="resp-empty"><div class="e-icon">📋</div>Aucune demande</div>`; return; }
    const sc = { "en attente": "s-attente", "acceptee": "s-acceptee", "refusee": "s-refusee" };
    c.innerHTML = data.map(d => `
      <div class="resp-item" onclick="document.getElementById('inst_id').value='${d.numeroDemande}'">
        <div>
          <div class="resp-item-title">Demande #${d.numeroDemande}</div>
          <div class="resp-item-sub">${d.employe ? d.employe.nom : "—"} • ${d.formation ? d.formation.nomFormation : "—"} • ${d.dateDemande}</div>
        </div>
        <span class="resp-status ${sc[(d.statut || "").toLowerCase()] || ""}">${d.statut}</span>
      </div>`).join("");
  } catch (e) {
    c.innerHTML = `<div class="resp-empty"><div class="e-icon">⚠️</div>Erreur</div>`;
  }
}

async function instruire(accepter) {
  const id   = document.getElementById("inst_id").value;
  const resp = document.getElementById("inst_resp").value;
  const res  = document.getElementById("res_inst");
  if (!id) { showResult(res, "<strong>⚠️ Sélectionnez une demande</strong>", "error"); return; }

  const btnId = accepter ? "btnAccepter" : "btnRefuser";
  setBtnLoading(btnId, true);
  try {
    const d = await apiFetch(`/demandes/${id}/instruire`, {
      method: "PUT",
      body: JSON.stringify({ idResponsable: String(resp), accepter: String(accepter) })
    });
    showResult(res, `<strong>${accepter ? "✅ Acceptée" : "❌ Refusée"}</strong>Demande #${d.numeroDemande} — ${d.statut}`, accepter ? "success" : "warning");
    showToast(`Demande ${accepter ? "acceptée" : "refusée"}`);
    chargerDemandes(); chargerDemandesAcceptees(); chargerStats();
  } catch (e) {
    showResult(res, `<strong>❌ Erreur</strong>${e.message}`, "error");
  } finally {
    setBtnLoading(btnId, false, accepter ? "✅ Accepter" : "❌ Refuser");
  }
}

/* ── Inscriptions ── */

async function chargerDemandesAcceptees() {
  const c = document.getElementById("list_dem_acceptees");
  try {
    const demandes = await getDemandes();
    const acc = demandes.filter(d => d.statut === "Acceptee" && !d.inscription);
    document.getElementById("cnt_acc").textContent = acc.length;
    if (!acc.length) {
      c.innerHTML = `<div class="resp-empty"><div class="e-icon">📋</div>Aucune demande acceptée sans inscription</div>`;
      return;
    }
    c.innerHTML = acc.map(d => `
      <div class="ins-dem-card" onclick="selectDemandeIns(${d.numeroDemande}, this)">
        <div class="ins-dem-header">
          <div class="ins-dem-name">
            ${d.employe ? d.employe.nom : "—"}
            <span style="font-weight:400;color:#9ca3af;font-size:0.82rem;">— #${d.employe ? d.employe.numeroEmploye : "?"}</span>
          </div>
          <span class="ins-dem-badge">Acceptée</span>
        </div>
        <div class="ins-dem-sub">📚 ${d.formation ? d.formation.nomFormation : "—"} &nbsp;•&nbsp; 📅 ${d.dateDemande}</div>
      </div>`).join("");
  } catch (e) {
    c.innerHTML = `<div class="resp-empty"><div class="e-icon">⚠️</div>Erreur</div>`;
  }
}

function selectDemandeIns(id, card) {
  document.querySelectorAll(".ins-dem-card").forEach(c => c.classList.remove("selected"));
  card.classList.add("selected");
  document.getElementById("ins_dem").value = id;
}

async function chargerSessionsInscrire() {
  document.getElementById("ins_date").valueAsDate = new Date();
  try {
    const sessions = await getSessions();
    const sel = document.getElementById("ins_ses");
    sel.innerHTML = `<option value="">Sélectionner une session...</option>` +
      sessions.map(s => `<option value="${s.idSession}">Session #${s.idSession} — ${s.date} (${s.prix.toLocaleString()} FCFA)</option>`).join("");
  } catch (_) {}
}

async function inscrire() {
  const dem  = document.getElementById("ins_dem").value;
  const ses  = document.getElementById("ins_ses").value;
  const date = document.getElementById("ins_date").value;
  const res  = document.getElementById("res_ins");
  if (!dem || !ses || !date) { showResult(res, "<strong>⚠️ Sélectionnez une demande et une session</strong>", "error"); return; }

  setBtnLoading("btnInscrire", true);
  try {
    const ins = await apiFetch("/inscriptions", {
      method: "POST",
      body: JSON.stringify({ idDemande: String(dem), idSession: String(ses), dateInscription: date })
    });
    showResult(res, `<strong>✅ Inscription #${ins.idInscription} créée !</strong>Statut : ${ins.statut}`, "success");
    showToast("Inscription créée !");
    document.getElementById("ins_dem").value = "";
    chargerDemandesAcceptees(); chargerStats();
  } catch (e) {
    showResult(res, `<strong>❌ Erreur</strong>${e.message}`, "error");
  } finally {
    setBtnLoading("btnInscrire", false, "Valider l'inscription →");
  }
}

async function annuler() {
  const demId = document.getElementById("ann_dem").value;
  const res   = document.getElementById("res_ann");
  if (!demId) { showResult(res, "<strong>⚠️ Entrez le N° de demande</strong>", "error"); return; }

  setBtnLoading("btnAnnuler", true);
  try {
    const insId = await resolveInscriptionId(demId);
    const ins   = await apiFetch(`/inscriptions/${insId}/annuler`, { method: "PUT" });
    showResult(res, `<strong>🚫 Annulée</strong>Inscription #${ins.idInscription} — ${ins.statut}`, "warning");
    showToast("Inscription annulée");
    chargerDemandesAcceptees();
  } catch (e) {
    showResult(res, `<strong>❌ Erreur</strong>${e.message}`, "error");
  } finally {
    setBtnLoading("btnAnnuler", false, "🚫 Annuler l'inscription");
  }
}

// Auto-remplissage quand le responsable entre le N° de demande
async function onCloDemandeChange() {
  const demId   = document.getElementById("clo_dem").value;
  const preview = document.getElementById("clo_preview");
  if (!demId || demId.length < 1) { if (preview) preview.style.display = "none"; return; }

  const cloture = getClotureDemande(demId);
  if (!cloture) {
    if (preview) preview.style.display = "none";
    return;
  }

  // Afficher le bandeau de données reçues
  if (preview) {
    preview.style.display = "block";
    preview.innerHTML = `
      <div style="display:flex;align-items:flex-start;gap:0.7rem;">
        <span style="font-size:1.2rem;flex-shrink:0;">📨</span>
        <div style="flex:1;">
          <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:0.85rem;color:#065f46;margin-bottom:0.5rem;">
            Données reçues de l'employé
          </div>
          <div style="font-size:0.82rem;color:#374151;margin-bottom:0.4rem;">
            <strong>Formation :</strong> ${cloture.nomFormation}
          </div>
          <div style="font-size:0.82rem;color:#374151;margin-bottom:0.4rem;">
            <strong>Appréciation :</strong> <em>"${cloture.appreciation}"</em>
          </div>
          <div style="font-size:0.82rem;color:#374151;margin-bottom:0.4rem;">
            <strong>Attestation :</strong> 📎 ${cloture.document}
          </div>
          <div style="font-size:0.75rem;color:#9ca3af;">
            Transmis le ${cloture.dateTransmission}
          </div>
        </div>
      </div>`;
  }

  // Remplir automatiquement les champs
  document.getElementById("clo_app").value = cloture.appreciation;
  // Mettre à jour le faux input fichier
  const fake = document.getElementById("clo_fake");
  if (fake) {
    fake.classList.add("has-file");
    fake.innerHTML = `<span class="fi-icon">✅</span><span class="fi-text">${cloture.document} (transmis par l'employé)</span>`;
  }
  document.getElementById("clo_doc").value = cloture.document;
}

async function cloturer() {
  const demId = document.getElementById("clo_dem").value;
  const app   = document.getElementById("clo_app").value;
  const doc   = document.getElementById("clo_doc").value;
  const res   = document.getElementById("res_clo");

  if (!demId) { showResult(res, "<strong>⚠️ Entrez le numéro de la demande</strong>", "error"); return; }
  if (!app || !doc) {
    // Essayer de charger automatiquement depuis le stockage
    const cloture = getClotureDemande(demId);
    if (!cloture) {
      showResult(res, "<strong>⚠️ Données manquantes</strong>L'employé n'a pas encore transmis son appréciation et son attestation.", "error");
      return;
    }
    document.getElementById("clo_app").value = cloture.appreciation;
    document.getElementById("clo_doc").value = cloture.document;
  }

  const appFinal = document.getElementById("clo_app").value;
  const docFinal = document.getElementById("clo_doc").value;

  setBtnLoading("btnCloturer", true);
  try {
    const insId = await resolveInscriptionId(demId);
    const ins   = await apiFetch(`/inscriptions/${insId}/cloturer`, {
      method: "PUT",
      body: JSON.stringify({ appreciation: appFinal, document: docFinal })
    });
    showResult(res, `<strong>🎓 Formation clôturée avec succès !</strong>
      Inscription #${ins.idInscription} — Statut : <strong>${ins.statut}</strong><br/>
      <span style="font-size:0.78rem;color:#6b7280;margin-top:4px;display:block;">
        Appréciation et attestation enregistrées.
      </span>`, "success");
    showToast("🎓 Formation clôturée !");
    // Effacer le bandeau preview
    const preview = document.getElementById("clo_preview");
    if (preview) preview.style.display = "none";
  } catch (e) {
    showResult(res, `<strong>❌ Erreur</strong>${e.message}`, "error");
  } finally {
    setBtnLoading("btnCloturer", false, "🎓 Clôturer la formation");
  }
}

/* ── Catalogue / Sessions / Employés ── */

async function chargerListeFormations() {
  const c = document.getElementById("list_formations_resp");
  try {
    const data = await getFormations();
    document.getElementById("cnt_for").textContent = data.length;
    c.innerHTML = data.map(f => `
      <div class="resp-item">
        <div>
          <div class="resp-item-title">${f.nomFormation}</div>
          <div class="resp-item-sub">${f.contenuTexte || ""}</div>
        </div>
        <span style="font-size:0.75rem;color:#9ca3af;font-family:'Syne',sans-serif;">#${f.numeroFormation}</span>
      </div>`).join("") || `<div class="resp-empty"><div class="e-icon">📚</div>Vide</div>`;
  } catch (e) {
    c.innerHTML = `<div class="resp-empty"><div class="e-icon">⚠️</div>Erreur</div>`;
  }
}

async function chargerListeSessions() {
  const c = document.getElementById("list_sessions_resp");
  try {
    const data = await getSessions();
    document.getElementById("cnt_ses").textContent = data.length;
    c.innerHTML = data.map(s => `
      <div class="resp-item">
        <div>
          <div class="resp-item-title">Session #${s.idSession}</div>
          <div class="resp-item-sub">${s.date}</div>
        </div>
        <span style="font-family:'Syne',sans-serif;font-weight:700;color:#e8c547;">${s.prix.toLocaleString()} FCFA</span>
      </div>`).join("") || `<div class="resp-empty"><div class="e-icon">📅</div>Vide</div>`;
  } catch (e) {
    c.innerHTML = `<div class="resp-empty"><div class="e-icon">⚠️</div>Erreur</div>`;
  }
}

async function chargerListeEmployes() {
  const c = document.getElementById("list_employes_resp");
  try {
    const data = await getEmployes();
    document.getElementById("cnt_emp").textContent = data.length;
    c.innerHTML = data.map(e => `
      <div class="resp-item">
        <div>
          <div class="resp-item-title">${e.nom}</div>
          <div class="resp-item-sub">${e.adresse}</div>
        </div>
        <span style="font-size:0.75rem;color:#9ca3af;font-family:'Syne',sans-serif;">#${e.numeroEmploye}</span>
      </div>`).join("") || `<div class="resp-empty"><div class="e-icon">👤</div>Vide</div>`;
  } catch (e) {
    c.innerHTML = `<div class="resp-empty"><div class="e-icon">⚠️</div>Erreur</div>`;
  }
}

async function ajouterFormation() {
  const id      = document.getElementById("for_id").value;
  const nom     = document.getElementById("for_nom").value;
  const contenu = document.getElementById("for_contenu").value;
  const res     = document.getElementById("res_for");
  if (!id || !nom || !contenu) { showResult(res, "<strong>⚠️ Remplis tous les champs</strong>", "error"); return; }

  setBtnLoading("btnAjouterFormation", true);
  try {
    await apiFetch("/formations", {
      method: "POST",
      body: JSON.stringify({ numeroFormation: parseInt(id), nomFormation: nom, contenuTexte: contenu })
    });
    showResult(res, `<strong>✅ "${nom}" ajoutée !</strong>`, "success");
    showToast("Formation ajoutée");
    ["for_id", "for_nom", "for_contenu"].forEach(i => document.getElementById(i).value = "");
    chargerListeFormations(); chargerStats();
  } catch (e) {
    showResult(res, `<strong>❌</strong>${e.message}`, "error");
  } finally {
    setBtnLoading("btnAjouterFormation", false, "+ Ajouter au catalogue");
  }
}

async function ajouterSession() {
  const id   = document.getElementById("ses_id").value;
  const date = document.getElementById("ses_date").value;
  const prix = document.getElementById("ses_prix").value;
  const res  = document.getElementById("res_ses");
  if (!id || !date || !prix) { showResult(res, "<strong>⚠️ Remplis tous les champs</strong>", "error"); return; }

  setBtnLoading("btnAjouterSession", true);
  try {
    await apiFetch("/sessions", {
      method: "POST",
      body: JSON.stringify({ idSession: parseInt(id), date, prix: parseFloat(prix) })
    });
    showResult(res, `<strong>✅ Session ajoutée !</strong>`, "success");
    showToast("Session ajoutée");
    ["ses_id", "ses_date", "ses_prix"].forEach(i => document.getElementById(i).value = "");
    chargerListeSessions(); chargerStats();
  } catch (e) {
    showResult(res, `<strong>❌</strong>${e.message}`, "error");
  } finally {
    setBtnLoading("btnAjouterSession", false, "+ Ajouter la session");
  }
}

async function ajouterEmploye() {
  const id  = document.getElementById("emp_id").value;
  const nom = document.getElementById("emp_nom").value;
  const adr = document.getElementById("emp_adr").value;
  const res = document.getElementById("res_emp");
  if (!id || !nom || !adr) { showResult(res, "<strong>⚠️ Remplis les champs</strong>", "error"); return; }

  setBtnLoading("btnAjouterEmploye", true);
  try {
    await apiFetch("/employes", {
      method: "POST",
      body: JSON.stringify({ numeroEmploye: parseInt(id), nom, adresse: adr })
    });
    showResult(res, `<strong>✅ "${nom}" ajouté !</strong>`, "success");
    showToast(`${nom} ajouté`);
    ["emp_id", "emp_nom", "emp_adr"].forEach(i => document.getElementById(i).value = "");
    chargerListeEmployes(); chargerStats();
  } catch (e) {
    showResult(res, `<strong>❌</strong>${e.message}`, "error");
  } finally {
    setBtnLoading("btnAjouterEmploye", false, "+ Ajouter l'employé");
  }
}

async function ajouterResponsable() {
  const id   = document.getElementById("resp_id").value;
  const nom  = document.getElementById("resp_nom").value;
  const adr  = document.getElementById("resp_adr").value;
  const date = document.getElementById("resp_date").value;
  const res  = document.getElementById("res_emp");
  if (!id || !nom || !adr || !date) { showResult(res, "<strong>⚠️ Remplis les champs</strong>", "error"); return; }

  setBtnLoading("btnAjouterResponsable", true);
  try {
    await apiFetch("/responsables", {
      method: "POST",
      body: JSON.stringify({ numeroEmploye: parseInt(id), nom, adresse: adr, dateNomination: date })
    });
    showResult(res, `<strong>✅ "${nom}" ajouté !</strong>`, "success");
    showToast("Responsable ajouté");
  } catch (e) {
    showResult(res, `<strong>❌</strong>${e.message}`, "error");
  } finally {
    setBtnLoading("btnAjouterResponsable", false, "+ Ajouter le responsable");
  }
}

/* ════════════════════════════════════════════════
   GESTION DES FICHIERS PDF
   ════════════════════════════════════════════════ */

function onFileChange(inputId, fakeId, hiddenId) {
  const file   = document.getElementById(inputId).files[0];
  const fake   = document.getElementById(fakeId);
  const hidden = document.getElementById(hiddenId);
  if (file) {
    fake.classList.add("has-file");
    fake.innerHTML = `<span class="fi-icon">✅</span><span class="fi-text">${file.name}</span>`;
    hidden.value   = file.name;
  } else {
    fake.classList.remove("has-file");
    fake.innerHTML = `<span class="fi-icon"><i class="fa-solid fa-paperclip"></i></span><span class="fi-text">Cliquer pour joindre un PDF…</span>`;
    hidden.value   = "";
  }
}

/* ════════════════════════════════════════════════
   UTILITAIRES UI
   ════════════════════════════════════════════════ */

function showResult(el, html, type) {
  el.innerHTML   = html;
  el.className   = "resp-result " + type;
}

function setBtnLoading(id, loading, label) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.disabled  = loading;
  btn.innerHTML = loading ? '<span class="spin-btn"></span>' : label;
}

function showToast(msg) {
  const el = document.createElement("div");
  el.className   = "toast-msg";
  el.textContent = msg;
  document.getElementById("toastContainer").appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

/* ════════════════════════════════════════════════
   INITIALISATION
   ════════════════════════════════════════════════ */

chargerStats();