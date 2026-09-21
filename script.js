/**
 * MOHIT PRAJAPATI — MINIMALIST SNAP PORTFOLIO SCRIPT
 * Side Dot Nav Controller, Section IntersectionObserver, Theme Switcher,
 * Bootstrap Toast, Real Form Delivery & Keyboard Navigation
 */

document.addEventListener('DOMContentLoaded', () => {
  const scrollContainer = document.getElementById('scrollContainer');
  const sections = document.querySelectorAll('.snap-section');
  const dotItems = document.querySelectorAll('.side-dot-nav .dot-item');

  // -------------------------------------------------------------------------
  // 1. SMOOTH SCROLL FOR SIDE DOT NAVIGATION
  // -------------------------------------------------------------------------
  const scrollToTarget = (targetId) => {
    const targetSection = document.querySelector(targetId);
    if (targetSection && scrollContainer) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  dotItems.forEach((dot) => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = dot.getAttribute('href');
      scrollToTarget(targetId);
    });
  });

  // -------------------------------------------------------------------------
  // 2. INTERSECTION OBSERVER FOR ACTIVE DOT SYNC
  // -------------------------------------------------------------------------
  const observerOptions = {
    root: scrollContainer,
    threshold: 0.5 // Trigger when 50% of the section is visible
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const currentId = `#${entry.target.id}`;

        dotItems.forEach((dot) => {
          if (dot.getAttribute('href') === currentId) {
            dot.classList.add('active');
          } else {
            dot.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach((section) => {
    sectionObserver.observe(section);
  });

  // -------------------------------------------------------------------------
  // 3. THEME SWITCHER (data-bs-theme="light" | "dark")
  // -------------------------------------------------------------------------
  const themeToggle = document.getElementById('themeToggle');
  const htmlRoot = document.documentElement;

  const getSavedTheme = () => {
    const saved = localStorage.getItem('mp_bs_theme');
    if (saved) return saved;
    return 'light'; // Default clean light mode
  };

  const setTheme = (theme) => {
    htmlRoot.setAttribute('data-bs-theme', theme);
    localStorage.setItem('mp_bs_theme', theme);
  };

  setTheme(getSavedTheme());

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = htmlRoot.getAttribute('data-bs-theme') || 'light';
      const next = current === 'light' ? 'dark' : 'light';
      setTheme(next);
      showToast(`Switched to ${next} mode`);
    });
  }

  // -------------------------------------------------------------------------
  // 4. BOOTSTRAP TOAST & 1-CLICK CLIPBOARD COPY
  // -------------------------------------------------------------------------
  const liveToast = document.getElementById('liveToast');
  const toastMessage = document.getElementById('toastMessage');
  let bsToast = null;

  if (liveToast) {
    bsToast = new bootstrap.Toast(liveToast, { delay: 2800 });
  }

  function showToast(msg) {
    if (toastMessage && bsToast) {
      toastMessage.textContent = msg;
      bsToast.show();
    }
  }

  const copyElements = document.querySelectorAll('[data-copy]');

  const copyText = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      showToast(`Copied "${text}" to clipboard!`);
    } catch (err) {
      showToast('Clipboard copy failed');
    }
  };

  copyElements.forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const val = el.getAttribute('data-copy');
      if (val) copyText(val);
    });
  });

  // -------------------------------------------------------------------------
  // 5. REAL EMAIL DELIVERY CONTACT FORM (Web3Forms / Fallback)
  // -------------------------------------------------------------------------
  const contactForm = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');

  if (contactForm && submitBtn) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const firstName = document.getElementById('firstName').value.trim();
      const lastName = document.getElementById('lastName').value.trim();
      const email = document.getElementById('userEmail').value.trim();
      const message = document.getElementById('userMessage').value.trim();

      const originalHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1"></i> Sending...';

      const formData = new FormData(contactForm);
      const jsonObject = Object.fromEntries(formData.entries());

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(jsonObject)
        });

        const result = await response.json();

        if (response.status === 200 && result.success) {
          showToast(`Thank you, ${firstName}! Your message has been sent.`);
          contactForm.reset();
        } else {
          // If demo key or service not configured yet, offer direct mailto fallback
          showToast(`Message prepared. Opening direct email...`);
          window.location.href = `mailto:prajapati.mohit717@gmail.com?subject=Portfolio%20Inquiry%20from%20${encodeURIComponent(firstName + ' ' + lastName)}&body=${encodeURIComponent(message + '\n\nFrom: ' + email)}`;
          contactForm.reset();
        }
      } catch (error) {
        // Network or fetch fallback
        showToast(`Opening your email client...`);
        window.location.href = `mailto:prajapati.mohit717@gmail.com?subject=Portfolio%20Inquiry%20from%20${encodeURIComponent(firstName + ' ' + lastName)}&body=${encodeURIComponent(message + '\n\nFrom: ' + email)}`;
        contactForm.reset();
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHtml;
      }
    });
  }

  // -------------------------------------------------------------------------
  // 6. KEYBOARD NAVIGATION (ArrowUp / ArrowDown / PageUp / PageDown / Home / End / J / K)
  // -------------------------------------------------------------------------
  document.addEventListener('keydown', (e) => {
    // Avoid triggering when user is actively typing in inputs or textarea
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
      return;
    }

    const visibleSections = Array.from(document.querySelectorAll('.snap-section')).filter(s => s.offsetParent !== null);
    if (!visibleSections.length || !scrollContainer) return;

    const currentScrollTop = scrollContainer.scrollTop;
    let closestIndex = 0;
    let minDiff = Infinity;

    visibleSections.forEach((section, idx) => {
      const diff = Math.abs(section.offsetTop - currentScrollTop);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });

    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'j' || e.key === 'J') {
      if (closestIndex < visibleSections.length - 1) {
        e.preventDefault();
        visibleSections[closestIndex + 1].scrollIntoView({ behavior: 'smooth' });
      }
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'k' || e.key === 'K') {
      if (closestIndex > 0) {
        e.preventDefault();
        visibleSections[closestIndex - 1].scrollIntoView({ behavior: 'smooth' });
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      visibleSections[0].scrollIntoView({ behavior: 'smooth' });
    } else if (e.key === 'End') {
      e.preventDefault();
      visibleSections[visibleSections.length - 1].scrollIntoView({ behavior: 'smooth' });
    }
  });
});
