// ==========================================
// Brintha Builders - Quote Request Form
// js/quote.js
// ==========================================

import { db, collection, addDoc, serverTimestamp } from "../firebase/firebase.js";

// ==========================================
// EmailJS setup — sends you an email whenever someone submits this form.
// 1. Create a free account at https://www.emailjs.com
// 2. Add an Email Service (e.g. connect your Gmail) -> copy the Service ID
// 3. Create an Email Template -> copy the Template ID
//    Suggested template variables: {{from_name}} {{from_email}} {{phone}}
//    {{location}} {{project_type}} {{budget}} {{area}} {{start_date}} {{message}}
// 4. Account -> General -> copy your Public Key
// Paste all three values below.
// ==========================================
const EMAILJS_SERVICE_ID = "service_koe0ag5";
const EMAILJS_TEMPLATE_ID = "template_zeuljhb";
const EMAILJS_PUBLIC_KEY = "lrmKQw3qGVVwAL11X";

if (window.emailjs && EMAILJS_PUBLIC_KEY !== "lrmKQw3qGVVwAL11X") {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

const quoteForm = document.getElementById("quoteForm");
const quoteMessage = document.getElementById("quoteMessage");

if (quoteForm) {
  quoteForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = quoteForm.querySelector("button[type='submit']");
    const data = {
      name: document.getElementById("name").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      email: document.getElementById("email").value.trim(),
      location: document.getElementById("location").value.trim(),
      projectType: document.getElementById("projectType").value,
      budget: document.getElementById("budget").value,
      area: document.getElementById("area").value,
      startDate: document.getElementById("startDate").value,
      description: document.getElementById("description").value.trim(),
      createdAt: serverTimestamp(),
      status: "new",
    };

    quoteMessage.textContent = "";
    quoteMessage.className = "mt-3";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";
    }

    try {
      await addDoc(collection(db, "quotes"), data);

      if (window.emailjs && EMAILJS_PUBLIC_KEY !== "lrmKQw3qGVVwAL11X") {
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          from_name: data.name,
          from_email: data.email,
          phone: data.phone,
          location: data.location,
          project_type: data.projectType,
          budget: data.budget,
          area: data.area,
          start_date: data.startDate,
          message: data.description,
        }).catch((err) => console.warn("EmailJS notification failed:", err));
      }

      quoteMessage.classList.add("text-success");
      quoteMessage.textContent = "Thanks! Your quote request has been received. We'll contact you shortly.";
      quoteForm.reset();
    } catch (error) {
      quoteMessage.classList.add("text-danger");
      quoteMessage.textContent = "Something went wrong submitting your request. Please try again.";
      console.error("Quote form error:", error);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Quote Request";
      }
    }
  });
}
