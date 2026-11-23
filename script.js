/* ==========================================================================
   OSARAGI — Interactive Micro-Interactions & Glass UI Controller
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initCursorSpotlight();
  initScrollReveal();
  initActiveNavAndMobileMenu();
  initGalleryTabs();
  initLightboxModal();
  initCopyEmailToast();
});

/* 1. Cursor Specular Spotlight across all Glass Cards */
function initCursorSpotlight() {
  const spotlightElements = document.querySelectorAll(".spotlight-glass");

  spotlightElements.forEach((el) => {
    const target = el.closest("[data-spotlight-group]") || el;

    target.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      el.style.setProperty("--mouse-x", `${x}px`);
      el.style.setProperty("--mouse-y", `${y}px`);
      el.style.setProperty("--spotlight-opacity", "1");
    });

    target.addEventListener("mouseleave", () => {
      el.style.setProperty("--spotlight-opacity", "0");
    });
  });
}

/* 2. Scroll Reveal Observer */
function initScrollReveal() {
  const revealEls = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  revealEls.forEach((el) => observer.observe(el));
}

/* 3. Floating Pill Navbar: Active Link Highlight & Mobile Menu */
function initActiveNavAndMobileMenu() {
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav-link");
  const navList = document.getElementById("navLinks");
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");

  const setActiveLink = (id) => {
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.dataset.section === id);
    });
  };

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveLink(entry.target.id);
          }
        });
      },
      { rootMargin: "-38% 0px -48% 0px", threshold: 0 }
    );

    sections.forEach((sec) => sectionObserver.observe(sec));
  }

  if (mobileMenuBtn && navList) {
    mobileMenuBtn.addEventListener("click", () => {
      const isOpen = navList.classList.toggle("open");
      mobileMenuBtn.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        navList.classList.remove("open");
        mobileMenuBtn.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".pill-navbar")) {
        navList.classList.remove("open");
        mobileMenuBtn.setAttribute("aria-expanded", "false");
      }
    });
  }
}

/* 4. Interactive Gallery Tabs (All / Anime / Manga) with Sliding Pill */
function initGalleryTabs() {
  const tabs = document.querySelectorAll(".gallery-tab");
  const indicator = document.querySelector(".tab-indicator");
  const groups = document.querySelectorAll(".gallery-group");

  const moveIndicator = (activeTab) => {
    if (!indicator || !activeTab) return;
    indicator.style.width = `${activeTab.offsetWidth}px`;
    indicator.style.transform = `translateX(${activeTab.offsetLeft - 5}px)`;
  };

  const activeInitial = document.querySelector(".gallery-tab.active");
  if (activeInitial) {
    requestAnimationFrame(() => moveIndicator(activeInitial));
    window.addEventListener("resize", () => {
      const current = document.querySelector(".gallery-tab.active");
      moveIndicator(current);
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const filter = tab.dataset.filter;

      tabs.forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      moveIndicator(tab);

      groups.forEach((group) => {
        const shouldShow = filter === "all" || group.dataset.group === filter;
        group.classList.toggle("is-hidden", !shouldShow);
      });
    });
  });
}

/* 5. Full-Screen Glass Lightbox Modal */
function initLightboxModal() {
  const cards = Array.from(document.querySelectorAll(".gallery-card"));
  const modal = document.getElementById("lightboxModal");
  const backdrop = document.getElementById("lightboxBackdrop");
  const closeBtn = document.getElementById("lightboxClose");
  const prevBtn = document.getElementById("lightboxPrev");
  const nextBtn = document.getElementById("lightboxNext");

  const lbImg = document.getElementById("lightboxImg");
  const lbFallback = document.getElementById("lightboxFallback");
  const lbFallbackTitle = document.getElementById("lightboxFallbackTitle");
  const lbFallbackFile = document.getElementById("lightboxFallbackFile");
  const lbTag = document.getElementById("lightboxTag");
  const lbTitle = document.getElementById("lightboxTitle");
  const lbDesc = document.getElementById("lightboxDesc");

  if (!modal || cards.length === 0) return;

  let currentIndex = 0;

  const getVisibleCards = () =>
    cards.filter((card) => !card.closest(".gallery-group")?.classList.contains("is-hidden"));

  const renderSlide = (card) => {
    const imgEl = card.querySelector("img");
    const tag = card.querySelector(".caption-tag")?.textContent || "";
    const title = card.querySelector("h4")?.textContent || "";
    const desc = card.querySelector("figcaption p")?.textContent || "";
    const src = imgEl?.getAttribute("src") || "";

    lbTag.textContent = tag;
    lbTitle.textContent = title;
    lbDesc.textContent = desc;

    if (imgEl && imgEl.classList.contains("is-missing")) {
      lbImg.classList.add("is-missing");
      lbFallback.classList.add("visible");
      lbFallbackTitle.textContent = title.toUpperCase();
      lbFallbackFile.innerHTML = `Missing file: <code>${src}</code>`;
    } else {
      lbImg.classList.remove("is-missing");
      lbFallback.classList.remove("visible");
      lbImg.src = src;
      lbImg.alt = imgEl?.alt || title;
    }
  };

  const openModal = (card) => {
    const visible = getVisibleCards();
    currentIndex = Math.max(0, visible.indexOf(card));
    renderSlide(visible[currentIndex]);
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  const stepSlide = (delta) => {
    const visible = getVisibleCards();
    if (visible.length === 0) return;
    currentIndex = (currentIndex + delta + visible.length) % visible.length;
    renderSlide(visible[currentIndex]);
  };

  cards.forEach((card) => {
    card.addEventListener("click", () => openModal(card));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(card);
      }
    });
  });

  closeBtn.addEventListener("click", closeModal);
  backdrop.addEventListener("click", closeModal);
  prevBtn.addEventListener("click", () => stepSlide(-1));
  nextBtn.addEventListener("click", () => stepSlide(1));

  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("open")) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowLeft") stepSlide(-1);
    if (e.key === "ArrowRight") stepSlide(1);
  });
}

/* 6. One-Click Copy Email & Subtle Bottom-Right Toast */
function initCopyEmailToast() {
  const copyBtn = document.getElementById("copyEmailBtn");
  const toast = document.getElementById("glassToast");
  const toastMessage = document.getElementById("toastMessage");

  if (!copyBtn || !toast) return;

  let toastTimer;

  const showToast = (msg) => {
    toastMessage.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2400);
  };

  copyBtn.addEventListener("click", async () => {
    const email = copyBtn.dataset.email || "mandarwish017@gmail.com";

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(email);
      } else {
        const tempInput = document.createElement("input");
        tempInput.value = email;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
      }
      showToast("Copied to clipboard");
    } catch {
      showToast("Copy failed");
    }
  });
}