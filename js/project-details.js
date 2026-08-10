// ==========================================
// Brintha Builders - Project Details Loader
// js/project-details.js
// ==========================================
// Every project id is looked up live from the Firestore "projects"
// collection (created via the admin dashboard).
 
import {
  db,
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from "../firebase/firebase.js";
 
const DEFAULT_FEATURES = [
  "Modern Elevation",
  "Premium Interior",
  "Modular Kitchen",
  "Covered Car Parking",
  "CCTV Provision",
  "Landscape Garden",
  "Rain Water Harvesting",
  "Quality Electrical Works",
];
 
const DEFAULT_SPECS = [
  "RCC Framed Structure",
  "Premium Vitrified Flooring",
  "Teak Wood Main Door",
  "Premium Paint Finish",
  "Concealed Electrical Wiring",
  "Branded Plumbing Fixtures",
  "Earthquake Resistant Design",
  "Solar Power Ready",
];
 
const STATUS_BADGE = {
  Completed: "bg-success",
  Ongoing: "bg-primary",
  Renovation: "bg-warning text-dark",
};
 
function populate(project) {
  const setText = (elId, value) => {
    const el = document.getElementById(elId);
    if (el) el.textContent = value ?? "";
  };
 
  setText("projectTitle", project.title);
  setText("projectLocation", project.location);
  setText("projectType", project.type);
  setText("projectYear", project.year);
  setText("projectArea", project.area);
  setText("projectStatus", project.status);
  setText("projectDescription", project.description);
 
  renderMedia(project.image, project.video);
 
  renderGallery(project.image, project.gallery);
  renderList("projectFeaturesList", project.features, DEFAULT_FEATURES, "fas fa-check text-success");
  renderSpecs(project.specs);
  renderMap(project.mapLocation || project.location);
 
  document.title = `${project.title || "Project"} | Brintha Builders`;
}
 
function renderMedia(image, video) {
  const mainImage = document.getElementById("mainImage");
  const mainVideo = document.getElementById("mainVideo");
 
  // Video takes priority: if a video is set, show only the video.
  // Otherwise fall back to the cover photo. Never show both.
  if (video) {
    if (mainVideo) {
      mainVideo.src = video;
      mainVideo.style.display = "block";
      mainVideo.muted = true; // required by browsers for autoplay to work
      mainVideo.load();
      const playPromise = mainVideo.play();
      if (playPromise) playPromise.catch(() => {}); // ignore autoplay-blocked errors
    }
    if (mainImage) {
      mainImage.style.display = "none";
      mainImage.removeAttribute("src"); // stop the browser fetching the unused placeholder
    }
  } else {
    if (mainImage) {
      if (image) {
        mainImage.src = image;
        mainImage.style.display = "block";
      } else {
        mainImage.removeAttribute("src"); // no cover image saved — don't fetch the static placeholder
        mainImage.style.display = "none";
      }
    }
    if (mainVideo) {
      mainVideo.removeAttribute("src");
      mainVideo.style.display = "none";
    }
  }
}
 
function renderMap(address) {
  const frame = document.getElementById("projectMapFrame");
  if (!frame || !address) return;
  frame.src = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}
 
function renderGallery(mainImage, gallery) {
  const wrap = document.getElementById("galleryThumbs");
  if (!wrap) return;
 
  const images = Array.isArray(gallery) && gallery.length ? gallery : [mainImage].filter(Boolean);
  if (!images.length) {
    wrap.innerHTML = ""; // no real images saved — clear the static placeholder thumbnails
    return;
  }
 
  wrap.innerHTML = images
    .map(
      (src) => `
    <div class="col-4">
      <img src="${src}" class="img-fluid rounded shadow gallery-thumb" style="cursor:pointer;" onerror="this.closest('.col-4').style.display='none'">
    </div>
  `
    )
    .join("");
 
  wrap.querySelectorAll(".gallery-thumb").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      // Clicking a gallery thumbnail always shows that photo,
      // switching away from the video if one was playing.
      const mainImg = document.getElementById("mainImage");
      const mainVid = document.getElementById("mainVideo");
      if (mainImg) {
        mainImg.src = thumb.src;
        mainImg.style.display = "block";
      }
      if (mainVid) {
        mainVid.pause();
        mainVid.style.display = "none";
      }
    });
  });
}
 
