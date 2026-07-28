// ==========================================
// Brintha Builders - Projects Load, Filter & Search
// js/projects.js
// ==========================================

import { db, collection, getDocs, query, orderBy } from "../firebase/firebase.js";

const grid = document.getElementById("projectsGrid");
const filterButtons = document.querySelectorAll(".filter-btn");
const searchInput = document.getElementById("projectSearch");

let activeFilter = "all";

const STATUS_BADGE = {
  Completed: "bg-success",
  Ongoing: "bg-primary",
  Renovation: "bg-warning text-dark",
};

function buildCard(id, data) {
  const category = (data.category || "residential").toLowerCase();
  const statusClass = STATUS_BADGE[data.status] || "bg-secondary";

  const col = document.createElement("div");
  col.className = `col-lg-4 col-md-6 mb-4 project-item ${category}`;
  col.innerHTML = `
    <div class="project-card">
      <img src="${data.image || 'images/img1.jpg'}" alt="${data.title || 'Project'}" onerror="this.style.display='none'">
      <div class="project-content">
        <span class="badge ${statusClass}">${data.status || ''}</span>
        <h4>${data.title || 'Untitled Project'}</h4>
        <p><i class="fas fa-location-dot"></i> ${data.location || ''}</p>
        <p>${data.description || ''}</p>
        <a href="project-details.html?id=${id}" class="btn btn-warning">View Project</a>
      </div>
    </div>
  `;
  return col;
}

async function loadDynamicProjects() {
  try {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    snapshot.forEach((docSnap) => {
      grid.appendChild(buildCard(docSnap.id, docSnap.data()));
    });
  } catch (error) {
    console.warn("Could not load projects from Firestore:", error.message);
  }

  applyFilters();
}

function applyFilters() {
  const searchTerm = (searchInput?.value || "").trim().toLowerCase();
  const items = document.querySelectorAll(".project-item");

  items.forEach((item) => {
    const matchesFilter = activeFilter === "all" || item.classList.contains(activeFilter);
    const text = item.textContent.toLowerCase();
    const matchesSearch = searchTerm === "" || text.includes(searchTerm);

    item.style.display = matchesFilter && matchesSearch ? "" : "none";
  });
}

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => {
      b.classList.remove("btn-warning");
      b.classList.add("btn-outline-warning");
    });
    btn.classList.remove("btn-outline-warning");
    btn.classList.add("btn-warning");

    activeFilter = btn.dataset.filter;
    applyFilters();
  });
});

if (searchInput) {
  searchInput.addEventListener("input", applyFilters);
}

if (grid) {
  loadDynamicProjects();
}
