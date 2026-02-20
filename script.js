const STORAGE_KEY = "cv_lang";
const DEFAULT_LANG = "ru";

async function loadTranslations() {
  const response = await fetch("translations.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to load translations");
  }
  return response.json();
}

function applyTranslations(lang, translations) {
  const dict = translations[lang];
  if (!dict) return;

  document.documentElement.lang = lang;

  const elements = document.querySelectorAll("[data-i18n]");
  elements.forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  const label = document.getElementById("currentLangLabel");
  if (label && dict.lang_label) {
    label.textContent = dict.lang_label;
  }
}

function setupTabs() {
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".tab-panel");
  const tabsWrap = document.querySelector(".tabs");
  let indicator = null;

  function moveIndicator(targetTab) {
    if (!tabsWrap || !indicator || !targetTab) return;
    const wrapRect = tabsWrap.getBoundingClientRect();
    const tabRect = targetTab.getBoundingClientRect();
    indicator.style.width = `${tabRect.width}px`;
    indicator.style.transform = `translateX(${tabRect.left - wrapRect.left}px)`;
  }

  if (tabsWrap) {
    indicator = document.createElement("span");
    indicator.className = "tab-indicator";
    tabsWrap.appendChild(indicator);
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      tabs.forEach((t) => t.classList.remove("active"));
      panels.forEach((p) => p.classList.remove("active"));

      tab.classList.add("active");
      const panel = document.querySelector(`.tab-panel[data-panel="${target}"]`);
      if (panel) {
        panel.classList.add("active");
      }

      moveIndicator(tab);
    });
  });

  const activeTab = document.querySelector(".tab.active");
  if (activeTab) {
    requestAnimationFrame(() => moveIndicator(activeTab));
  }

  window.addEventListener("resize", () => {
    const currentActive = document.querySelector(".tab.active");
    if (currentActive) {
      moveIndicator(currentActive);
    }
  });
}

function setupSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      event.preventDefault();

      if (href === "#home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const target = document.querySelector(href);
        if (!target) return;
        target.scrollIntoView({ behavior: "smooth" });
      }

      const nav = document.querySelector(".nav");
      if (nav && nav.classList.contains("open")) {
        nav.classList.remove("open");
      }

      const allNavLinks = document.querySelectorAll(".nav-link");
      allNavLinks.forEach((l) => l.classList.remove("nav-link--active"));
      link.classList.add("nav-link--active");
    });
  });
}

function setupNavActiveOnScroll() {
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav-link");
  if (!sections.length || !navLinks.length) return;

  function onScroll() {
    const scrollPos = window.scrollY;
    const headerHeight = document.querySelector(".site-header")?.offsetHeight || 0;

    let currentId = null;
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const offsetTop = rect.top + window.scrollY - headerHeight - 10;
      if (scrollPos >= offsetTop) {
        currentId = section.id;
      }
    });

    if (!currentId) return;

    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      if (href === `#${currentId}`) {
        link.classList.add("nav-link--active");
      } else {
        link.classList.remove("nav-link--active");
      }
    });
  }

  onScroll();
  window.addEventListener("scroll", onScroll);
}

function setupBurger() {
  const burger = document.getElementById("burger");
  const nav = document.querySelector(".nav");
  if (!burger || !nav) return;

  burger.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}

function setupSkillsReveal() {
  const skillsSection = document.querySelector(".section-skills");
  if (!skillsSection) return;

  if (!("IntersectionObserver" in window)) {
    skillsSection.classList.add("revealed");
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          skillsSection.classList.add("animate-in");
          window.setTimeout(() => {
            skillsSection.classList.add("revealed");
            skillsSection.classList.remove("animate-in");
          }, 1000);
          observer.unobserve(skillsSection);
        }
      });
    },
    { threshold: 0.25 }
  );

  observer.observe(skillsSection);
}

function setupHeroReveal() {
  const heroSection = document.querySelector(".section-hero");
  if (!heroSection) return;

  window.setTimeout(() => {
    heroSection.classList.add("revealed");
  }, 1000);
}

function setupPortfolioMore() {
  const button = document.getElementById("portfolioMoreBtn");
  const extra = document.getElementById("portfolioExtra");
  if (!button || !extra) return;

  button.addEventListener("click", () => {
    extra.classList.toggle("open");
  });
}

function setupPortfolioModal() {
  const modal = document.getElementById("portfolioModal");
  const triggers = document.querySelectorAll(".portfolio-screen");
  const closeNodes = document.querySelectorAll("[data-portfolio-close]");
  if (!modal || !triggers.length) return;

  function openModal() {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  triggers.forEach((item) => {
    item.addEventListener("click", openModal);
  });

  closeNodes.forEach((node) => {
    node.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("open")) {
      closeModal();
    }
  });
}

async function setupLanguageSwitcher() {
  const toggle = document.getElementById("langToggle");
  const menu = document.getElementById("langMenu");
  if (!toggle || !menu) return;

  const translations = await loadTranslations();

  const saved = localStorage.getItem(STORAGE_KEY);
  let currentLang = saved || DEFAULT_LANG;
  if (!translations[currentLang]) {
    currentLang = DEFAULT_LANG;
  }

  function setLang(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, currentLang);
    applyTranslations(currentLang, translations);
    window.dispatchEvent(new Event("resize"));
  }

  setLang(currentLang);

  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    menu.classList.toggle("open");
  });

  menu.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const lang = target.dataset.lang;
    if (!lang) return;
    setLang(lang);
    menu.classList.remove("open");
  });

  document.addEventListener("click", () => {
    menu.classList.remove("open");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  setupSmoothScroll();
  setupBurger();
  setupHeroReveal();
  setupSkillsReveal();
  setupPortfolioMore();
  setupPortfolioModal();
  setupNavActiveOnScroll();
  setupLanguageSwitcher().catch((err) => {
    console.error(err);
  });
});

