// ==========================================
// Brintha Builders - Featured Projects (Home Page)
// js/home-projects.js
// ==========================================
// Pulls the 3 most recent projects from Firestore (added via the admin
// dashboard) and displays them here. If Firestore has no projects yet,
// this section stays empty until real projects are added.

import { db, collection, getDocs, query, orderBy, limit } from "../firebase/firebase.js";

const STATUS_BADGE = {
  Completed: "bg-success",
  Ongoing: "bg-primary",
  Renovation: "bg-warning text-dark",
};

function buildCard(id, data, index) {
  const statusClass = STATUS_BADGE[data.status] || "bg-secondary";

  const col = document.createElement("div");
  col.className = "col-md-6 col-lg-4 mb-4";
  col.innerHTML = `
    <div class="project-card" data-aos="fade-up" data-aos-delay="${index * 100}">
      <img src="${data.image || 'images/img1.jpg'}" class="img-fluid" alt="${data.title || 'Project'}" onerror="this.style.display='none'">
      <div class="project-content">
        <span class="badge ${statusClass}">${data.status || ''}</span>
        <h4>${data.title || 'Untitled Project'}</h4>
        <p><i class="fas fa-location-dot"></i> ${data.location || ''}</p>
        <p>${data.description || ''}</p>
        <a href="project-details.html?id=${id}" class="btn btn-warning btn-sm">View Details</a>
      </div>
    </div>
  `;
  return col;
}

async function loadFeaturedProjects() {
  const grid = document.getElementById("featuredProjectsGrid");
  if (!grid) return;

  try {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"), limit(3));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return; // no projects added yet

    grid.innerHTML = "";
    let i = 0;
    snapshot.forEach((docSnap) => {
      grid.appendChild(buildCard(docSnap.id, docSnap.data(), i));
      i++;
    });
  } catch (error) {
    console.warn("Could not load featured projects from Firestore:", error.message);
  }
}

loadFeaturedProjects();
