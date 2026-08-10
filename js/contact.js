/ ==========================================
// Brintha Builders - Contact Form
// js/contact.js
// ==========================================
 
import { db, collection, addDoc, serverTimestamp } from "../firebase/firebase.js";
 
// ==========================================
// EmailJS setup — sends you an email whenever someone submits this form.
// Reuses the same EmailJS account as the quote form.
// Suggested template variables: {{from_name}} {{from_email}} {{phone}} {{message}}
// ==========================================
const EMAILJS_SERVICE_ID = "service_koe0ag5";
const EMAILJS_TEMPLATE_ID = "template_zeuljhb";
const EMAILJS_PUBLIC_KEY = "lrmKQw3qGVVwAL11X";
 
emailjs.init(EMAILJS_PUBLIC_KEY);
 
const contactForm = document.getElementById("contactForm");
const contactStatus = document.getElementById("contactStatus");
 
if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
 
    const submitBtn = contactForm.querySelector("button[type='submit']");
    const data = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      message: document.getElementById("message").value.trim(),
      createdAt: serverTimestamp(),
      status: "new",
    };
 
    contactStatus.textContent = "";
    contactStatus.className = "mt-3";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
    }
 
    try {
      await addDoc(collection(db, "messages"), data);
 
      if (window.emailjs) {
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          from_name: data.name,
          from_email: data.email,
          phone: data.phone,
          message: data.message,
        }).catch((err) => console.warn("EmailJS notification failed:", err));
      }
 
      contactStatus.classList.add("text-success");
      contactStatus.textContent = "Thanks! Your message has been sent. We'll get back to you soon.";
      contactForm.reset();
    } catch (error) {
      contactStatus.classList.add("text-danger");
      contactStatus.textContent = "Something went wrong sending your message. Please try again.";
      console.error("Contact form error:", error);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message";
      }
    }
  });
}
 
