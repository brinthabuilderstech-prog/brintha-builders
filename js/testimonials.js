// ==========================================
// Brintha Builders - Testimonials
// js/testimonials.js
// ==========================================

import {
  db,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "../firebase/firebase.js";

const row = document.getElementById("testimonialsRow");
const reviewForm = document.getElementById("reviewForm");
const reviewStatus = document.getElementById("reviewStatus");

function starString(rating) {
  const n = Number(rating) || 5;
  return "★".repeat(n) + "☆".repeat(5 - n);
}

function buildCard(data) {
  const col = document.createElement("div");
  col.className = "col-lg-4 mb-4";
  col.innerHTML = `
    <div class="testimonial-card">
      <i class="fas fa-circle-user" style="font-size:60px;color:#ccc;"></i>
      <h5>${data.name || "Anonymous"}</h5>
      <div class="stars">${starString(data.rating)}</div>
      <p>${data.message || ""}</p>
    </div>
  `;
  return col;
}

async function loadApprovedTestimonials() {
  if (!row) return;

  try {
    const q = query(
      collection(db, "testimonials"),
      where("approved", "==", true)
    );
    const snapshot = await getDocs(q);
    const docs = snapshot.docs
      .map((docSnap) => docSnap.data())
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    docs.forEach((data) => {
      row.appendChild(buildCard(data));
    });
  } catch (error) {
    console.warn("Could not load testimonials from Firestore:", error.message);
  }
}

if (reviewForm) {
  reviewForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = reviewForm.querySelector("button[type='submit']");
    const data = {
      name: document.getElementById("reviewName").value.trim(),
      rating: Number(document.getElementById("reviewRating").value),
      message: document.getElementById("reviewMessage").value.trim(),
      approved: false,
      createdAt: serverTimestamp(),
    };

    reviewStatus.textContent = "";
    reviewStatus.className = "mt-3 text-center";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";
    }

    try {
      await addDoc(collection(db, "testimonials"), data);
      reviewStatus.classList.add("text-success");
      reviewStatus.textContent = "Thanks for your review! It will appear once approved.";
      reviewForm.reset();
    } catch (error) {
      reviewStatus.classList.add("text-danger");
      reviewStatus.textContent = "Something went wrong submitting your review. Please try again.";
      console.error("Review submit error:", error);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Review";
      }
    }
  });
}

loadApprovedTestimonials();