function renderList(elId, items, fallback, iconClass) {
  const el = document.getElementById(elId);
  if (!el) return;
  const list = Array.isArray(items) && items.length ? items : fallback;
  el.innerHTML = list.map((item) => `<li><i class="${iconClass}"></i> ${item}</li>`).join("");
}
 
function renderSpecs(specs) {
  const row = document.getElementById("specsRow");
  if (!row) return;
  const list = Array.isArray(specs) && specs.length ? specs : DEFAULT_SPECS;
 
  const mid = Math.ceil(list.length / 2);
  const columns = [list.slice(0, mid), list.slice(mid)];
 
  row.innerHTML = columns
    .map(
      (col) => `
    <div class="col-md-6">
      ${col
        .map(
          (item) => `
        <div class="feature-item">
          <i class="fas fa-check-circle"></i>
          <span>${item}</span>
        </div>
      `
        )
        .join("")}
    </div>
  `
    )
    .join("");
}
 
async function renderRelatedProjects(currentId, category) {
  const wrap = document.getElementById("relatedProjects");
  if (!wrap) return;
 
  try {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"), limit(7));
    const snapshot = await getDocs(q);
 
    const others = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((p) => p.id !== currentId);
 
    // Prefer same-category projects, then fill with the rest.
    const sameCategory = others.filter((p) => p.category === category);
    const rest = others.filter((p) => p.category !== category);
    const picks = [...sameCategory, ...rest].slice(0, 3);
 
    if (!picks.length) return;
 
    wrap.innerHTML = picks
      .map((p) => {
        const statusClass = STATUS_BADGE[p.status] || "bg-secondary";
        return `
        <div class="col-lg-4 col-md-6 mb-4">
          <div class="project-card">
            <img src="${p.image || ''}" class="img-fluid" alt="${p.title || 'Project'}" onerror="this.style.display='none'">
            <div class="project-content">
              <span class="badge ${statusClass}">${p.status || ''}</span>
              <h4>${p.title || 'Untitled Project'}</h4>
              <p><i class="fas fa-location-dot"></i> ${p.location || ''}</p>
              <a href="project-details.html?id=${p.id}" class="btn btn-warning btn-sm">View Details</a>
            </div>
          </div>
        </div>
      `;
      })
      .join("");
  } catch (error) {
    console.warn("Could not load related projects:", error.message);
  }
}
 
async function loadProject() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return;
 
  try {
    const snap = await getDoc(doc(db, "projects", id));
    if (snap.exists()) {
      const data = snap.data();
      populate({
        title: data.title,
        image: data.image,
        video: data.video,
        location: data.location,
        type: data.category,
        year: data.year,
        area: data.area,
        status: data.status,
        description: data.description,
        gallery: data.gallery,
        features: data.features,
        specs: data.specs,
        mapLocation: data.mapLocation,
      });
      renderRelatedProjects(id, data.category);
    }
  } catch (error) {
    console.error("Failed to load project:", error);
  }
}
 
const enquiryForm = document.getElementById("projectEnquiryForm");
 
if (enquiryForm) {
  enquiryForm.addEventListener("submit", async (e) => {
    e.preventDefault();
 
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get("id");
    const submitBtn = enquiryForm.querySelector("button[type='submit']");
    const formData = new FormData(enquiryForm);
    const data = Object.fromEntries(formData.entries());
    data.projectId = projectId;
    data.createdAt = serverTimestamp();
    data.status = "new";
 
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
    }
 
    try {
      await addDoc(collection(db, "projectEnquiries"), data);
      enquiryForm.reset();
      alert("Thanks! Your enquiry has been sent. We'll be in touch soon.");
    } catch (error) {
      alert("Something went wrong sending your enquiry. Please try again.");
      console.error("Project enquiry error:", error);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Enquiry";
      }
    }
  });
}
 
loadProject();
 
