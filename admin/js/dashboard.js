// ==========================================
// Brintha Builders - Admin Dashboard
// admin/js/dashboard.js
// ==========================================

import {
  auth,
  db,
  onAuthStateChanged,
  signOut,
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from "../../firebase/firebase.js";

const welcomeMsg = document.getElementById("welcomeMsg");
const logoutBtn = document.getElementById("logoutBtn");

// Guard: only logged-in admins may view this page
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  welcomeMsg.textContent = `Welcome back, ${user.email}`;
  loadOverview();
  loadProjects();
  loadTestimonials();
});

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
  });
}

function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function loadCollection(name, limitCount = 20) {
  try {
    const q = query(collection(db, name), orderBy("createdAt", "desc"), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data());
  } catch (error) {
    console.error(`Failed to load ${name}:`, error);
    return [];
  }
}

function renderRows(tbodyId, rows, colCount, rowBuilder) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  if (!rows.length) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="${colCount}">No records yet</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(rowBuilder).join("");
}

// ---------- Overview: quotes / messages / enquiries ----------

async function loadOverview() {
  const [quotes, messages, enquiries] = await Promise.all([
    loadCollection("quotes"),
    loadCollection("messages"),
    loadCollection("projectEnquiries"),
  ]);

  document.getElementById("statQuotes").textContent = quotes.length;
  document.getElementById("statMessages").textContent = messages.length;
  document.getElementById("statEnquiries").textContent = enquiries.length;

  renderRows("quotesBody", quotes, 5, (q) => `
    <tr>
      <td>${escapeHtml(q.name)}</td>
      <td>${escapeHtml(q.phone)}</td>
      <td>${escapeHtml(q.projectType)}</td>
      <td>${escapeHtml(q.budget)}</td>
      <td>${escapeHtml(q.location)}</td>
    </tr>
  `);

  renderRows("messagesBody", messages, 4, (m) => `
    <tr>
      <td>${escapeHtml(m.name)}</td>
      <td>${escapeHtml(m.email)}</td>
      <td>${escapeHtml(m.phone)}</td>
      <td>${escapeHtml(m.message)}</td>
    </tr>
  `);

  renderRows("enquiriesBody", enquiries, 4, (e) => `
    <tr>
      <td>${escapeHtml(e.name)}</td>
      <td>${escapeHtml(e.phone)}</td>
      <td>${escapeHtml(e.projectId)}</td>
      <td>${escapeHtml(e.message)}</td>
    </tr>
  `);
}

// ---------- Projects CRUD ----------

const projectForm = document.getElementById("projectForm");
const projectEditId = document.getElementById("projectEditId");
const projectSubmitBtn = document.getElementById("projectSubmitBtn");
const projectCancelEdit = document.getElementById("projectCancelEdit");
const pImageInput = document.getElementById("pImage");
const pImagePreviewWrap = document.getElementById("pImagePreviewWrap");
const pImagePreview = document.getElementById("pImagePreview");

