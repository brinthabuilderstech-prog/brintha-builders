// ==========================================
// Brintha Builders V2.0
// main.js
// ==========================================

// ==========================================
// Broken image fallback
// ==========================================
// If an image file is missing (e.g. a project photo not uploaded yet),
// hide it instead of showing the browser's broken-image icon.
document.querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", function handleImgError() {
        this.style.display = "none";
        this.removeEventListener("error", handleImgError);
    });
});

// Loader
window.addEventListener("load", () => {
    const loader = document.getElementById("loader");

    if (loader) {
        loader.style.opacity = "0";

        setTimeout(() => {
            loader.style.display = "none";
        }, 500);
    }
});

// ==========================================
// Hero background video crossfade (any number of videos)
// ==========================================
(function heroVideoBg() {
    const videos = Array.from(document.querySelectorAll("#hero .hero-video-bg"));
    if (!videos.length) return;

    let activeIndex = 0;
    let switching = false;

    // If a video file is missing/broken, drop it from rotation so the
    // static background-image on #hero shows through as a fallback.
    videos.forEach((v) => {
        v.addEventListener("error", () => v.remove());
    });

    function nextAvailableIndex(fromIndex) {
        for (let step = 1; step <= videos.length; step++) {
            const idx = (fromIndex + step) % videos.length;
            if (document.body.contains(videos[idx])) return idx;
        }
        return null; // only 1 (or 0) videos left - it just keeps looping via the loop attribute
    }

    function preloadUpcoming(idx) {
        const v = videos[idx];
        if (v && v.preload !== "auto") {
            v.preload = "auto";
            v.load();
        }
    }

    function crossfadeToIndex(idx) {
        const current = videos[activeIndex];
        const next = videos[idx];
        if (!next || !document.body.contains(next)) return;

        next.currentTime = 0;
        next.play().catch(() => {});
        next.classList.add("active");
        current.classList.remove("active");
        activeIndex = idx;
        switching = false;
    }

    videos.forEach((v, i) => {
        v.addEventListener("timeupdate", () => {
            if (i !== activeIndex || !v.duration) return;
            const remaining = v.duration - v.currentTime;

            // Start loading the next video ~3s before it's needed (saves data - nothing
            // downloads until it's actually about to be shown).
            if (remaining < 3) {
                const nextIdx = nextAvailableIndex(i);
                if (nextIdx !== null) preloadUpcoming(nextIdx);
            }

            // Crossfade just before this video loops.
            if (remaining < 0.3 && !switching) {
                switching = true;
                const nextIdx = nextAvailableIndex(i);
                if (nextIdx !== null) {
                    crossfadeToIndex(nextIdx);
                } else {
                    switching = false; // only one video available, nothing to switch to
                }
            }
        });
    });
})();

// ==========================================
// Sticky Navbar
// ==========================================

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {

    if (window.scrollY > 80) {

        navbar.classList.add("scrolled");

    } else {

        navbar.classList.remove("scrolled");

    }

});

// ==========================================
// Animated Counter
// ==========================================

const counters = document.querySelectorAll(".counter");

const counterObserver = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            const counter = entry.target;

            const target = +counter.dataset.target;

            let count = 0;

            const speed = target / 120;

            const update = () => {

                count += speed;

                if (count < target) {

                    counter.innerText = Math.ceil(count);

                    requestAnimationFrame(update);

                } else {

                    counter.innerText = target + "+";

                }

            };

            update();

            counterObserver.unobserve(counter);

        }

    });

}, {

    threshold: 0.5

});

counters.forEach(counter => {

    counterObserver.observe(counter);

});

// ==========================================
// Scroll To Top
// ==========================================

const scrollBtn = document.getElementById("scrollTop");

window.addEventListener("scroll", () => {

    if (window.scrollY > 400) {

        scrollBtn.style.display = "flex";

    } else {

        scrollBtn.style.display = "none";

    }

});

scrollBtn.addEventListener("click", () => {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

});

// ==========================================
// Smooth Scroll
// ==========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener("click", function (e) {

        e.preventDefault();

        const target = document.querySelector(this.getAttribute("href"));

        if (target) {

            target.scrollIntoView({

                behavior: "smooth"

            });

        }

    });

});

// ==========================================
// Active Navbar
// ==========================================

const sections = document.querySelectorAll("section");

const navLinks = document.querySelectorAll(".nav-link");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 120;

        const sectionHeight = section.clientHeight;

        if (pageYOffset >= sectionTop) {

            current = section.getAttribute("id");

        }

    });

    navLinks.forEach(link => {

        link.classList.remove("active");

        if (link.getAttribute("href") === "#" + current) {

            link.classList.add("active");

        }

    });

});

// ==========================================
// Reveal Animation
// ==========================================

const revealElements = document.querySelectorAll(

".service-card,.project-card,.testimonial-card,.process-box,.stat-card"

);

const revealObserver = new IntersectionObserver(entries => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.style.opacity = "1";

            entry.target.style.transform = "translateY(0)";

        }

    });

}, {

    threshold: 0.2

});

revealElements.forEach(item => {

    item.style.opacity = "0";

    item.style.transform = "translateY(40px)";

    item.style.transition = ".8s";

    revealObserver.observe(item);

});

// ==========================================
// Hero Image Float
// ==========================================

const heroImage = document.querySelector(".hero-image");

if (heroImage) {

    window.addEventListener("mousemove", e => {

        const x = (window.innerWidth / 2 - e.pageX) / 60;

        const y = (window.innerHeight / 2 - e.pageY) / 60;

        heroImage.style.transform =
            `translate(${x}px, ${y}px)`;

    });

}

// ==========================================
// Navbar Collapse
// ==========================================

const navItems = document.querySelectorAll(".navbar-nav .nav-link");

const navbarCollapse = document.querySelector(".navbar-collapse");

navItems.forEach(item => {

    item.addEventListener("click", () => {

        if (navbarCollapse.classList.contains("show")) {

            new bootstrap.Collapse(navbarCollapse).hide();

        }

    });

});

// ==========================================
// Current Year
// ==========================================

const year = document.getElementById("year");

if (year) {

    year.textContent = new Date().getFullYear();

}

// ==========================================
// Lazy Loading
// ==========================================

document.querySelectorAll("img").forEach(img => {

    img.setAttribute("loading", "lazy");

});

// ==========================================
// Initialize AOS
// ==========================================

if (typeof AOS !== "undefined") {

    AOS.init({

        duration: 1000,

        once: true,

        offset: 100

    });

}

console.log("Brintha Builders V2.0 Loaded Successfully");