// Turn a textarea (one item per line) into a clean array, and back again.
function linesToArray(text) {
  return (text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
function arrayToLines(arr) {
  return Array.isArray(arr) ? arr.join("\n") : "";
}

function updateImagePreview() {
  const path = pImageInput.value.trim();
  if (!path) {
    pImagePreviewWrap.style.display = "none";
    pImagePreview.src = "";
    return;
  }
  // Stored paths are relative to the site root (e.g. "images/villa.jpg"),
  // but this page lives in /admin, so prefix with ../ for local previews.
  const isAbsolute = /^https?:\/\//i.test(path) || path.startsWith("/");
  pImagePreview.src = isAbsolute ? path : `../${path}`;
  pImagePreviewWrap.style.display = "block";
}

if (pImageInput) {
  pImageInput.addEventListener("input", updateImagePreview);
  pImagePreview.addEventListener("error", () => {
    pImagePreviewWrap.style.display = "none";
  });
}

async function loadProjects() {
  const projects = await loadCollection("projects", 50);
  const withIds = await fetchProjectsWithIds();

  document.getElementById("statProjects").textContent = withIds.length;

  renderRows("projectsBody", withIds, 5, (p) => `
    <tr>
      <td>${escapeHtml(p.title)}</td>
      <td>${escapeHtml(p.category)}</td>
      <td>${escapeHtml(p.status)}</td>
      <td>${escapeHtml(p.location)}</td>
      <td>
        <button class="btn btn-sm btn-outline-warning me-1" data-edit-project="${p.id}">Edit</button>
        <button class="btn btn-sm btn-outline-danger" data-delete-project="${p.id}">Delete</button>
      </td>
    </tr>
  `);

  document.querySelectorAll("[data-edit-project]").forEach((btn) => {
    btn.addEventListener("click", () => startEditProject(btn.dataset.editProject, withIds));
  });
  document.querySelectorAll("[data-delete-project]").forEach((btn) => {
    btn.addEventListener("click", () => deleteProject(btn.dataset.deleteProject));
  });
}

async function fetchProjectsWithIds() {
  try {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("Failed to load projects:", error);
    return [];
  }
}

function startEditProject(id, projects) {
  const project = projects.find((p) => p.id === id);
  if (!project) return;

  projectEditId.value = id;
  document.getElementById("pTitle").value = project.title || "";
  document.getElementById("pLocation").value = project.location || "";
  document.getElementById("pMapLocation").value = project.mapLocation || "";
  document.getElementById("pCategory").value = project.category || "";
  document.getElementById("pStatus").value = project.status || "";
  document.getElementById("pYear").value = project.year || "";
  document.getElementById("pArea").value = project.area || "";
  document.getElementById("pImage").value = project.image || "";
  document.getElementById("pDescription").value = project.description || "";
  document.getElementById("pGallery").value = arrayToLines(project.gallery);
  document.getElementById("pFeatures").value = arrayToLines(project.features);
  document.getElementById("pSpecs").value = arrayToLines(project.specs);
  updateImagePreview();

  projectSubmitBtn.textContent = "Update Project";
  projectCancelEdit.style.display = "inline-block";
  document.getElementById("projects-panel").scrollIntoView({ behavior: "smooth" });
}

function resetProjectForm() {
  projectForm.reset(); // also clears pGallery, pFeatures, pSpecs (they're inside projectForm)
  projectEditId.value = "";
  projectSubmitBtn.textContent = "Add Project";
  projectCancelEdit.style.display = "none";
  updateImagePreview();
}

if (projectCancelEdit) {
  projectCancelEdit.addEventListener("click", resetProjectForm);
}

if (projectForm) {
  projectForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      title: document.getElementById("pTitle").value.trim(),
      location: document.getElementById("pLocation").value.trim(),
      mapLocation: document.getElementById("pMapLocation").value.trim(),
      category: document.getElementById("pCategory").value,
      status: document.getElementById("pStatus").value,
      year: document.getElementById("pYear").value.trim(),
      area: document.getElementById("pArea").value.trim(),
      image: document.getElementById("pImage").value.trim(),
      description: document.getElementById("pDescription").value.trim(),
      gallery: linesToArray(document.getElementById("pGallery").value),
      features: linesToArray(document.getElementById("pFeatures").value),
      specs: linesToArray(document.getElementById("pSpecs").value),
    };

    projectSubmitBtn.disabled = true;

    try {
      if (projectEditId.value) {
        await updateDoc(doc(db, "projects", projectEditId.value), data);
      } else {
        data.createdAt = serverTimestamp();
        await addDoc(collection(db, "projects"), data);
      }
      resetProjectForm();
      loadProjects();
    } catch (error) {
      alert("Could not save project. Please try again.");
      console.error("Save project error:", error);
    } finally {
      projectSubmitBtn.disabled = false;
    }
  });
}

async function deleteProject(id) {
  if (!confirm("Delete this project? This cannot be undone.")) return;
  try {
    await deleteDoc(doc(db, "projects", id));
    loadProjects();
  } catch (error) {
    alert("Could not delete project. Please try again.");
    console.error("Delete project error:", error);
  }
}

// ---------- Testimonials moderation ----------

async function loadTestimonials() {
  let items = [];
  try {
    const q = query(collection(db, "testimonials"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("Failed to load testimonials:", error);
  }

  const pendingCount = items.filter((t) => !t.approved).length;
  document.getElementById("statTestimonials").textContent = pendingCount;

  renderRows("testimonialsBody", items, 5, (t) => `
    <tr>
      <td>${escapeHtml(t.name)}</td>
      <td>${"★".repeat(Number(t.rating) || 0)}</td>
      <td>${escapeHtml(t.message)}</td>
      <td><span class="status-pill">${t.approved ? "Approved" : "Pending"}</span></td>
      <td>
        ${!t.approved ? `<button class="btn btn-sm btn-outline-warning me-1" data-approve="${t.id}">Approve</button>` : ""}
        <button class="btn btn-sm btn-outline-danger" data-delete-testimonial="${t.id}">Delete</button>
      </td>
    </tr>
  `);

  document.querySelectorAll("[data-approve]").forEach((btn) => {
    btn.addEventListener("click", () => approveTestimonial(btn.dataset.approve));
  });
  document.querySelectorAll("[data-delete-testimonial]").forEach((btn) => {
    btn.addEventListener("click", () => deleteTestimonial(btn.dataset.deleteTestimonial));
  });
}

async function approveTestimonial(id) {
  try {
    await updateDoc(doc(db, "testimonials", id), { approved: true });
    loadTestimonials();
  } catch (error) {
    alert("Could not approve testimonial. Please try again.");
    console.error("Approve testimonial error:", error);
  }
}

async function deleteTestimonial(id) {
  if (!confirm("Delete this testimonial?")) return;
  try {
    await deleteDoc(doc(db, "testimonials", id));
    loadTestimonials();
  } catch (error) {
    alert("Could not delete testimonial. Please try again.");
    console.error("Delete testimonial error:", error);
  }
}
